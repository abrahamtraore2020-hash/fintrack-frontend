'use client'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface AppUser {
  id: string
  firstName: string
  lastName: string
  avatar?: string
  plan: string
  color: string
}

function stringToColor(str: string) {
  const colors = ['#8B5CF6', '#F97316', '#22C55E', '#14B8A6', '#EC4899', '#3B82F6', '#EF4444', '#06D6A0']
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export function useUsers(currentUserId: string) {
  return useQuery({
    queryKey: ['app_users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, avatar, plan')
        .neq('id', currentUserId || 'none')
        .order('first_name')
        .limit(100)

      if (error || !data) return []

      return data.map((u: any): AppUser => ({
        id: u.id,
        firstName: u.first_name || '',
        lastName: u.last_name || '',
        avatar: u.avatar,
        plan: u.plan || 'starter',
        color: stringToColor(u.id),
      }))
    },
    enabled: !!currentUserId,
    staleTime: 60000,
  })
}
