'use client'
import { useState } from 'react'
import { Heart, MessageCircle, Share2, TrendingUp, Target, Zap, Search, Image, Video, BarChart2, X } from 'lucide-react'
import { useRef } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

// ── Types ──────────────────────────────────────────────────────────────────────
type Badge = { type: 'milestone' | 'objectif' | 'epargne' | 'conseil'; label: string; amount?: string }
type MediaItem = { type: 'image' | 'video'; url: string; name: string }
type Post = {
  id: string
  userId: string
  userName: string
  userInitials: string
  userColor: string
  userProfile: string
  content: string
  badge?: Badge
  media?: MediaItem[]
  hashtags: string[]
  likes: string[]
  comments: Comment[]
  createdAt: string
}
type Comment = { id: string; userId: string; userName: string; userInitials: string; userColor: string; content: string; createdAt: string }

// ── Seed posts ─────────────────────────────────────────────────────────────────
const SEED_POSTS: Post[] = [
  {
    id: 'p1', userId: 'u1', userName: 'Aminata Diallo', userInitials: 'AD',
    userColor: '#8B5CF6', userProfile: 'Freelance · Dakar',
    content: "J'ai enfin atteint mon objectif d'épargne vacances ! 6 mois de discipline et ça paye 🎉 FinTrack m'a vraiment aidé à visualiser mes progrès.",
    badge: { type: 'objectif', label: 'Objectif atteint', amount: '200 000 F' },
    hashtags: ['#épargne', '#objectif', '#motivation'],
    likes: ['u2', 'u3', 'u4', 'u5'],
    comments: [
      { id: 'c1', userId: 'u2', userName: 'Kofi Mensah', userInitials: 'KM', userColor: '#3B82F6', content: 'Félicitations ! Tu es une source d\'inspiration 🔥', createdAt: '2025-06-23T10:30:00Z' },
      { id: 'c2', userId: 'u3', userName: 'Fatou Traoré', userInitials: 'FT', userColor: '#22C55E', content: 'Waouw ! Comment tu fais pour tenir ?', createdAt: '2025-06-23T11:00:00Z' },
    ],
    createdAt: '2025-06-23T09:00:00Z',
  },
  {
    id: 'p2', userId: 'u2', userName: 'Ibrahim Coulibaly', userInitials: 'IC',
    userColor: '#F97316', userProfile: 'Business · Abidjan',
    content: "Astuce du jour 💡 : connectez votre Wave à FinTrack et créez un coffre automatique à 10% de chaque entrée. En 3 mois j'ai économisé sans m'en rendre compte.",
    badge: { type: 'conseil', label: 'Conseil Pro' },
    hashtags: ['#wave', '#astuce', '#épargneauto'],
    likes: ['u1', 'u4', 'u6', 'u7', 'u8'],
    comments: [
      { id: 'c3', userId: 'u4', userName: 'Marie Koffi', userInitials: 'MK', userColor: '#EC4899', content: 'Merci pour le conseil ! Je vais tester ça aujourd\'hui.', createdAt: '2025-06-22T14:00:00Z' },
    ],
    createdAt: '2025-06-22T12:00:00Z',
  },
  {
    id: 'p3', userId: 'u3', userName: 'Fatou Traoré', userInitials: 'FT',
    userColor: '#22C55E', userProfile: 'Particulier · Bamako',
    content: "Mois de juin : revenus +15% par rapport à mai grâce à mes missions freelance. Le dashboard FinTrack me montre exactement où va chaque franc. Vraiment utile !",
    badge: { type: 'milestone', label: 'Revenus +15%', amount: '485 000 F' },
    hashtags: ['#freelance', '#revenus', '#croissance'],
    likes: ['u1', 'u2'],
    comments: [],
    createdAt: '2025-06-21T16:00:00Z',
  },
  {
    id: 'p4', userId: 'u4', userName: 'Moussa Sankara', userInitials: 'MS',
    userColor: '#14B8A6', userProfile: 'Entrepreneur · Ouagadougou',
    content: "Question pour la communauté : vous utilisez quel moyen mobile money principalement ? Moi c'est Orange Money mais je pense passer à Wave pour les frais plus bas.",
    hashtags: ['#mobilemoney', '#question', '#wave', '#orangemoney'],
    likes: ['u1', 'u3', 'u5'],
    comments: [
      { id: 'c4', userId: 'u1', userName: 'Aminata Diallo', userInitials: 'AD', userColor: '#8B5CF6', content: 'Wave pour moi ! Les frais sont vraiment imbattables.', createdAt: '2025-06-20T10:00:00Z' },
      { id: 'c5', userId: 'u2', userName: 'Ibrahim Coulibaly', userInitials: 'IC', userColor: '#F97316', content: 'J\'utilise les deux selon les clients. Orange Money est plus universel.', createdAt: '2025-06-20T11:30:00Z' },
    ],
    createdAt: '2025-06-20T09:00:00Z',
  },
]

const TRENDING = ['#épargne', '#wave', '#freelance', '#objectif', '#mobilemoney', '#revenus', '#conseil']
const BADGE_COLORS: Record<string, string> = {
  milestone: '#FFD700',
  objectif: '#22C55E',
  epargne: '#3B82F6',
  conseil: '#8B5CF6',
}
const BADGE_ICONS: Record<string, any> = {
  milestone: TrendingUp,
  objectif: Target,
  epargne: BarChart2,
  conseil: Zap,
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'À l\'instant'
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}j`
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

// ── Post Card ──────────────────────────────────────────────────────────────────
function PostCard({ post, currentUserId, currentUserName, currentInitials, currentColor, onLike, onComment }: {
  post: Post
  currentUserId: string
  currentUserName: string
  currentInitials: string
  currentColor: string
  onLike: (id: string) => void
  onComment: (postId: string, text: string) => void
}) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const liked = post.likes.includes(currentUserId)
  const BadgeIcon = post.badge ? BADGE_ICONS[post.badge.type] : null

  return (
    <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-4 mb-3">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ background: post.userColor }}>
          {post.userInitials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-800 dark:text-white">{post.userName}</span>
            <span className="text-[11px] text-gray-400">{post.userProfile}</span>
            <span className="text-[11px] text-gray-300 ml-auto flex-shrink-0">{timeAgo(post.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Badge milestone */}
      {post.badge && BadgeIcon && (
        <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl" style={{ background: BADGE_COLORS[post.badge.type] + '15' }}>
          <BadgeIcon size={14} style={{ color: BADGE_COLORS[post.badge.type] }} />
          <span className="text-xs font-semibold" style={{ color: BADGE_COLORS[post.badge.type] }}>{post.badge.label}</span>
          {post.badge.amount && <span className="text-xs font-bold ml-auto" style={{ color: BADGE_COLORS[post.badge.type] }}>{post.badge.amount}</span>}
        </div>
      )}

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className={cn('grid gap-1.5 mb-3 rounded-xl overflow-hidden', post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
          {post.media.map((m, i) => (
            m.type === 'image'
              ? <img key={i} src={m.url} alt={m.name} className="w-full max-h-60 object-cover rounded-xl"/>
              : <video key={i} src={m.url} controls className="w-full max-h-60 rounded-xl"/>
          ))}
        </div>
      )}

      {/* Content */}
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">{post.content}</p>

      {/* Hashtags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {post.hashtags.map(tag => (
          <span key={tag} className="text-xs text-blue-500 hover:text-blue-600 cursor-pointer font-medium">{tag}</span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-50 dark:border-dark-border">
        <button onClick={() => onLike(post.id)}
          className={cn('flex items-center gap-1.5 text-xs font-medium transition-colors', liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400')}>
          <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
          {post.likes.length}
        </button>
        <button onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-blue-500 transition-colors">
          <MessageCircle size={15} />
          {post.comments.length}
        </button>
        <button onClick={() => { navigator.clipboard.writeText(`Voir ce post sur FinTrack FUNTWIT`); toast.success('Lien copié !') }}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-green-500 transition-colors ml-auto">
          <Share2 size={14} />
          Partager
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-gray-50 dark:border-dark-border space-y-3">
          {post.comments.map(c => (
            <div key={c.id} className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                style={{ background: c.userColor }}>
                {c.userInitials}
              </div>
              <div className="flex-1 bg-gray-50 dark:bg-dark-bg rounded-xl px-3 py-2">
                <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">{c.userName}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{c.content}</p>
              </div>
            </div>
          ))}
          {/* Add comment */}
          <div className="flex items-center gap-2 mt-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
              style={{ background: currentColor }}>
              {currentInitials}
            </div>
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && commentText.trim()) {
                  onComment(post.id, commentText.trim())
                  setCommentText('')
                }
              }}
              placeholder="Écrire un commentaire... (Entrée pour envoyer)"
              className="flex-1 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:border-gold"
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function FuntwitPage() {
  const { user } = useAppStore()
  const [posts, setPosts] = useState<Post[]>(SEED_POSTS)
  const [newPost, setNewPost] = useState('')
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null)
  const [badgeAmount, setBadgeAmount] = useState('')
  const [activeTab, setActiveTab] = useState<'feed' | 'trending' | 'communaute'>('feed')
  const [searchQuery, setSearchQuery] = useState('')
  const [mediaPreviews, setMediaPreviews] = useState<MediaItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const items: MediaItem[] = files.map(f => ({
      type: f.type.startsWith('video') ? 'video' : 'image',
      url: URL.createObjectURL(f),
      name: f.name,
    }))
    setMediaPreviews(p => [...p, ...items])
    e.target.value = ''
  }

  const currentUserId = user?.id || 'me'
  const currentUserName = user ? `${user.firstName} ${user.lastName}` : 'Moi'
  const currentInitials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'ME'
  const currentColor = '#FFD700'

  const handlePost = () => {
    if (!newPost.trim()) return
    const hashtags = newPost.match(/#\w+/g) || []
    const media = mediaPreviews.length > 0 ? [...mediaPreviews] : undefined
    const badge = selectedBadge ? {
      type: selectedBadge as any,
      label: selectedBadge === 'milestone' ? 'Milestone' : selectedBadge === 'objectif' ? 'Objectif atteint' : selectedBadge === 'epargne' ? 'Épargne' : 'Conseil Pro',
      amount: badgeAmount || undefined,
    } : undefined

    const post: Post = {
      id: `p-${Date.now()}`,
      userId: currentUserId,
      userName: currentUserName,
      userInitials: currentInitials,
      userColor: currentColor,
      userProfile: `${user?.profile || 'Particulier'}`,
      content: newPost,
      badge,
      media,
      hashtags,
      likes: [],
      comments: [],
      createdAt: new Date().toISOString(),
    }
    setPosts(p => [post, ...p])
    setNewPost('')
    setSelectedBadge(null)
    setBadgeAmount('')
    setMediaPreviews([])
    toast.success('Post publié sur FUNTWIT !')
  }

  const handleLike = (postId: string) => {
    setPosts(p => p.map(post => {
      if (post.id !== postId) return post
      const liked = post.likes.includes(currentUserId)
      return { ...post, likes: liked ? post.likes.filter(id => id !== currentUserId) : [...post.likes, currentUserId] }
    }))
  }

  const handleComment = (postId: string, text: string) => {
    setPosts(p => p.map(post => {
      if (post.id !== postId) return post
      const comment: Comment = {
        id: `c-${Date.now()}`, userId: currentUserId,
        userName: currentUserName, userInitials: currentInitials,
        userColor: currentColor, content: text,
        createdAt: new Date().toISOString(),
      }
      return { ...post, comments: [...post.comments, comment] }
    }))
  }

  const filteredPosts = posts.filter(p =>
    !searchQuery || p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.hashtags.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const BADGE_OPTIONS = [
    { id: 'milestone', label: '📈 Milestone', color: '#FFD700' },
    { id: 'objectif',  label: '🎯 Objectif',  color: '#22C55E' },
    { id: 'epargne',   label: '🏦 Épargne',   color: '#3B82F6' },
    { id: 'conseil',   label: '💡 Conseil',   color: '#8B5CF6' },
  ]

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <span className="text-2xl">🐦</span>
            <span>Fun<span className="text-gold">Twit</span></span>
          </h1>
          <p className="text-sm text-gray-500">La communauté FinTrack — partagez, inspirez, progressez</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="pl-8 pr-4 py-2 text-xs border border-gray-200 dark:border-dark-border rounded-xl bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gold w-44"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Feed ─────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2">

          {/* Compose box */}
          <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-[#1A1A2E] flex-shrink-0 bg-gold">
                {currentInitials}
              </div>
              <div className="flex-1">
                <textarea
                  value={newPost}
                  onChange={e => setNewPost(e.target.value)}
                  placeholder="Partagez votre expérience financière, une astuce, un objectif atteint... #hashtag"
                  rows={3}
                  className="w-full text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 bg-transparent resize-none focus:outline-none leading-relaxed"
                />
                {/* Media previews */}
                {mediaPreviews.length > 0 && (
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {mediaPreviews.map((m, i) => (
                      <div key={i} className="relative">
                        {m.type === 'image'
                          ? <img src={m.url} className="w-16 h-16 rounded-xl object-cover" alt="preview"/>
                          : <div className="w-16 h-16 rounded-xl bg-gray-800 flex items-center justify-center"><Video size={18} className="text-white"/></div>
                        }
                        <button onClick={() => setMediaPreviews(p => p.filter((_, idx) => idx !== i))}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <X size={10} className="text-white"/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Badge selector */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {BADGE_OPTIONS.map(b => (
                    <button key={b.id} onClick={() => setSelectedBadge(selectedBadge === b.id ? null : b.id)}
                      className={cn('px-2.5 py-1 rounded-lg text-xs font-medium border transition-all', selectedBadge === b.id ? 'border-opacity-100 text-white' : 'border-gray-200 dark:border-dark-border text-gray-500 bg-transparent hover:border-gray-300')}
                      style={selectedBadge === b.id ? { background: b.color, borderColor: b.color } : {}}>
                      {b.label}
                    </button>
                  ))}
                </div>
                {selectedBadge && (
                  <input
                    value={badgeAmount}
                    onChange={e => setBadgeAmount(e.target.value)}
                    placeholder="Montant (ex: 150 000 F) — optionnel"
                    className="w-full text-xs border border-gray-100 dark:border-dark-border rounded-lg px-3 py-2 mb-2 bg-gray-50 dark:bg-dark-bg text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gold"
                  />
                )}
                <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-dark-border">
                  <div className="flex items-center gap-1">
                    <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleMediaSelect}/>
                    <button onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gold hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-colors">
                      <Image size={14}/> Photo
                    </button>
                    <button onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gold hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-colors">
                      <Video size={14}/> Vidéo
                    </button>
                  </div>
                  <button onClick={handlePost} disabled={!newPost.trim() && mediaPreviews.length === 0}
                    className="px-4 py-2 bg-gold text-[#1A1A2E] text-xs font-bold rounded-xl hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    Publier
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 dark:bg-dark-bg rounded-xl p-1 mb-4">
            {([
              { id: 'feed',       label: '🏠 Fil d\'actu' },
              { id: 'trending',   label: '🔥 Tendances' },
              { id: 'communaute', label: '👥 Communauté' },
            ] as const).map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={cn('flex-1 py-2 rounded-lg text-xs font-medium transition-all', activeTab === t.id ? 'bg-white dark:bg-dark-card text-gray-800 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Posts */}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-sm">Aucun post trouvé</p>
            </div>
          ) : (
            filteredPosts.map(post => (
              <PostCard key={post.id} post={post}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                currentInitials={currentInitials}
                currentColor={currentColor}
                onLike={handleLike}
                onComment={handleComment}
              />
            ))
          )}
        </div>

        {/* ── Sidebar ───────────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Stats communauté */}
          <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-4">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">📊 Communauté</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Membres', value: '1.2k' },
                { label: 'Posts', value: '4.8k' },
                { label: 'Objectifs partagés', value: '342' },
                { label: 'Épargne collective', value: '128M F' },
              ].map((s, i) => (
                <div key={i} className="bg-gray-50 dark:bg-dark-bg rounded-xl p-2.5 text-center">
                  <p className="text-base font-bold text-gray-800 dark:text-white">{s.value}</p>
                  <p className="text-[10px] text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trending hashtags */}
          <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-4">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">🔥 Tendances</h3>
            <div className="space-y-2">
              {TRENDING.map((tag, i) => (
                <button key={tag} onClick={() => setSearchQuery(tag)}
                  className="w-full flex items-center justify-between py-1.5 hover:bg-gray-50 dark:hover:bg-dark-bg rounded-lg px-2 transition-colors group">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400 font-mono w-4">{i + 1}</span>
                    <span className="text-sm font-medium text-blue-500">{tag}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">{Math.floor(Math.random() * 200) + 50} posts</span>
                </button>
              ))}
            </div>
          </div>

          {/* Top membres */}
          <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-4">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">⭐ Top membres</h3>
            <div className="space-y-2.5">
              {[
                { name: 'Aminata Diallo', color: '#8B5CF6', initials: 'AD', posts: 42, badge: '🏆' },
                { name: 'Ibrahim Coulibaly', color: '#F97316', initials: 'IC', posts: 38, badge: '🥈' },
                { name: 'Fatou Traoré', color: '#22C55E', initials: 'FT', posts: 31, badge: '🥉' },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: m.color }}>
                    {m.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{m.name}</p>
                    <p className="text-[10px] text-gray-400">{m.posts} posts</p>
                  </div>
                  <span className="text-base">{m.badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Règles */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-2">📋 Règles FUNTWIT</h3>
            <ul className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
              <li>✅ Partagez vos succès financiers</li>
              <li>✅ Donnez des conseils constructifs</li>
              <li>✅ Posez des questions librement</li>
              <li>❌ Pas de publicité non sollicitée</li>
              <li>❌ Pas de partage de données sensibles</li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
