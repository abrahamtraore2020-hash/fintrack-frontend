'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { Notification, Alarm } from '@/types'
import toast from 'react-hot-toast'

export function useNotifications() {
  const { user } = useAppStore()
  const qc = useQueryClient()

  const notifQuery = useQuery<Notification[]>({
    queryKey: ['notifications', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(50)
      return data || []
    },
  })

  const alarmQuery = useQuery<Alarm[]>({
    queryKey: ['alarms', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('alarms')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      return data || []
    },
  })

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAllRead = useMutation({
    mutationFn: async () => {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user!.id).eq('is_read', false)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const toggleAlarm = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await supabase.from('alarms').update({ is_active: isActive }).eq('id', id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alarms'] }),
  })

  const createAlarm = useMutation({
    mutationFn: async (alarm: Partial<Alarm>) => {
      const { data, error } = await supabase.from('alarms').insert({ ...alarm, user_id: user!.id }).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['alarms'] }); toast.success('Alarme créée !') },
    onError: () => toast.error('Erreur lors de la création'),
  })

  return { notifications: notifQuery, alarms: alarmQuery, markRead, markAllRead, toggleAlarm, createAlarm }
}
