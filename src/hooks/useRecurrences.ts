'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import toast from 'react-hot-toast'

export type RecurrenceItem = {
  id: string
  userId: string
  name: string
  emoji: string
  amount: number
  type: 'expense' | 'income'
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  nextDate: string
  category: string
  active: boolean
  account: string
  createdAt: string
}

function mapRow(row: Record<string, unknown>): RecurrenceItem {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    emoji: row.emoji as string,
    amount: row.amount as number,
    type: row.type as RecurrenceItem['type'],
    frequency: row.frequency as RecurrenceItem['frequency'],
    nextDate: row.next_date as string,
    category: row.category as string,
    active: row.active as boolean,
    account: row.account as string,
    createdAt: row.created_at as string,
  }
}

export function useRecurrences() {
  const { user } = useAppStore()
  const qc = useQueryClient()

  const query = useQuery<RecurrenceItem[]>({
    queryKey: ['recurrences', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('recurrences')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      return (data || []).map(mapRow)
    },
  })

  const create = useMutation({
    mutationFn: async (item: Omit<RecurrenceItem, 'id' | 'userId' | 'createdAt'>) => {
      if (!user?.id) throw new Error('Non authentifié')
      const { data, error } = await supabase
        .from('recurrences')
        .insert({
          user_id: user.id,
          name: item.name,
          emoji: item.emoji,
          amount: item.amount,
          type: item.type,
          frequency: item.frequency,
          next_date: item.nextDate,
          category: item.category,
          active: item.active,
          account: item.account,
        })
        .select()
        .single()
      if (error) throw error
      return mapRow(data as Record<string, unknown>)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurrences'] })
      toast.success('Transaction récurrente créée')
    },
    onError: () => toast.error('Erreur lors de la création'),
  })

  const update = useMutation({
    mutationFn: async ({ id, ...item }: Partial<RecurrenceItem> & { id: string }) => {
      const patch: Record<string, unknown> = {}
      if (item.name !== undefined) patch.name = item.name
      if (item.emoji !== undefined) patch.emoji = item.emoji
      if (item.amount !== undefined) patch.amount = item.amount
      if (item.type !== undefined) patch.type = item.type
      if (item.frequency !== undefined) patch.frequency = item.frequency
      if (item.nextDate !== undefined) patch.next_date = item.nextDate
      if (item.category !== undefined) patch.category = item.category
      if (item.active !== undefined) patch.active = item.active
      if (item.account !== undefined) patch.account = item.account
      const { error } = await supabase.from('recurrences').update(patch).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurrences'] })
      toast.success('Transaction récurrente mise à jour')
    },
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('recurrences').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurrences'] })
      toast.success('Supprimé')
    },
  })

  const toggle = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from('recurrences').update({ active }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurrences'] }),
  })

  return { ...query, create, update, remove, toggle }
}
