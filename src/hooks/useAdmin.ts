'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type AdminRole = 'admin' | 'moderator' | 'support' | null

export interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  plan: string
  role: AdminRole
  createdAt: string
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin_users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, firstName, lastName, email, plan, role, created_at')
        .order('created_at', { ascending: false })
        .limit(500)
      if (error || !data) return []
      return data.map((u: any): AdminUser => ({
        id: u.id,
        firstName: u.firstName || '',
        lastName: u.lastName || '',
        email: u.email || '',
        plan: u.plan || 'starter',
        role: u.role || null,
        createdAt: u.created_at,
      }))
    },
    staleTime: 30000,
  })
}

export function useUpdateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AdminRole }) => {
      const { error } = await supabase
        .from('users')
        .update({ role: role || null })
        .eq('id', userId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin_users'] }),
  })
}
