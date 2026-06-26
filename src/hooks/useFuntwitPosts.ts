'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, ensureSession } from '@/lib/supabase'

export interface FuntwitPost {
  id: string
  userId: string
  name: string
  initials: string
  color: string
  avatar?: string
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

const LS_KEY = 'funtwit_posts_local'

function loadLocal(): FuntwitPost[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}

function saveLocal(posts: FuntwitPost[]) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(LS_KEY, JSON.stringify(posts.slice(0, 100))) } catch {}
}

async function fetchPosts(): Promise<FuntwitPost[]> {
  try {
    const { data, error } = await supabase
      .from('funtwit_posts')
      .select(`
        *,
        users:user_id (first_name, last_name, avatar),
        funtwit_comments (
          id, user_id, content, likes, created_at,
          users:user_id (first_name, last_name)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) return loadLocal()

    const remote = (data || []).map((p: any) => ({
      id: p.id,
      userId: p.user_id,
      name: `${p.users?.first_name || ''} ${p.users?.last_name || ''}`.trim() || 'Anonyme',
      initials: `${(p.users?.first_name || '?')[0]}${(p.users?.last_name || '')[0] || ''}`.toUpperCase(),
      color: p.color || '#06D6A0',
      avatar: p.users?.avatar || undefined,
      location: p.location,
      content: p.content,
      badge: p.badge,
      media: p.media,
      hashtags: p.hashtags || [],
      reactions: p.reactions || { like: [], love: [], haha: [], wow: [], fire: [] },
      comments: (p.funtwit_comments || [])
        .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map((c: any) => ({
          id: c.id, userId: c.user_id,
          name: `${c.users?.first_name || ''} ${c.users?.last_name || ''}`.trim() || 'Anonyme',
          initials: `${(c.users?.first_name || '?')[0]}${(c.users?.last_name || '')[0] || ''}`.toUpperCase(),
          color: '#06D6A0', text: c.content, likes: c.likes || 0, createdAt: c.created_at,
        })),
      shares: p.shares || 0, saved: false, createdAt: p.created_at,
    }))

    // Garder les posts locaux temp (pas encore confirmés en base)
    const localTemp = loadLocal().filter(l => l.id.startsWith('temp-'))
    const merged = [...localTemp, ...remote]
    saveLocal(merged)
    return merged
  } catch {
    return loadLocal()
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
      if (error) {
        // Table absente → post reste en local uniquement, pas d'erreur visible
        console.warn('Supabase unavailable, post saved locally:', error.message)
      }
    },

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
        shares: 0, saved: false,
        createdAt: new Date().toISOString(),
      }
      const updated = [optimistic, ...(previous || [])]
      qc.setQueryData<FuntwitPost[]>(['funtwit_posts'], updated)
      saveLocal(updated)
      return { previous }
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(['funtwit_posts'], context.previous)
        saveLocal(context.previous)
      }
    },

    onSettled: () => qc.invalidateQueries({ queryKey: ['funtwit_posts'] }),
  })

  const react = useMutation({
    mutationFn: async ({ postId, reaction, userId }: { postId: string; reaction: string; userId: string }) => {
      if (postId.startsWith('temp-')) return
      const post = (qc.getQueryData<FuntwitPost[]>(['funtwit_posts']) || []).find(p => p.id === postId)
      if (!post) return
      const newReactions = { ...post.reactions }
      Object.keys(newReactions).forEach(r => { newReactions[r] = newReactions[r].filter((id: string) => id !== userId) })
      const wasOn = post.reactions[reaction]?.includes(userId)
      if (!wasOn) newReactions[reaction] = [...(newReactions[reaction] || []), userId]
      await supabase.from('funtwit_posts').update({ reactions: newReactions }).eq('id', postId)
    },
    onMutate: async ({ postId, reaction, userId }) => {
      await qc.cancelQueries({ queryKey: ['funtwit_posts'] })
      const updated = (qc.getQueryData<FuntwitPost[]>(['funtwit_posts']) || []).map(p => {
        if (p.id !== postId) return p
        const newR = { ...p.reactions }
        Object.keys(newR).forEach(r => { newR[r] = newR[r].filter(id => id !== userId) })
        const wasOn = p.reactions[reaction]?.includes(userId)
        if (!wasOn) newR[reaction] = [...(newR[reaction] || []), userId]
        return { ...p, reactions: newR }
      })
      qc.setQueryData<FuntwitPost[]>(['funtwit_posts'], updated)
      saveLocal(updated)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['funtwit_posts'] }),
  })

  const addComment = useMutation({
    mutationFn: async ({ postId, text }: { postId: string; text: string; _name?: string; _initials?: string }) => {
      if (postId.startsWith('temp-')) return
      const uid = await ensureSession()
      await supabase.from('funtwit_comments').insert({ post_id: postId, user_id: uid, content: text, likes: 0 })
    },
    onMutate: async ({ postId, text, _name, _initials }: { postId: string; text: string; _name?: string; _initials?: string }) => {
      await qc.cancelQueries({ queryKey: ['funtwit_posts'] })
      const comment: FuntwitComment = {
        id: `temp-c-${Date.now()}`, userId: 'me',
        name: _name || 'Moi', initials: _initials || 'ME', color: '#06D6A0',
        text, likes: 0, createdAt: new Date().toISOString(),
      }
      const updated = (qc.getQueryData<FuntwitPost[]>(['funtwit_posts']) || []).map(p =>
        p.id === postId ? { ...p, comments: [...p.comments, comment] } : p
      )
      qc.setQueryData<FuntwitPost[]>(['funtwit_posts'], updated)
      saveLocal(updated)
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
    onMutate: async (postId) => {
      const updated = (qc.getQueryData<FuntwitPost[]>(['funtwit_posts']) || []).map(p =>
        p.id === postId ? { ...p, shares: p.shares + 1 } : p
      )
      qc.setQueryData<FuntwitPost[]>(['funtwit_posts'], updated)
      saveLocal(updated)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['funtwit_posts'] }),
  })

  return { posts, isLoading, createPost, react, addComment, sharePost }
}
