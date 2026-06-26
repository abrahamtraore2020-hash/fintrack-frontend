'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ensureSession } from '@/lib/supabase'

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

  if (error) return []

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
    comments: (p.funtwit_comments || []).map((c: any) => ({
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
}

export function useFuntwitPosts() {
  const qc = useQueryClient()

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['funtwit_posts'],
    queryFn: fetchPosts,
    staleTime: 30000,
  })

  const createPost = useMutation({
    mutationFn: async (input: {
      content: string
      badge?: any
      media?: any[]
      hashtags: string[]
      color: string
      location?: string
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
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['funtwit_posts'] }),
  })

  const react = useMutation({
    mutationFn: async ({ postId, reaction, userId }: { postId: string; reaction: string; userId: string }) => {
      const post = posts.find(p => p.id === postId)
      if (!post) return
      const newReactions = { ...post.reactions }
      // Remove existing reaction from this user
      Object.keys(newReactions).forEach(r => {
        newReactions[r] = newReactions[r].filter((id: string) => id !== userId)
      })
      // Toggle: if not already on this reaction, add it
      const wasOn = post.reactions[reaction]?.includes(userId)
      if (!wasOn) newReactions[reaction] = [...(newReactions[reaction] || []), userId]

      const { error } = await supabase
        .from('funtwit_posts')
        .update({ reactions: newReactions })
        .eq('id', postId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['funtwit_posts'] }),
  })

  const addComment = useMutation({
    mutationFn: async ({ postId, text }: { postId: string; text: string }) => {
      const uid = await ensureSession()
      const { error } = await supabase.from('funtwit_comments').insert({
        post_id: postId,
        user_id: uid,
        content: text,
        likes: 0,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['funtwit_posts'] }),
  })

  const sharePost = useMutation({
    mutationFn: async (postId: string) => {
      const post = posts.find(p => p.id === postId)
      if (!post) return
      const { error } = await supabase
        .from('funtwit_posts')
        .update({ shares: (post.shares || 0) + 1 })
        .eq('id', postId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['funtwit_posts'] }),
  })

  return { posts, isLoading, createPost, react, addComment, sharePost }
}
