'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, ensureSession } from '@/lib/supabase'

export interface RealStory {
  id: string
  userId: string
  name: string
  initials: string
  color: string
  avatar?: string
  content: string
  mediaUrl?: string
  mediaType?: 'image' | 'video'
  seen: boolean
  createdAt: string
  expiresAt: string
}

function stringToColor(str: string) {
  const colors = ['#8B5CF6', '#F97316', '#22C55E', '#14B8A6', '#EC4899', '#3B82F6', '#06D6A0']
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

async function fetchStories(currentUserId: string): Promise<RealStory[]> {
  try {
    const { data, error } = await supabase
      .from('funtwit_stories')
      .select(`*, users:user_id (firstName, lastName, avatar)`)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(30)

    if (error) return []

    const seenIds: string[] = JSON.parse(localStorage.getItem(`stories_seen_${currentUserId}`) || '[]')

    return (data || []).map((s: any) => ({
      id: s.id,
      userId: s.user_id,
      name: `${s.users?.firstName || ''} ${s.users?.lastName || ''}`.trim() || 'Anonyme',
      initials: `${(s.users?.firstName || '?')[0]}${(s.users?.lastName || '')[0] || ''}`.toUpperCase(),
      color: stringToColor(s.user_id),
      avatar: s.users?.avatar,
      content: s.content || '',
      mediaUrl: s.media_url,
      mediaType: s.media_type,
      seen: seenIds.includes(s.id),
      createdAt: s.created_at,
      expiresAt: s.expires_at,
    }))
  } catch {
    return []
  }
}

export function useFuntwitStories() {
  const qc = useQueryClient()

  const getCurrentUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id || ''
  }

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ['funtwit_stories'],
    queryFn: async () => {
      const uid = await getCurrentUserId()
      return fetchStories(uid)
    },
    staleTime: 30000,
  })

  const createStory = useMutation({
    mutationFn: async (input: { content: string; mediaFile?: File }) => {
      const uid = await ensureSession()
      let mediaUrl: string | undefined
      let mediaType: 'image' | 'video' | undefined

      if (input.mediaFile) {
        const ext = input.mediaFile.name.split('.').pop()
        const path = `stories/${uid}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('funtwit-media')
          .upload(path, input.mediaFile, { upsert: true })
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('funtwit-media').getPublicUrl(path)
          mediaUrl = publicUrl
          mediaType = input.mediaFile.type.startsWith('video') ? 'video' : 'image'
        }
      }

      const expiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString()
      const { error } = await supabase.from('funtwit_stories').insert({
        user_id: uid,
        content: input.content,
        media_url: mediaUrl || null,
        media_type: mediaType || null,
        expires_at: expiresAt,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['funtwit_stories'] }),
  })

  const markSeen = async (storyId: string, userId: string) => {
    const key = `stories_seen_${userId}`
    const seen: string[] = JSON.parse(localStorage.getItem(key) || '[]')
    if (!seen.includes(storyId)) {
      localStorage.setItem(key, JSON.stringify([...seen, storyId]))
      qc.setQueryData<RealStory[]>(['funtwit_stories'], old =>
        (old || []).map(s => s.id === storyId ? { ...s, seen: true } : s)
      )
    }
  }

  return { stories, isLoading, createStory, markSeen }
}
