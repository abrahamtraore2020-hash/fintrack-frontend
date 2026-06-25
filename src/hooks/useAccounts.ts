'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, ensureSession } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { Account } from '@/types'
import toast from 'react-hot-toast'

function mapRow(row: Record<string, unknown>): Account {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    type: row.type as Account['type'],
    provider: row.provider as Account['provider'],
    name: row.name as string,
    balance: row.balance as number,
    currency: row.currency as Account['currency'],
    isConnected: row.is_connected as boolean,
    lastSync: row.last_sync as string | undefined,
    apiKey: row.api_key as string | undefined,
    webhookUrl: row.webhook_url as string | undefined,
    createdAt: row.created_at as string,
  }
}

export function useAccounts() {
  const { user } = useAppStore()
  const qc = useQueryClient()

  const query = useQuery<Account[]>({
    queryKey: ['accounts', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      return (data || []).map(mapRow)
    },
  })

  const createAccount = useMutation({
    mutationFn: async (acc: Omit<Account, 'id' | 'userId' | 'createdAt'>) => {
      await ensureSession()
      if (!user?.id) throw new Error('Non authentifié')
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          user_id: user.id,
          type: acc.type,
          provider: acc.provider,
          name: acc.name,
          balance: acc.balance,
          currency: acc.currency,
          is_connected: acc.isConnected,
          last_sync: acc.lastSync ?? null,
          api_key: acc.apiKey ?? null,
          webhook_url: acc.webhookUrl ?? null,
        })
        .select()
        .single()
      if (error) throw error
      return mapRow(data as Record<string, unknown>)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] })
      toast.success('Compte connecté !')
    },
    onError: () => toast.error('Erreur lors de la connexion'),
  })

  const removeAccount = useMutation({
    mutationFn: async (id: string) => {
      await ensureSession()
      const { error } = await supabase.from('accounts').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] })
      toast.success('Intégration supprimée')
    },
  })

  return { ...query, createAccount, removeAccount }
}
