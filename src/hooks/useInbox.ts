'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ensureSession } from '@/lib/supabase'

export interface InboxMessage {
  id: string
  senderId: string
  content: string
  media?: { type: 'image' | 'video'; url: string; name: string }[]
  createdAt: string
  read: boolean
}

export interface Conversation {
  id: string
  participantId: string
  participantName: string
  participantInitials: string
  participantColor: string
  participantProfile: string
  messages: InboxMessage[]
  online: boolean
}

async function fetchConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id,
      user1_id, user2_id,
      messages (
        id, sender_id, content, media, read, created_at
      ),
      u1:users!conversations_user1_id_fkey (id, first_name, last_name, plan),
      u2:users!conversations_user2_id_fkey (id, first_name, last_name, plan)
    `)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('created_at', { ascending: false, foreignTable: 'messages' })

  if (error || !data) return []

  return data.map((conv: any) => {
    const isUser1 = conv.user1_id === userId
    const participant = isUser1 ? conv.u2 : conv.u1
    const name = `${participant?.first_name || ''} ${participant?.last_name || ''}`.trim() || 'Utilisateur'
    const initials = `${(participant?.first_name || '?')[0]}${(participant?.last_name || '')[0] || ''}`.toUpperCase()

    const messages: InboxMessage[] = (conv.messages || [])
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((m: any) => ({
        id: m.id,
        senderId: m.sender_id,
        content: m.content || '',
        media: m.media,
        createdAt: m.created_at,
        read: m.read,
      }))

    return {
      id: conv.id,
      participantId: participant?.id || '',
      participantName: name,
      participantInitials: initials,
      participantColor: stringToColor(participant?.id || ''),
      participantProfile: participant?.plan || 'starter',
      messages,
      online: false,
    }
  })
}

function stringToColor(str: string) {
  const colors = ['#8B5CF6', '#F97316', '#22C55E', '#14B8A6', '#EC4899', '#3B82F6', '#EF4444']
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export function useInbox() {
  const qc = useQueryClient()

  const getUid = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id || ''
  }

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['inbox'],
    queryFn: async () => {
      const uid = await getUid()
      if (!uid) return []
      return fetchConversations(uid)
    },
    staleTime: 10000,
    refetchInterval: 15000,
  })

  const sendMessage = useMutation({
    mutationFn: async ({ conversationId, content, media }: {
      conversationId: string; content: string; media?: any[]
    }) => {
      const uid = await ensureSession()
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: uid,
        content,
        media: media?.length ? media : null,
        read: false,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inbox'] }),
  })

  const markRead = useMutation({
    mutationFn: async ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inbox'] }),
  })

  const startConversation = useMutation({
    mutationFn: async ({ participantId, firstMessage }: { participantId: string; firstMessage: string }) => {
      const uid = await ensureSession()
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${uid},user2_id.eq.${participantId}),and(user1_id.eq.${participantId},user2_id.eq.${uid})`)
        .maybeSingle()

      let convId = existing?.id
      if (!convId) {
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert({ user1_id: uid, user2_id: participantId })
          .select('id')
          .single()
        if (error) throw error
        convId = newConv.id
      }

      if (firstMessage.trim()) {
        await supabase.from('messages').insert({
          conversation_id: convId,
          sender_id: uid,
          content: firstMessage,
          read: false,
        })
      }

      return convId
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inbox'] }),
  })

  return { conversations, isLoading, sendMessage, markRead, startConversation }
}
