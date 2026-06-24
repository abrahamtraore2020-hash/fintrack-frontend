'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { Coffre } from '@/types'
import toast from 'react-hot-toast'

export function useCoffres() {
  const { user } = useAppStore()
  const qc = useQueryClient()

  const query = useQuery<Coffre[]>({
    queryKey: ['coffres', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from('coffres').select('*').eq('user_id', user!.id).order('created_at', { ascending: false })
      return data || []
    },
  })

  const create = useMutation({
    mutationFn: async (coffre: Omit<Coffre, 'id' | 'userId' | 'createdAt'>) => {
      const { data, error } = await supabase.from('coffres').insert({ ...coffre, user_id: user!.id }).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coffres'] }); toast.success('Coffre créé !') },
    onError: () => toast.error('Erreur lors de la création'),
  })

  const update = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Coffre> & { id: string }) => {
      const { error } = await supabase.from('coffres').update(data).eq('id', id)
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
  })

  return { ...query, create, update, remove }
}
