'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, ensureSession } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { Transaction } from '@/types'
import toast from 'react-hot-toast'

function mapRow(row: Record<string, unknown>): Transaction {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    type: row.type as Transaction['type'],
    amount: row.amount as number,
    currency: row.currency as Transaction['currency'],
    category: row.category as Transaction['category'],
    description: row.description as string,
    date: row.date as string,
    accountId: row.account_id as string,
    coffreId: row.coffre_id as string | undefined,
    isRecurring: row.is_recurring as boolean,
    createdAt: row.created_at as string,
  }
}

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
      return (data || []).map(mapRow)
    },
  })

  const create = useMutation({
    mutationFn: async (tx: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
      const uid = await ensureSession()
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: uid,
          account_id: tx.accountId,
          type: tx.type,
          amount: tx.amount,
          currency: tx.currency,
          category: tx.category,
          description: tx.description,
          date: tx.date,
          coffre_id: tx.coffreId ?? null,
          is_recurring: tx.isRecurring,
        })
        .select()
        .single()
      if (error) throw error
      return mapRow(data as Record<string, unknown>)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Transaction ajoutée !')
    },
    onError: () => toast.error("Erreur lors de l'ajout"),
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Transaction supprimée')
    },
  })

  return { ...query, create, remove }
}
