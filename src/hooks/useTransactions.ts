'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { Transaction } from '@/types'
import toast from 'react-hot-toast'

export function useTransactions(limit = 50) {
  const { user } = useAppStore()
  const qc = useQueryClient()

  const query = useQuery<Transaction[]>({
    queryKey: ['transactions', user?.id, limit],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false })
        .limit(limit)
      return data || []
    },
  })

  const create = useMutation({
    mutationFn: async (tx: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
      const { data, error } = await supabase.from('transactions').insert({ ...tx, user_id: user!.id }).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['transactions'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); toast.success('Transaction ajoutée !') },
    onError: () => toast.error('Erreur lors de l\'ajout'),
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['transactions'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); toast.success('Transaction supprimée') },
  })

  return { ...query, create, remove }
}
