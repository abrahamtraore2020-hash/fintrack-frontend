'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, ensureSession } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { Objectif } from '@/types'
import toast from 'react-hot-toast'

function mapObjectif(row: Record<string, unknown>): Objectif {
  const target = row.target_amount as number
  const current = (row.current_amount as number) || 0
  return {
    id: row.id as string,
    userId: row.user_id as string,
    coffreId: (row.coffre_id as string) || '',
    name: row.name as string,
    targetAmount: target,
    currentAmount: current,
    currency: (row.currency as any) || 'XOF',
    deadline: row.deadline as string,
    status: (row.status as any) || 'on_track',
    progressPercent: target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0,
    aiAdvice: row.ai_advice as string | undefined,
    createdAt: row.created_at as string,
  }
}

export function useObjectifs() {
  const { user } = useAppStore()
  const qc = useQueryClient()

  const query = useQuery<Objectif[]>({
    queryKey: ['objectifs', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('objectifs').select('*').eq('user_id', user!.id).order('created_at', { ascending: false })
      if (error) throw error
      return (data || []).map(mapObjectif)
    },
  })

  const create = useMutation({
    mutationFn: async (obj: { name: string; coffreId: string; targetAmount: number; deadline: string }) => {
      const uid = await ensureSession()
      const { error } = await supabase.from('objectifs').insert({
        user_id: uid,
        coffre_id: obj.coffreId || null,
        name: obj.name,
        target_amount: obj.targetAmount,
        current_amount: 0,
        deadline: obj.deadline,
        currency: 'XOF',
        status: 'on_track',
      })
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['objectifs'] }); toast.success('Objectif cree !') },
    onError: (e: any) => toast.error(e.message || 'Erreur lors de la creation'),
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('objectifs').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['objectifs'] }); toast.success('Objectif supprime') },
    onError: (e: any) => toast.error(e.message || 'Erreur'),
  })

  return { ...query, create, remove }
}
