'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { Coffre } from '@/types'
import toast from 'react-hot-toast'

function mapCoffre(row: Record<string, unknown>): Coffre {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    icon: (row.icon as string) || '💰',
    color: (row.color as string) || '#FFD700',
    targetAmount: row.target_amount as number,
    currentAmount: (row.current_amount as number) || 0,
    currency: (row.currency as any) || 'XOF',
    mode: (row.mode as any) || 'manual',
    status: (row.status as any) || 'active',
    deadline: row.deadline as string | undefined,
    createdAt: row.created_at as string,
    ...(row.rule_type ? {
      rule: {
        type: row.rule_type as any,
        value: row.rule_value as number,
        trigger: row.rule_trigger as any,
      }
    } : {}),
  }
}

type CreateCoffreInput = {
  name: string; icon: string; color: string; targetAmount: number; mode: string
  ruleType?: string; ruleValue?: number; ruleTrigger?: string
}

export function useCoffres() {
  const { user } = useAppStore()
  const qc = useQueryClient()

  const query = useQuery<Coffre[]>({
    queryKey: ['coffres', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coffres').select('*').eq('user_id', user!.id).order('created_at', { ascending: false })
      if (error) throw error
      return (data || []).map(mapCoffre)
    },
  })

  const create = useMutation({
    mutationFn: async (input: CreateCoffreInput) => {
      const payload: Record<string, unknown> = {
        user_id: user!.id, name: input.name, icon: input.icon, color: input.color,
        target_amount: input.targetAmount, current_amount: 0, currency: 'XOF',
        mode: input.mode, status: 'active',
      }
      if (input.mode !== 'manual' && input.ruleType) {
        payload.rule_type = input.ruleType
        payload.rule_value = input.ruleValue
        payload.rule_trigger = input.ruleTrigger
      }
      const { error } = await supabase.from('coffres').insert(payload)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coffres'] }); toast.success('Coffre créé !') },
    onError: (e: any) => toast.error(e.message || 'Erreur lors de la création'),
  })

  const update = useMutation({
    mutationFn: async ({ id, currentAmount }: { id: string; currentAmount: number }) => {
      const { error } = await supabase.from('coffres').update({ current_amount: currentAmount }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coffres'] }),
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('coffres').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coffres'] }); toast.success('Coffre supprimé') },
    onError: (e: any) => toast.error(e.message || 'Erreur'),
  })

  return { ...query, create, update, remove }
}
