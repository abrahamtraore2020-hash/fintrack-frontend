'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { Objectif } from '@/types'
import toast from 'react-hot-toast'

export function useObjectifs() {
  const { user } = useAppStore()
  const qc = useQueryClient()

  const query = useQuery<Objectif[]>({
    queryKey: ['objectifs', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('objectifs')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      return (data || []).map(o => ({
        ...o,
        progressPercent: o.target_amount > 0
          ? Math.min(Math.round((o.current_amount / o.target_amount) * 100), 100)
          : 0,
      }))
    },
  })

  const create = useMutation({
    mutationFn: async (obj: { name: string; coffreId: string; targetAmount: number; deadline: string }) => {
      const { data, error } = await supabase.from('objectifs').insert({
        user_id: user!.id,
        coffre_id: obj.coffreId,
        name: obj.name,
        target_amount: obj.targetAmount,
        deadline: obj.deadline,
        currency: 'XOF',
      }).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['objectifs'] }); toast.success('Objectif créé !') },
    onError: () => toast.error('Erreur lors de la création'),
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('objectifs').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['objectifs'] }); toast.success('Objectif supprimé') },
  })

  return { ...query, create, remove }
}
