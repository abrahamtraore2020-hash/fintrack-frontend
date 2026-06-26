'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, ensureSession } from '@/lib/supabase'

export interface FuntwitPost {
  id: string
  userId: string
  name: string
  initials: string
  color: string
  location?: string
  content: string
  badge?: { type: string; label: string; amount?: string }
  media?: { type: 'image' | 'video'; url: string }[]
  hashtags: string[]
  reactions: Record<string, string[]>
  comments: FuntwitComment[]
  shares: number
  saved: boolean
  createdAt: string
}

export interface FuntwitComment {
  id: string
  userId: string
  name: string
  initials: string
  color: string
  text: string
  likes: number
  createdAt: string
}

async function fetchPosts(): Promise<FuntwitPost[]> {
  try {
    const { data, error } = await supabase
      .from('funtwit_posts')
      .select(`
        *,
        users:user_id (first_name, last_name),
        funtwit_comments (
          id, user_id, content, likes, created_at,
          users:user_id (first_name, last_name)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.warn('funtwit_posts table missing or error:', error.message)
      return []
    }

    return (data || []).map((p: any) => ({
      id: p.id,
      userId: p.user_id,
      name: `${p.users?.first_name || ''} ${p.users?.last_name || ''}`.trim() || 'Anonyme',
      initials: `${(p.users?.first_name || '?')[0]}${(p.users?.last_name || '')[0] || ''}`.toUpperCase(),
      color: p.color || '#06D6A0',
      location: p.location,
      content: p.content,
      badge: p.badge,
      media: p.media,
      hashtags: p.hashtags || [],
      reactions: p.reactions || { like: [], love: [], haha: [], wow: [], fire: [] },
      comments: (p.funtwit_comments || [])
        .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map((c: any) => ({
          id: c.id,
          userId: c.user_id,
          name: `${c.users?.first_name || ''} ${c.users?.last_name || ''}`.trim() || 'Anonyme',
          initials: `${(c.users?.first_name || '?')[0]}${(c.users?.last_name || '')[0] || ''}`.toUpperCase(),
          color: '#06D6A0',
          text: c.content,
          likes: c.likes || 0,
          createdAt: c.created_at,
        })),
      shares: p.shares || 0,
      saved: false,
      createdAt: p.created_at,
    }))
  } catch {
    return []
  }
}

export function useFuntwitPosts() {
  const qc = useQueryClient()

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['funtwit_posts'],
    queryFn: fetchPosts,
    staleTime: 20000,
    retry: 1,
  })

  const createPost = useMutation({
    mutationFn: async (input: {
      content: string; badge?: any; media?: any[]
      hashtags: string[]; color: string; location?: string
      // for optimistic display only
      _tempId?: string; _name?: string; _initials?: string
    }) => {
      const uid = await ensureSession()
      const { error } = await supabase.from('funtwit_posts').insert({
        user_id: uid,
        content: input.content,
        badge: input.badge || null,
        media: input.media?.length ? input.media : null,
        hashtags: input.hashtags,
        color: input.color,
        location: input.location || null,
        reactions: { like: [], love: [], haha: [], wow: [], fire: [] },
        shares: 0,
      })
      if (error) throw new Error(error.message)
    },

    // Optimistic update — post apparaît immédiatement
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: ['funtwit_posts'] })
      const previous = qc.getQueryData<FuntwitPost[]>(['funtwit_posts'])

      const optimistic: FuntwitPost = {
        id: input._tempId || `temp-${Date.now()}`,
        userId: 'me',
        name: input._name || 'Moi',
        initials: input._initials || 'ME',
        color: input.color,
        content: input.content,
        badge: input.badge,
        media: input.media,
        hashtags: input.hashtags,
        reactions: { like: [], love: [], haha: [], wow: [], fire: [] },
        comments: [],
        shares: 0,
        saved: false,
        createdAt: new Date().toISOString(),
      }

      qc.setQueryData<FuntwitPost[]>(['funtwit_posts'], old => [optimistic, ...(old || [])])
      return { previous }
    },

    onError: (_err, _vars, context) => {
      // Rollback optimistic update
      if (context?.previous) {
        qc.setQueryData(['funtwit_posts'], context.previous)
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['funtwit_posts'] })
    },
  })

  const react = useMutation({
    mutationFn: async ({ postId, reaction, userId }: { postId: string; reaction: string; userId: string }) => {
      const post = (qc.getQueryData<FuntwitPost[]>(['funtwit_posts']) || []).find(p => p.id === postId)
      if (!post || post.id.startsWith('temp-')) return
      const newReactions = { ...post.reactions }
      Object.keys(newReactions).forEach(r => {
        newReactions[r] = newReactions[r].filter((id: string) => id !== userId)
      })
      const wasOn = post.reactions[reaction]?.includes(userId)
      if (!wasOn) newReactions[reaction] = [...(newReactions[reaction] || []), userId]
      const { error } = await supabase.from('funtwit_posts').update({ reactions: newReactions }).eq('id', postId)
      if (error) throw error
    },
    onMutate: async ({ postId, reaction, userId }) => {
      await qc.cancelQueries({ queryKey: ['funtwit_posts'] })
      qc.setQueryData<FuntwitPost[]>(['funtwit_posts'], old =>
        (old || []).map(p => {
          if (p.id !== postId) return p
          const newR = { ...p.reactions }
          Object.keys(newR).forEach(r => { newR[r] = newR[r].filter(id => id !== userId) })
          const wasOn = p.reactions[reaction]?.includes(userId)
          if (!wasOn) newR[reaction] = [...(newR[reaction] || []), userId]
          return { ...p, reactions: newR }
        })
      )
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['funtwit_posts'] }),
  })

  const addComment = useMutation({
    mutationFn: async ({ postId, text }: { postId: string; text: string }) => {
      if (postId.startsWith('temp-')) return // pas encore en base
      const uid = await ensureSession()
      const { error } = await supabase.from('funtwit_comments').insert({
        post_id: postId, user_id: uid, content: text, likes: 0,
      })
      if (error) throw error
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['funtwit_posts'] }),
  })

  const sharePost = useMutation({
    mutationFn: async (postId: string) => {
      if (postId.startsWith('temp-')) return
      const post = (qc.getQueryData<FuntwitPost[]>(['funtwit_posts']) || []).find(p => p.id === postId)
      if (!post) return
      await supabase.from('funtwit_posts').update({ shares: (post.shares || 0) + 1 }).eq('id', postId)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['funtwit_posts'] }),
  })

  return { posts, isLoading, createPost, react, addComment, sharePost }
}
