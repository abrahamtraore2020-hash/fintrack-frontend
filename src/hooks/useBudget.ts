'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, ensureSession } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import toast from 'react-hot-toast'

export type BudgetItem = {
  id: string
  userId: string
  category: string
  emoji: string
  budgetLimit: number
  spent: number
  color: string
  createdAt: string
}

function mapRow(row: Record<string, unknown>): BudgetItem {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    category: row.category as string,
    emoji: row.emoji as string,
    budgetLimit: row.budget_limit as number,
    spent: row.spent as number,
    color: row.color as string,
    createdAt: row.created_at as string,
  }
}

export function useBudget() {
  const { user } = useAppStore()
  const qc = useQueryClient()

  const query = useQuery<BudgetItem[]>({
    queryKey: ['budgets', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      return (data || []).map(mapRow)
    },
  })

  const create = useMutation({
    mutationFn: async (item: Omit<BudgetItem, 'id' | 'userId' | 'createdAt'>) => {
      await ensureSession()
      if (!user?.id) throw new Error('Non authentifié')
      const { data, error } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          category: item.category,
          emoji: item.emoji,
          budget_limit: item.budgetLimit,
          spent: item.spent,
          color: item.color,
        })
        .select()
        .single()
      if (error) throw error
      return mapRow(data as Record<string, unknown>)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Budget créé')
    },
    onError: () => toast.error('Erreur lors de la création'),
  })

  const update = useMutation({
    mutationFn: async ({ id, ...item }: Partial<BudgetItem> & { id: string }) => {
      const patch: Record<string, unknown> = {}
      if (item.category !== undefined) patch.category = item.category
      if (item.emoji !== undefined) patch.emoji = item.emoji
      if (item.budgetLimit !== undefined) patch.budget_limit = item.budgetLimit
      if (item.spent !== undefined) patch.spent = item.spent
      if (item.color !== undefined) patch.color = item.color
      const { error } = await supabase.from('budgets').update(patch).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Budget mis à jour')
    },
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('budgets').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Budget supprimé')
    },
  })

  return { ...query, create, update, remove }
}
