'use client'
import { useState, useRef } from 'react'
import {
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  ThumbsUp, Search, Image, Video, X, Play,
  Plus, Users, Send, Smile, Radio, Calendar, Lock, Globe,
  Mic, MicOff, VideoOff, PhoneOff, Hand, MessageSquare,
  Clock, Star, Crown, ChevronRight, Bell, UserPlus, Settings, Loader2
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useAppStore } from '@/store/useAppStore'
import { useFuntwitPosts } from '@/hooks/useFuntwitPosts'
import { useFuntwitStories, type RealStory } from '@/hooks/useFuntwitStories'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

// ── Types ───────────────────────────────────────────────────────────────────────
type Reaction = 'like' | 'love' | 'haha' | 'wow' | 'fire'
type MediaItem = { type: 'image' | 'video'; url: string }
type Badge = { type: 'milestone'|'objectif'|'epargne'|'conseil'; label: string; amount?: string }
type Story = { id: string; userId: string; name: string; initials: string; color: string; seen: boolean; content: string }
type Comment = { id: string; userId: string; name: string; initials: string; color: string; text: string; likes: number; createdAt: string }
type Post = {
  id: string; userId: string; name: string; initials: string; color: string; avatar?: string
  location?: string; content: string; media?: MediaItem[]; badge?: Badge
  hashtags: string[]; reactions: Record<Reaction, string[]>
  comments: Comment[]; shares: number; saved: boolean; createdAt: string
  isReel?: boolean
}

// ── Seed data ───────────────────────────────────────────────────────────────────
const STORIES: Story[] = [
  { id: 's1', userId: 'u1', name: 'Aminata', initials: 'AD', color: '#8B5CF6', seen: false, content: '🎯 Objectif atteint !' },
  { id: 's2', userId: 'u2', name: 'Ibrahim', initials: 'IC', color: '#F97316', seen: false, content: '💡 Astuce Wave' },
  { id: 's3', userId: 'u3', name: 'Fatou',   initials: 'FT', color: '#22C55E', seen: true,  content: '📈 +15% revenus' },
  { id: 's4', userId: 'u4', name: 'Moussa',  initials: 'MS', color: '#14B8A6', seen: true,  content: '🏆 Nouveau record' },
  { id: 's5', userId: 'u5', name: 'Mariam',  initials: 'MB', color: '#EC4899', seen: false, content: '💰 Premier coffre' },
  { id: 's6', userId: 'u6', name: 'Oumar',   initials: 'OK', color: '#3B82F6', seen: false, content: '🚀 Lancement projet' },
]

const SEED_POSTS: Post[] = [
  {
    id: 'p1', userId: 'u1', name: 'Aminata Diallo', initials: 'AD', color: '#8B5CF6',
    location: 'Dakar, Sénégal',
    content: "J'ai enfin atteint mon objectif d'épargne vacances 🎉🎉🎉\n\n6 mois de discipline et ça paye ! FUNTRACK m'a vraiment aidé à visualiser mes progrès. Si vous n'avez pas encore créé votre coffre automatique, c'est le moment !\n\nQue vous inspire cette victoire ? 👇",
    badge: { type: 'objectif', label: '🎯 Objectif atteint', amount: '200 000 F' },
    hashtags: ['#épargne', '#objectif', '#motivation', '#FUNTRACK'],
    reactions: { like: ['u2','u3'], love: ['u4','u5','u6'], haha: [], wow: ['u7'], fire: ['u8','u9'] },
    comments: [
      { id: 'c1', userId: 'u2', name: 'Kofi Mensah', initials: 'KM', color: '#3B82F6', text: 'Félicitations ! Tu es une source d\'inspiration 🔥 Continue comme ça !', likes: 4, createdAt: '2025-06-23T10:30:00Z' },
      { id: 'c2', userId: 'u3', name: 'Fatou Traoré', initials: 'FT', color: '#22C55E', text: 'Waouw ! Comment tu fais pour tenir ? Je lutte avec mes dépenses 😅', likes: 2, createdAt: '2025-06-23T11:00:00Z' },
      { id: 'c3', userId: 'u4', name: 'Marie Koffi', initials: 'MK', color: '#EC4899', text: 'Tu m\'inspires vraiment ! Je commence mon coffre aujourd\'hui 💪', likes: 6, createdAt: '2025-06-23T12:00:00Z' },
    ],
    shares: 12, saved: false, createdAt: '2025-06-23T09:00:00Z',
  },
  {
    id: 'p2', userId: 'u2', name: 'Ibrahim Coulibaly', initials: 'IC', color: '#F97316',
    location: 'Abidjan, Côte d\'Ivoire',
    content: "💡 ASTUCE DU JOUR — La règle des 10%\n\nChaque fois que vous recevez de l'argent sur Wave ou Orange Money, mettez automatiquement 10% dans un coffre FUNTRACK.\n\nEn 3 mois j'ai économisé 87 000 F sans même m'en rendre compte. C'est la magie de l'épargne automatique ! 🤑\n\nVous testez ça ?",
    badge: { type: 'conseil', label: '💡 Conseil Pro' },
    hashtags: ['#wave', '#astuce', '#épargneauto', '#10pourcent'],
    reactions: { like: ['u1','u3','u4'], love: ['u5'], haha: [], wow: ['u6','u7'], fire: ['u8'] },
    comments: [
      { id: 'c4', userId: 'u4', name: 'Marie Koffi', initials: 'MK', color: '#EC4899', text: 'Merci pour le conseil ! Je mets ça en place ce soir 🙏', likes: 3, createdAt: '2025-06-22T14:00:00Z' },
      { id: 'c5', userId: 'u5', name: 'Moussa Sankara', initials: 'MS', color: '#14B8A6', text: 'J\'applique cette règle depuis 2 mois, ça marche vraiment !', likes: 5, createdAt: '2025-06-22T15:30:00Z' },
    ],
    shares: 28, saved: false, createdAt: '2025-06-22T12:00:00Z',
  },
  {
    id: 'p3', userId: 'u3', name: 'Fatou Traoré', initials: 'FT', color: '#22C55E',
    location: 'Bamako, Mali',
    content: "Juin vs Mai — mes finances ce mois :\n\n📈 Revenus : +15% (485 000 F)\n📉 Dépenses : -8% (grâce au budget)\n💰 Épargne : 97 000 F mis de côté\n\nLe dashboard FUNTRACK me montre exactement où va chaque franc. Vraiment utile pour tracker ses progrès !\n\nPartagez vos chiffres du mois ! 👇",
    badge: { type: 'milestone', label: '📈 Revenus +15%', amount: '485 000 F' },
    hashtags: ['#freelance', '#revenus', '#croissance', '#bilan'],
    reactions: { like: ['u1','u2','u4'], love: ['u5','u6'], haha: [], wow: ['u7','u8'], fire: ['u9'] },
    comments: [],
    shares: 7, saved: false, createdAt: '2025-06-21T16:00:00Z',
  },
  {
    id: 'p4', userId: 'u4', name: 'Moussa Sankara', initials: 'MS', color: '#14B8A6',
    content: "🤔 Question communauté :\n\nVous utilisez quel moyen mobile money principalement ?\n\nMoi c'est Orange Money depuis 3 ans mais je pense passer à Wave pour les frais plus bas. Quelqu'un a fait le switch ? Vos retours m'aident à décider !",
    hashtags: ['#mobilemoney', '#question', '#wave', '#orangemoney'],
    reactions: { like: ['u1','u3','u5'], love: [], haha: ['u2'], wow: [], fire: ['u6'] },
    comments: [
      { id: 'c6', userId: 'u1', name: 'Aminata Diallo', initials: 'AD', color: '#8B5CF6', text: 'Wave pour moi ! Les frais sont vraiment imbattables. J\'ai économisé beaucoup depuis le switch.', likes: 8, createdAt: '2025-06-20T10:00:00Z' },
      { id: 'c7', userId: 'u2', name: 'Ibrahim Coulibaly', initials: 'IC', color: '#F97316', text: 'J\'utilise les deux selon les clients. Orange Money est plus universel mais Wave moins cher.', likes: 5, createdAt: '2025-06-20T11:30:00Z' },
    ],
    shares: 4, saved: false, createdAt: '2025-06-20T09:00:00Z',
  },
]

const REACTIONS_CONFIG: { key: Reaction; emoji: string; label: string; color: string }[] = [
  { key: 'like',  emoji: '👍', label: 'J\'aime', color: '#3B82F6' },
  { key: 'love',  emoji: '❤️', label: 'J\'adore', color: '#EF4444' },
  { key: 'haha',  emoji: '😂', label: 'Haha',    color: '#F59E0B' },
  { key: 'wow',   emoji: '😮', label: 'Wow',     color: '#F59E0B' },
  { key: 'fire',  emoji: '🔥', label: 'Feu',     color: '#F97316' },
]

const BADGE_COLORS = { milestone: '#FFD700', objectif: '#22C55E', epargne: '#3B82F6', conseil: '#8B5CF6' }
const TRENDING = ['#épargne', '#wave', '#freelance', '#objectif', '#mobilemoney', '#revenus', '#conseil', '#FUNTRACK']

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'À l\'instant'
  if (h < 24) return `Il y a ${h}h`
  const d = Math.floor(h / 24)
  if (d < 7) return `Il y a ${d}j`
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function totalReactions(reactions: Record<Reaction, string[]>) {
  return Object.values(reactions).reduce((s, arr) => s + arr.length, 0)
}

function topReactions(reactions: Record<Reaction, string[]>) {
  return REACTIONS_CONFIG
    .filter(r => reactions[r.key].length > 0)
    .sort((a, b) => reactions[b.key].length - reactions[a.key].length)
    .slice(0, 3)
    .map(r => r.emoji)
}

// ── Story viewer ────────────────────────────────────────────────────────────────
function StoryViewer({ story, onClose }: { story: RealStory; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={onClose}>
      <div className="relative w-full max-w-sm h-screen flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Progress bar */}
        <div className="absolute top-4 left-4 right-4 h-1 bg-white/20 rounded-full z-10">
          <div className="h-full bg-white rounded-full animate-[grow_5s_linear_forwards]" style={{ width: '100%', animation: 'grow 5s linear forwards', transformOrigin: 'left' }}/>
        </div>
        {/* Header */}
        <div className="flex items-center gap-3 pt-10 px-4 z-10">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0" style={{ background: story.color }}>
            {story.avatar
              ? <img src={story.avatar} className="w-full h-full object-cover" alt=""/>
              : <span className="w-full h-full flex items-center justify-center text-sm font-bold text-white">{story.initials}</span>
            }
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{story.name}</p>
            <p className="text-white/60 text-xs">{timeAgo(story.createdAt)}</p>
          </div>
          <button onClick={onClose} className="ml-auto text-white p-2"><X size={20}/></button>
        </div>
        {/* Content */}
        <div className="flex-1 flex items-center justify-center px-4">
          {story.mediaUrl ? (
            story.mediaType === 'video'
              ? <video src={story.mediaUrl} autoPlay loop className="w-full rounded-2xl max-h-[70vh] object-cover"/>
              : <img src={story.mediaUrl} className="w-full rounded-2xl max-h-[70vh] object-cover" alt=""/>
          ) : (
            <div className="w-full aspect-[9/16] max-h-[70vh] rounded-2xl flex items-center justify-center p-8 text-center"
              style={{ background: story.color + '25', border: `2px solid ${story.color}40` }}>
              <p className="text-white text-xl font-bold leading-relaxed">{story.content}</p>
            </div>
          )}
        </div>
        {/* Reply */}
        <div className="pb-8 px-4">
          <div className="flex items-center gap-3 bg-white/10 rounded-full px-4 py-2.5">
            <input placeholder="Répondre..." className="flex-1 bg-transparent text-white text-sm placeholder-white/50 focus:outline-none"/>
            <Send size={16} className="text-white/60"/>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Create Story modal ───────────────────────────────────────────────────────────
function CreateStoryModal({ myInitials, myColor, myAvatar, onClose, onCreate }: {
  myInitials: string; myColor: string; myAvatar?: string
  onClose: () => void
  onCreate: (content: string, file?: File) => Promise<void>
}) {
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async () => {
    if (!content.trim() && !file) return
    setLoading(true)
    try { await onCreate(content, file || undefined) } finally { setLoading(false) }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#111] rounded-2xl w-full max-w-sm p-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-white font-bold mb-3 text-sm">Créer une story</h3>
        <textarea value={content} onChange={e => setContent(e.target.value)}
          placeholder="Partagez quelque chose pour 24h... 💡"
          rows={3}
          className="w-full bg-[#1e1e1e] text-white text-sm rounded-xl px-3 py-2.5 placeholder-[#555] focus:outline-none resize-none mb-3"/>
        {preview && (
          <div className="relative mb-3 rounded-xl overflow-hidden">
            {file?.type.startsWith('video')
              ? <video src={preview} className="w-full rounded-xl max-h-40 object-cover"/>
              : <img src={preview} className="w-full rounded-xl max-h-40 object-cover" alt=""/>
            }
            <button onClick={() => { setFile(null); setPreview(null) }}
              className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center">
              <X size={11} className="text-white"/>
            </button>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFile}/>
        <div className="flex gap-2">
          <button onClick={() => fileRef.current?.click()}
            className="flex-1 py-2.5 bg-[#1e1e1e] text-[#aaa] text-xs rounded-xl flex items-center justify-center gap-1.5">
            <Image size={13}/> Photo / Vidéo
          </button>
          <button onClick={handleSubmit} disabled={(!content.trim() && !file) || loading}
            className="flex-1 py-2.5 bg-[#fe2c55] text-white text-xs font-bold rounded-xl disabled:opacity-40 flex items-center justify-center gap-1.5">
            {loading ? <Loader2 size={13} className="animate-spin"/> : <Send size={13}/>}
            Publier
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Stories bar ─────────────────────────────────────────────────────────────────
function StoriesBar({ stories, myInitials, myColor, myAvatar, onStoryClick, onCreateClick }: {
  stories: RealStory[]; myInitials: string; myColor: string; myAvatar?: string
  onStoryClick: (s: RealStory) => void
  onCreateClick: () => void
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide mb-4">
      {/* Ma story */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer" onClick={onCreateClick}>
        <div className="relative w-16 h-16 rounded-full overflow-hidden"
          style={{ background: myColor, boxShadow: '0 0 0 2px #161616, 0 0 0 4px #fe2c55' }}>
          {myAvatar
            ? <img src={myAvatar} className="w-full h-full object-cover" alt=""/>
            : <span className="w-full h-full flex items-center justify-center text-sm font-bold text-white">{myInitials}</span>
          }
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[#fe2c55] rounded-full flex items-center justify-center border-2 border-[#161616]">
            <Plus size={10} className="text-white"/>
          </div>
        </div>
        <p className="text-[10px] tt-muted font-medium">Ma story</p>
      </div>
      {/* Stories des autres */}
      {stories.map(s => (
        <div key={s.id} className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer" onClick={() => onStoryClick(s)}>
          <div className="w-16 h-16 rounded-full overflow-hidden"
            style={{
              background: s.color,
              boxShadow: s.seen ? '0 0 0 2px #161616, 0 0 0 4px #444' : `0 0 0 2px #161616, 0 0 0 4px ${s.color}`,
              opacity: s.seen ? 0.6 : 1,
            }}>
            {s.avatar
              ? <img src={s.avatar} className="w-full h-full object-cover" alt={s.name}/>
              : <span className="w-full h-full flex items-center justify-center text-sm font-bold text-white">{s.initials}</span>
            }
          </div>
          <p className="text-[10px] tt-muted font-medium truncate w-16 text-center">{s.name.split(' ')[0]}</p>
        </div>
      ))}
      {stories.length === 0 && (
        <p className="text-xs tt-muted self-center ml-2">Personne n'a encore posté de story. Soyez le premier !</p>
      )}
    </div>
  )
}

// ── Post Card Facebook/Insta style ───────────────────────────────────────────────
function PostCard({ post, currentUserId, currentUserName, currentInitials, currentColor, onReact, onComment, onSave, onShare }: {
  post: Post; currentUserId: string; currentUserName: string
  currentInitials: string; currentColor: string
  onReact: (postId: string, reaction: Reaction) => void
  onComment: (postId: string, text: string) => void
  onSave: (postId: string) => void
  onShare: (postId: string) => void
}) {
  const [showComments, setShowComments] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [showAllComments, setShowAllComments] = useState(false)
  const reactionTimer = useRef<NodeJS.Timeout>()

  const myReaction = (Object.keys(post.reactions) as Reaction[]).find(r => post.reactions[r].includes(currentUserId))
  const total = totalReactions(post.reactions)
  const top = topReactions(post.reactions)
  const visibleComments = showAllComments ? post.comments : post.comments.slice(-2)

  const handleLongPress = () => {
    reactionTimer.current = setTimeout(() => setShowReactions(true), 500)
  }

  return (
    <div className="tt-card border tt-border rounded-2xl overflow-hidden mb-4">

      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <div className="w-11 h-11 rounded-full flex-shrink-0 ring-2 ring-[#2a2a2a] overflow-hidden"
          style={{ background: post.color }}>
          {post.avatar
            ? <img src={post.avatar} alt={post.name} className="w-full h-full object-cover"/>
            : <span className="w-full h-full flex items-center justify-center text-sm font-bold text-white">{post.initials}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">{post.name}</p>
          <p className="text-[11px] tt-muted flex items-center gap-1">
            {timeAgo(post.createdAt)}
            {post.location && <> · 📍 {post.location}</>}
          </p>
        </div>
        <button className="p-1.5 rounded-full tt-hover text-[#666] transition-colors">
          <MoreHorizontal size={16}/>
        </button>
      </div>

      {/* Badge */}
      {post.badge && (
        <div className="mx-4 mb-2 flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: BADGE_COLORS[post.badge.type] + '15' }}>
          <span className="text-sm">{post.badge.label}</span>
          {post.badge.amount && <span className="text-xs font-bold ml-auto" style={{ color: BADGE_COLORS[post.badge.type] }}>{post.badge.amount}</span>}
        </div>
      )}

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-[#ddd] leading-relaxed whitespace-pre-line">{post.content}</p>
        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.hashtags.map(tag => (
              <span key={tag} className="text-xs tt-tag font-bold cursor-pointer hover:underline">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className={cn('grid gap-0.5', post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
          {post.media.map((m, i) => (
            m.type === 'image'
              ? <img key={i} src={m.url} alt="" className="w-full object-cover" style={{ maxHeight: post.media!.length > 1 ? 200 : 400 }}/>
              : (
                <div key={i} className="relative bg-black flex items-center justify-center" style={{ height: 280 }}>
                  <video src={m.url} className="w-full h-full object-cover"/>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
                      <Play size={24} className="text-white ml-1"/>
                    </div>
                  </div>
                </div>
              )
          ))}
        </div>
      )}

      {/* Reaction + comment count */}
      {(total > 0 || post.comments.length > 0 || post.shares > 0) && (
        <div className="flex items-center justify-between px-4 py-2 text-[11px] tt-muted border-b tt-border">
          <div className="flex items-center gap-1">
            {top.length > 0 && <span>{top.join('')}</span>}
            {total > 0 && <span>{total.toLocaleString('fr-FR')}</span>}
          </div>
          <div className="flex items-center gap-3">
            {post.comments.length > 0 && <button onClick={() => setShowComments(v => !v)} className="hover:underline">{post.comments.length} commentaire{post.comments.length > 1 ? 's' : ''}</button>}
            {post.shares > 0 && <span>{post.shares} partages</span>}
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center px-2 py-1 border-b tt-border relative">
        {/* Reactions popup */}
        {showReactions && (
          <div className="absolute bottom-full left-2 mb-2 tt-card border tt-border rounded-2xl shadow-xl p-2 flex gap-1 z-20 animate-fade-in">
            {REACTIONS_CONFIG.map(r => (
              <button key={r.key} onClick={() => { onReact(post.id, r.key); setShowReactions(false) }}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-bg transition-all hover:scale-125">
                <span className="text-2xl">{r.emoji}</span>
                <span className="text-[8px] text-gray-400">{r.label}</span>
              </button>
            ))}
          </div>
        )}

        <button
          onMouseDown={handleLongPress}
          onMouseUp={() => clearTimeout(reactionTimer.current)}
          onMouseLeave={() => { clearTimeout(reactionTimer.current); setTimeout(() => setShowReactions(false), 300) }}
          onClick={() => { if (!showReactions) onReact(post.id, 'like') }}
          className={cn('flex items-center gap-2 flex-1 justify-center py-2 rounded-xl text-xs font-semibold transition-colors',
            myReaction ? 'text-[#fe2c55]' : 'text-[#888] tt-hover')}>
          {myReaction ? (
            <span className="text-base">{REACTIONS_CONFIG.find(r => r.key === myReaction)?.emoji}</span>
          ) : (
            <ThumbsUp size={16}/>
          )}
          {myReaction ? REACTIONS_CONFIG.find(r => r.key === myReaction)?.label : 'J\'aime'}
        </button>

        <button onClick={() => setShowComments(v => !v)}
          className="flex items-center gap-2 flex-1 justify-center py-2 rounded-xl text-xs font-semibold text-[#888] tt-hover transition-colors">
          <MessageCircle size={16}/> Commenter
        </button>

        <button onClick={() => onShare(post.id)}
          className="flex items-center gap-2 flex-1 justify-center py-2 rounded-xl text-xs font-semibold text-[#888] tt-hover transition-colors">
          <Share2 size={16}/> Partager
        </button>

        <button onClick={() => onSave(post.id)}
          className={cn('p-2 rounded-xl transition-colors', post.saved ? 'text-[#fe2c55]' : 'text-[#888] tt-hover')}>
          <Bookmark size={16} fill={post.saved ? 'currentColor' : 'none'}/>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="px-4 py-3 space-y-3">
          {post.comments.length > 2 && !showAllComments && (
            <button onClick={() => setShowAllComments(true)} className="text-xs tt-muted hover:text-white font-medium">
              Voir les {post.comments.length - 2} commentaires précédents
            </button>
          )}
          {visibleComments.map(c => (
            <div key={c.id} className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                style={{ background: c.color }}>{c.initials}</div>
              <div className="flex-1">
                <div className="tt-card2 rounded-2xl px-3 py-2">
                  <p className="text-xs font-bold text-white">{c.name}</p>
                  <p className="text-xs text-[#bbb] mt-0.5">{c.text}</p>
                </div>
                <div className="flex items-center gap-3 mt-1 ml-3">
                  <span className="text-[10px] tt-muted">{timeAgo(c.createdAt)}</span>
                  <button className="text-[10px] text-[#888] font-semibold hover:text-[#fe2c55]">J'aime {c.likes > 0 && `· ${c.likes}`}</button>
                  <button className="text-[10px] text-[#888] font-semibold hover:text-white">Répondre</button>
                </div>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
              style={{ background: currentColor }}>{currentInitials}</div>
            <div className="flex-1 flex items-center gap-2 tt-card2 border tt-border rounded-full px-3 py-2">
              <input value={commentText} onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && commentText.trim()) { onComment(post.id, commentText.trim()); setCommentText('') } }}
                placeholder="Écrire un commentaire..."
                className="flex-1 bg-transparent text-xs text-white placeholder-[#555] focus:outline-none"/>
              <Smile size={14} className="text-[#555]"/>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Reels Tab (TikTok style) ─────────────────────────────────────────────────────
const REELS = [
  { id: 'r1', name: 'Aminata', initials: 'AD', color: '#8B5CF6', caption: '🎯 Comment j\'ai économisé 200 000 F en 6 mois #épargne', likes: 1420, comments: 89 },
  { id: 'r2', name: 'Ibrahim', initials: 'IC', color: '#F97316', caption: '💡 La règle des 10% expliquée en 60s #astuce #wave', likes: 2800, comments: 134 },
  { id: 'r3', name: 'Fatou',   initials: 'FT', color: '#22C55E', caption: '📈 Mon bilan financier de juin — live de mon dashboard', likes: 980, comments: 62 },
]

function ReelsSection() {
  const [activeReel, setActiveReel] = useState(0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {REELS.map((r, i) => (
          <div key={r.id} className="relative rounded-2xl overflow-hidden cursor-pointer group"
            style={{ aspectRatio: '9/16', maxHeight: 400, background: `linear-gradient(135deg, ${r.color}40, ${r.color}80)` }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                style={{ background: r.color }}>
                {r.initials}
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"/>
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-white text-xs font-medium leading-tight mb-2">{r.caption}</p>
              <div className="flex items-center gap-3">
                <span className="text-white/80 text-xs flex items-center gap-1"><Heart size={12}/> {r.likes.toLocaleString('fr-FR')}</span>
                <span className="text-white/80 text-xs flex items-center gap-1"><MessageCircle size={12}/> {r.comments}</span>
              </div>
            </div>
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Play size={14} className="text-white ml-0.5"/>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-gradient-to-br from-gold/10 to-blue-50 dark:from-gold/10 dark:to-blue-900/20 rounded-2xl p-4 text-center border border-gold/20">
        <p className="text-2xl mb-2">🎬</p>
        <p className="text-sm font-bold text-gray-800 dark:text-white">Publiez votre Reel financier</p>
        <p className="text-xs text-gray-500 mt-1">Partagez vos astuces en vidéo courte et inspirez la communauté</p>
        <button className="mt-3 px-4 py-2 bg-gold text-white text-xs font-bold rounded-xl hover:bg-gold-dark transition-colors">
          + Créer un Reel
        </button>
      </div>
    </div>
  )
}

// ── Explorer Tab (Instagram grid) ───────────────────────────────────────────────
const EXPLORE_POSTS = [
  { id: 'e1', emoji: '💰', color: '#22C55E', label: '#épargne', count: '284 posts' },
  { id: 'e2', emoji: '📈', color: '#3B82F6', label: '#revenus', count: '156 posts' },
  { id: 'e3', emoji: '🎯', color: '#8B5CF6', label: '#objectif', count: '203 posts' },
  { id: 'e4', emoji: '💡', color: '#F97316', label: '#astuce', count: '118 posts' },
  { id: 'e5', emoji: '🏦', color: '#14B8A6', label: '#investissement', count: '92 posts' },
  { id: 'e6', emoji: '📱', color: '#EC4899', label: '#mobilemoney', count: '341 posts' },
]

function ExploreSection({ onHashtagClick }: { onHashtagClick: (tag: string) => void }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">🔥 Sujets tendance</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {EXPLORE_POSTS.map(e => (
          <button key={e.id} onClick={() => onHashtagClick(e.label)}
            className="rounded-2xl p-5 flex flex-col items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            style={{ background: e.color + '20', border: `1px solid ${e.color}30` }}>
            <span className="text-3xl">{e.emoji}</span>
            <p className="text-sm font-bold" style={{ color: e.color }}>{e.label}</p>
            <p className="text-[10px] text-gray-500">{e.count}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Compose Box ─────────────────────────────────────────────────────────────────
function ComposeBox({ myInitials, myColor, myAvatar, onPost }: {
  myInitials: string; myColor: string; myAvatar?: string
  onPost: (text: string, badge: any, media: MediaItem[]) => void
}) {
  const [text, setText] = useState('')
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null)
  const [badgeAmount, setBadgeAmount] = useState('')
  const [previews, setPreviews] = useState<MediaItem[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const BADGE_OPTIONS = [
    { id: 'milestone', label: '📈 Milestone', color: '#FFD700' },
    { id: 'objectif',  label: '🎯 Objectif',  color: '#22C55E' },
    { id: 'epargne',   label: '🏦 Épargne',   color: '#3B82F6' },
    { id: 'conseil',   label: '💡 Conseil',   color: '#8B5CF6' },
  ]

  const handleMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const items: MediaItem[] = files.map(f => ({
      type: f.type.startsWith('video') ? 'video' : 'image',
      url: URL.createObjectURL(f),
    }))
    setPreviews(p => [...p, ...items])
    e.target.value = ''
  }

  const submit = () => {
    if (!text.trim() && previews.length === 0) return
    const badge = selectedBadge ? {
      type: selectedBadge,
      label: BADGE_OPTIONS.find(b => b.id === selectedBadge)?.label || '',
      amount: badgeAmount || undefined,
    } : undefined
    onPost(text, badge, previews)
    setText(''); setSelectedBadge(null); setBadgeAmount(''); setPreviews([])
  }

  return (
    <div className="tt-card border tt-border rounded-2xl mb-4 overflow-hidden">
      {/* Top */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden ring-2 ring-[#2a2a2a]" style={{ background: myColor }}>
          {myAvatar
            ? <img src={myAvatar} alt="" className="w-full h-full object-cover"/>
            : <span className="w-full h-full flex items-center justify-center text-sm font-bold text-white">{myInitials}</span>
          }
        </div>
        <button className="flex-1 text-left px-4 py-2.5 tt-card2 rounded-full text-sm text-[#555] hover:bg-[#222] transition-colors"
          onClick={() => (document.getElementById('compose-textarea') as HTMLTextAreaElement)?.focus()}>
          Qu'avez-vous en tête ?
        </button>
      </div>

      {/* Textarea */}
      <div className="px-4 pb-3">
        <textarea
          id="compose-textarea"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Partagez votre expérience financière, une astuce, un objectif atteint... Utilisez #hashtag pour être découvert"
          rows={text ? 4 : 2}
          className="w-full text-sm text-white placeholder-[#555] bg-transparent resize-none focus:outline-none leading-relaxed"
        />

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {BADGE_OPTIONS.map(b => (
            <button key={b.id} onClick={() => setSelectedBadge(selectedBadge === b.id ? null : b.id)}
              className={cn('px-2.5 py-1 rounded-full text-xs font-medium border-2 transition-all',
                selectedBadge === b.id ? 'text-white border-transparent' : 'border-gray-200 dark:border-dark-border text-gray-500')}
              style={selectedBadge === b.id ? { background: b.color, borderColor: b.color } : {}}>
              {b.label}
            </button>
          ))}
        </div>
        {selectedBadge && (
          <input value={badgeAmount} onChange={e => setBadgeAmount(e.target.value)}
            placeholder="Montant optionnel (ex: 150 000 F)"
            className="w-full text-xs border border-gray-100 dark:border-dark-border rounded-xl px-3 py-2 mb-2 bg-gray-50 dark:bg-dark-bg text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gold"/>
        )}

        {/* Media previews */}
        {previews.length > 0 && (
          <div className={cn('grid gap-1.5 mb-3 rounded-2xl overflow-hidden', previews.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
            {previews.map((m, i) => (
              <div key={i} className="relative">
                {m.type === 'image'
                  ? <img src={m.url} className="w-full rounded-2xl object-cover" style={{ maxHeight: 200 }} alt=""/>
                  : <div className="w-full h-32 rounded-2xl bg-gray-800 flex items-center justify-center"><Video size={24} className="text-white"/></div>
                }
                <button onClick={() => setPreviews(p => p.filter((_, idx) => idx !== i))}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center">
                  <X size={12} className="text-white"/>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="flex items-center border-t tt-border px-4 py-2 gap-1">
        <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleMedia}/>
        <button onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-green-400 tt-hover transition-colors">
          <Image size={15}/> Photo
        </button>
        <button onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#fe2c55] tt-hover transition-colors">
          <Video size={15}/> Vidéo
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-yellow-400 tt-hover transition-colors">
          <Smile size={15}/> Feeling
        </button>
        <button onClick={submit} disabled={!text.trim() && previews.length === 0}
          className="ml-auto px-5 py-2 bg-[#fe2c55] text-white text-xs font-bold rounded-xl hover:bg-[#e0254a] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          Publier
        </button>
      </div>
    </div>
  )
}

// ── Types supplémentaires ───────────────────────────────────────────────────────
type Group = {
  id: string; name: string; description: string; category: string
  color: string; emoji: string; members: number; isPrivate: boolean
  joined: boolean; posts: number; cover?: string
}
type Webinar = {
  id: string; title: string; host: string; hostInitials: string; hostColor: string
  description: string; date: string; duration: number; registered: number
  maxSlots: number; isRegistered: boolean; isPast: boolean; tags: string[]
}
type LiveSession = {
  id: string; hostName: string; hostInitials: string; hostColor: string
  title: string; viewers: number; startedAt: string; isLive: boolean
  chatMessages: { name: string; initials: string; color: string; text: string }[]
}

// ── Seed groupes ────────────────────────────────────────────────────────────────
const SEED_GROUPS: Group[] = [
  { id: 'g1', name: 'Épargne & Investissement Afrique', description: 'Partagez vos stratégies d\'épargne et d\'investissement adaptées au contexte africain', category: 'Finance', color: '#22C55E', emoji: '💰', members: 1240, isPrivate: false, joined: true, posts: 48 },
  { id: 'g2', name: 'Freelances & Entrepreneurs CI', description: 'Réseau des freelances et entrepreneurs basés en Côte d\'Ivoire', category: 'Business', color: '#F97316', emoji: '🚀', members: 834, isPrivate: false, joined: false, posts: 31 },
  { id: 'g3', name: 'Mobile Money Experts', description: 'Tout sur Wave, Orange Money, MTN — astuces, comparatifs, actualités', category: 'Tech', color: '#3B82F6', emoji: '📱', members: 2100, isPrivate: false, joined: true, posts: 127 },
  { id: 'g4', name: 'Objectifs 2025 — Challenge Épargne', description: 'Groupe privé pour le challenge épargne annuel. Postez vos progrès chaque semaine !', category: 'Challenge', color: '#8B5CF6', emoji: '🎯', members: 320, isPrivate: true, joined: false, posts: 89 },
  { id: 'g5', name: 'Femmes & Finance', description: 'Espace dédié aux femmes africaines pour parler argent, business et indépendance financière', category: 'Communauté', color: '#EC4899', emoji: '👑', members: 671, isPrivate: false, joined: false, posts: 54 },
  { id: 'g6', name: 'Immobilier Dakar & Abidjan', description: 'Investir dans l\'immobilier en Afrique de l\'Ouest — conseils, opportunités, témoignages', category: 'Immobilier', color: '#14B8A6', emoji: '🏠', members: 445, isPrivate: false, joined: false, posts: 22 },
]

// ── Seed webinaires ─────────────────────────────────────────────────────────────
const SEED_WEBINARS: Webinar[] = [
  {
    id: 'w1', title: 'Comment épargner 20% de ses revenus en Afrique de l\'Ouest',
    host: 'Ibrahim Coulibaly', hostInitials: 'IC', hostColor: '#F97316',
    description: 'Stratégies concrètes et adaptées au contexte africain pour construire une épargne solide même avec un revenu irrégulier.',
    date: new Date(Date.now() + 2 * 86400000).toISOString(),
    duration: 60, registered: 187, maxSlots: 300, isRegistered: false, isPast: false,
    tags: ['#épargne', '#budget', '#revenus'],
  },
  {
    id: 'w2', title: 'Wave vs Orange Money — Comparatif 2025 pour les entrepreneurs',
    host: 'Aminata Diallo', hostInitials: 'AD', hostColor: '#8B5CF6',
    description: 'Analyse complète des deux plateformes : frais, limites, outils business, et lequel choisir selon votre activité.',
    date: new Date(Date.now() + 7 * 86400000).toISOString(),
    duration: 45, registered: 94, maxSlots: 200, isRegistered: true, isPast: false,
    tags: ['#wave', '#orangemoney', '#entrepreneur'],
  },
  {
    id: 'w3', title: 'Investir dans l\'immobilier avec 500 000 FCFA',
    host: 'Moussa Sankara', hostInitials: 'MS', hostColor: '#14B8A6',
    description: 'Est-ce possible ? Quelles stratégies ? Témoignages et cas réels d\'investisseurs débutants.',
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    duration: 90, registered: 412, maxSlots: 400, isRegistered: true, isPast: true,
    tags: ['#immobilier', '#investissement', '#patrimoine'],
  },
]

// ── Seed lives ──────────────────────────────────────────────────────────────────
const SEED_LIVES: LiveSession[] = [
  {
    id: 'l1', hostName: 'Fatou Traoré', hostInitials: 'FT', hostColor: '#22C55E',
    title: '🔴 LIVE — Je révèle mon bilan financier de juin en direct',
    viewers: 143, startedAt: new Date(Date.now() - 18 * 60000).toISOString(), isLive: true,
    chatMessages: [
      { name: 'Kofi', initials: 'KM', color: '#3B82F6', text: 'Waouw impressionnant ! 🔥' },
      { name: 'Marie', initials: 'MK', color: '#EC4899', text: 'Comment tu fais pour les coffres ?' },
      { name: 'Oumar', initials: 'OK', color: '#F97316', text: 'Merci pour les conseils Fatou 🙏' },
    ],
  },
]

// ── Composant GroupCard ─────────────────────────────────────────────────────────
function GroupCard({ group, onToggleJoin }: { group: Group; onToggleJoin: (id: string) => void }) {
  return (
    <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-16 flex items-center justify-center text-4xl relative"
        style={{ background: group.color + '25' }}>
        {group.emoji}
        {group.isPrivate && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
            <Lock size={9} className="text-white"/><span className="text-[9px] text-white">Privé</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-xs font-bold text-gray-800 dark:text-white leading-tight">{group.name}</p>
        </div>
        <p className="text-[10px] text-gray-500 line-clamp-2 mb-2">{group.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <span className="flex items-center gap-1"><Users size={10}/>{group.members.toLocaleString('fr-FR')}</span>
            <span>·</span>
            <span>{group.posts} posts</span>
          </div>
          <button onClick={() => onToggleJoin(group.id)}
            className={cn('px-3 py-1 rounded-full text-[10px] font-bold transition-all',
              group.joined ? 'bg-gray-100 dark:bg-dark-bg text-gray-500 hover:bg-red-50 hover:text-red-500' : 'bg-gold text-white hover:bg-gold-dark')}>
            {group.joined ? 'Membre ✓' : group.isPrivate ? '🔒 Demander' : '+ Rejoindre'}
          </button>
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded-full mt-2 inline-block" style={{ background: group.color + '20', color: group.color }}>{group.category}</span>
      </div>
    </div>
  )
}

// ── Section Groupes ─────────────────────────────────────────────────────────────
function GroupsSection({ myInitials, myColor }: { myInitials: string; myColor: string }) {
  const [groups, setGroups] = useState<Group[]>(SEED_GROUPS)
  const [showCreate, setShowCreate] = useState(false)
  const [newGroup, setNewGroup] = useState({ name: '', description: '', category: 'Finance', isPrivate: false, emoji: '💬' })
  const EMOJIS = ['💬','💰','📈','🚀','🎯','👑','🏠','📱','🤝','💡','🌍','🏆']
  const CATEGORIES = ['Finance','Business','Tech','Communauté','Challenge','Immobilier','Santé','Éducation']

  const toggleJoin = (id: string) => {
    setGroups(g => g.map(gr => gr.id === id ? { ...gr, joined: !gr.joined, members: gr.joined ? gr.members - 1 : gr.members + 1 } : gr))
    const g = groups.find(gr => gr.id === id)
    if (g) toast.success(g.joined ? `Vous avez quitté ${g.name}` : `Bienvenue dans ${g.name} ! 🎉`)
  }

  const createGroup = () => {
    if (!newGroup.name.trim()) return
    const g: Group = {
      id: `g-${Date.now()}`, name: newGroup.name, description: newGroup.description,
      category: newGroup.category, color: myColor, emoji: newGroup.emoji,
      members: 1, isPrivate: newGroup.isPrivate, joined: true, posts: 0,
    }
    setGroups(prev => [g, ...prev])
    setShowCreate(false)
    setNewGroup({ name: '', description: '', category: 'Finance', isPrivate: false, emoji: '💬' })
    toast.success(`Groupe "${g.name}" créé ! 🎉`)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-gray-800 dark:text-white">👥 Groupes & Communautés</h2>
          <p className="text-xs text-gray-400">Rejoignez des groupes thématiques ou créez le vôtre</p>
        </div>
        <button onClick={() => setShowCreate(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2 bg-gold text-white text-xs font-bold rounded-xl hover:bg-gold-dark transition-colors">
          <Plus size={13}/> Créer un groupe
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white dark:bg-dark-card border border-gold/30 rounded-2xl p-4 mb-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3">✨ Nouveau groupe</h3>
          <div className="mb-3">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Choisissez un emoji</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setNewGroup(n => ({ ...n, emoji: e }))}
                  className={cn('w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all',
                    newGroup.emoji === e ? 'bg-gold/20 ring-2 ring-gold' : 'bg-gray-50 dark:bg-dark-bg hover:bg-gray-100')}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <input value={newGroup.name} onChange={e => setNewGroup(n => ({ ...n, name: e.target.value }))}
            placeholder="Nom du groupe *" maxLength={60}
            className="w-full text-sm border border-gray-200 dark:border-dark-border rounded-xl px-3 py-2.5 mb-3 bg-white dark:bg-dark-bg text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gold"/>
          <textarea value={newGroup.description} onChange={e => setNewGroup(n => ({ ...n, description: e.target.value }))}
            placeholder="Description du groupe..." rows={2}
            className="w-full text-sm border border-gray-200 dark:border-dark-border rounded-xl px-3 py-2.5 mb-3 bg-white dark:bg-dark-bg text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gold resize-none"/>
          <div className="flex gap-3 mb-3">
            <select value={newGroup.category} onChange={e => setNewGroup(n => ({ ...n, category: e.target.value }))}
              className="flex-1 text-xs border border-gray-200 dark:border-dark-border rounded-xl px-3 py-2 bg-white dark:bg-dark-bg text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gold">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <button onClick={() => setNewGroup(n => ({ ...n, isPrivate: !n.isPrivate }))}
              className={cn('flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all',
                newGroup.isPrivate ? 'border-gold bg-gold/10 text-gold' : 'border-gray-200 dark:border-dark-border text-gray-500')}>
              {newGroup.isPrivate ? <Lock size={12}/> : <Globe size={12}/>}
              {newGroup.isPrivate ? 'Privé' : 'Public'}
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowCreate(false)} className="flex-1 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-dark-border text-gray-500 hover:bg-gray-50">Annuler</button>
            <button onClick={createGroup} disabled={!newGroup.name.trim()} className="flex-1 py-2 rounded-xl text-xs font-bold bg-gold text-white hover:bg-gold-dark disabled:opacity-40">Créer le groupe</button>
          </div>
        </div>
      )}

      {/* Mes groupes */}
      {groups.filter(g => g.joined).length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Mes groupes</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {groups.filter(g => g.joined).map(g => <GroupCard key={g.id} group={g} onToggleJoin={toggleJoin}/>)}
          </div>
        </div>
      )}

      {/* Suggérés */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Découvrir</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {groups.filter(g => !g.joined).map(g => <GroupCard key={g.id} group={g} onToggleJoin={toggleJoin}/>)}
        </div>
      </div>
    </div>
  )
}

// ── Section Live & Webinaires ───────────────────────────────────────────────────
function LiveSection({ myInitials, myColor, myName }: { myInitials: string; myColor: string; myName: string }) {
  const [webinars, setWebinars] = useState<Webinar[]>(SEED_WEBINARS)
  const [lives, setLives] = useState<LiveSession[]>(SEED_LIVES)
  const [activeLive, setActiveLive] = useState<LiveSession | null>(null)
  const [liveChat, setLiveChat] = useState('')
  const [showSchedule, setShowSchedule] = useState(false)
  const [isGoingLive, setIsGoingLive] = useState(false)
  const [liveTitle, setLiveTitle] = useState('')
  const [newWebinar, setNewWebinar] = useState({ title: '', description: '', date: '', duration: '60' })
  const [liveMuted, setLiveMuted] = useState(false)
  const [liveCamOff, setLiveCamOff] = useState(false)

  const registerWebinar = (id: string) => {
    setWebinars(w => w.map(wb => wb.id === id ? { ...wb, isRegistered: !wb.isRegistered, registered: wb.isRegistered ? wb.registered - 1 : wb.registered + 1 } : wb))
    const wb = webinars.find(w => w.id === id)
    if (wb) toast.success(wb.isRegistered ? 'Inscription annulée' : `Inscrit à "${wb.title}" ! Vous recevrez un rappel 📧`)
  }

  const startLive = () => {
    if (!liveTitle.trim()) return
    const session: LiveSession = {
      id: `l-${Date.now()}`, hostName: myName, hostInitials: myInitials, hostColor: myColor,
      title: `🔴 LIVE — ${liveTitle}`, viewers: 0,
      startedAt: new Date().toISOString(), isLive: true, chatMessages: [],
    }
    setLives(prev => [session, ...prev])
    setActiveLive(session)
    setIsGoingLive(false)
    setLiveTitle('')
    toast.success('Vous êtes en direct ! 🔴')
  }

  const sendLiveChat = () => {
    if (!liveChat.trim() || !activeLive) return
    const msg = { name: myName, initials: myInitials, color: myColor, text: liveChat }
    setActiveLive(l => l ? { ...l, chatMessages: [...l.chatMessages, msg] } : l)
    setLiveChat('')
  }

  const scheduleWebinar = () => {
    if (!newWebinar.title || !newWebinar.date) return
    const wb: Webinar = {
      id: `w-${Date.now()}`, title: newWebinar.title,
      host: myName, hostInitials: myInitials, hostColor: myColor,
      description: newWebinar.description,
      date: new Date(newWebinar.date).toISOString(),
      duration: Number(newWebinar.duration),
      registered: 0, maxSlots: 200, isRegistered: true, isPast: false, tags: [],
    }
    setWebinars(prev => [wb, ...prev])
    setShowSchedule(false)
    setNewWebinar({ title: '', description: '', date: '', duration: '60' })
    toast.success(`Webinaire "${wb.title}" planifié ! 📅`)
  }

  // Viewer Live modal
  if (activeLive) return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-dark-border bg-gray-900">
      {/* Live header */}
      <div className="relative bg-gray-800 flex items-center justify-center" style={{ minHeight: 300 }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white ring-4 ring-red-500 animate-pulse"
            style={{ background: activeLive.hostColor }}>{activeLive.hostInitials}</div>
          <p className="text-white font-bold text-sm">{activeLive.hostName}</p>
          <p className="text-white/60 text-xs px-4 text-center">{activeLive.title}</p>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full"><Radio size={10} className="animate-pulse"/> EN DIRECT</span>
            <span className="text-white/60 text-xs">{activeLive.viewers} spectateurs</span>
          </div>
        </div>
        {/* My controls if host */}
        {activeLive.hostInitials === myInitials && (
          <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3">
            <button onClick={() => setLiveMuted(v => !v)}
              className={cn('w-11 h-11 rounded-full flex items-center justify-center transition-all', liveMuted ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30')}>
              {liveMuted ? <MicOff size={16} className="text-white"/> : <Mic size={16} className="text-white"/>}
            </button>
            <button onClick={() => setLiveCamOff(v => !v)}
              className={cn('w-11 h-11 rounded-full flex items-center justify-center transition-all', liveCamOff ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30')}>
              {liveCamOff ? <VideoOff size={16} className="text-white"/> : <Video size={16} className="text-white"/>}
            </button>
            <button onClick={() => { setActiveLive(null); setLives(l => l.filter(s => s.id !== activeLive.id)); toast('Live terminé') }}
              className="w-11 h-11 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all">
              <PhoneOff size={16} className="text-white"/>
            </button>
          </div>
        )}
        {activeLive.hostInitials !== myInitials && (
          <button onClick={() => setActiveLive(null)} className="absolute top-3 right-3 p-1.5 bg-black/40 rounded-full"><X size={14} className="text-white"/></button>
        )}
      </div>

      {/* Live chat */}
      <div className="bg-gray-900 p-3" style={{ minHeight: 180 }}>
        <p className="text-xs font-bold text-white/60 mb-2">💬 Chat en direct</p>
        <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
          {activeLive.chatMessages.map((m, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0" style={{ background: m.color }}>{m.initials}</div>
              <div><span className="text-[10px] font-bold text-white/70">{m.name} </span><span className="text-[10px] text-white/60">{m.text}</span></div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={liveChat} onChange={e => setLiveChat(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendLiveChat()}
            placeholder="Envoyer un message..."
            className="flex-1 bg-white/10 rounded-full px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:bg-white/15"/>
          <button onClick={sendLiveChat} className="w-8 h-8 rounded-full bg-gold flex items-center justify-center flex-shrink-0"><Send size={13} className="text-white"/></button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Actions rapides */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setIsGoingLive(v => !v)}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 hover:border-red-400 transition-all group">
          <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Radio size={20} className="text-white"/>
          </div>
          <p className="text-xs font-bold text-red-600">🔴 Démarrer un Live</p>
          <p className="text-[10px] text-red-400 text-center">Diffusez en temps réel à votre communauté</p>
        </button>
        <button onClick={() => setShowSchedule(v => !v)}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/20 hover:border-blue-400 transition-all group">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Calendar size={20} className="text-white"/>
          </div>
          <p className="text-xs font-bold text-blue-600">📅 Planifier un Webinaire</p>
          <p className="text-[10px] text-blue-400 text-center">Programmez une session interactive</p>
        </button>
      </div>

      {/* Go Live form */}
      {isGoingLive && (
        <div className="bg-gray-900 rounded-2xl p-4 border border-red-500/30">
          <p className="text-white font-bold text-sm mb-3 flex items-center gap-2"><Radio size={14} className="text-red-500 animate-pulse"/> Démarrer un Live</p>
          <input value={liveTitle} onChange={e => setLiveTitle(e.target.value)}
            placeholder="Titre de votre live (ex: Je partage mon bilan mensuel...)"
            className="w-full bg-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:bg-white/15 mb-3"/>
          <div className="flex gap-2">
            <button onClick={() => setIsGoingLive(false)} className="flex-1 py-2 rounded-xl text-xs font-bold border border-white/20 text-white/60">Annuler</button>
            <button onClick={startLive} disabled={!liveTitle.trim()}
              className="flex-1 py-2 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 disabled:opacity-40 flex items-center justify-center gap-1.5">
              <Radio size={12}/> Démarrer
            </button>
          </div>
        </div>
      )}

      {/* Schedule webinar form */}
      {showSchedule && (
        <div className="bg-white dark:bg-dark-card border border-blue-200 dark:border-blue-900/40 rounded-2xl p-4">
          <p className="text-sm font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2"><Calendar size={14} className="text-blue-500"/> Planifier un webinaire</p>
          <input value={newWebinar.title} onChange={e => setNewWebinar(n => ({ ...n, title: e.target.value }))}
            placeholder="Titre du webinaire *"
            className="w-full text-sm border border-gray-200 dark:border-dark-border rounded-xl px-3 py-2.5 mb-3 bg-white dark:bg-dark-bg text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gold"/>
          <textarea value={newWebinar.description} onChange={e => setNewWebinar(n => ({ ...n, description: e.target.value }))}
            placeholder="Description — de quoi allez-vous parler ?" rows={2}
            className="w-full text-sm border border-gray-200 dark:border-dark-border rounded-xl px-3 py-2.5 mb-3 bg-white dark:bg-dark-bg text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gold resize-none"/>
          <div className="flex gap-3 mb-3">
            <input type="datetime-local" value={newWebinar.date} onChange={e => setNewWebinar(n => ({ ...n, date: e.target.value }))}
              className="flex-1 text-sm border border-gray-200 dark:border-dark-border rounded-xl px-3 py-2 bg-white dark:bg-dark-bg text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gold"/>
            <select value={newWebinar.duration} onChange={e => setNewWebinar(n => ({ ...n, duration: e.target.value }))}
              className="text-sm border border-gray-200 dark:border-dark-border rounded-xl px-3 py-2 bg-white dark:bg-dark-bg text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gold">
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">1h</option>
              <option value="90">1h30</option>
              <option value="120">2h</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowSchedule(false)} className="flex-1 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-dark-border text-gray-500">Annuler</button>
            <button onClick={scheduleWebinar} disabled={!newWebinar.title || !newWebinar.date}
              className="flex-1 py-2 rounded-xl text-xs font-bold bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40">Planifier</button>
          </div>
        </div>
      )}

      {/* Lives actifs */}
      {lives.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block"/>En direct maintenant
          </p>
          <div className="space-y-3">
            {lives.map(live => (
              <button key={live.id} onClick={() => setActiveLive(live)}
                className="w-full text-left bg-gray-900 rounded-2xl overflow-hidden hover:ring-2 hover:ring-red-500 transition-all">
                <div className="flex items-center gap-3 p-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm"
                      style={{ background: live.hostColor }}>{live.hostInitials}</div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse"/>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-xs truncate">{live.title}</p>
                    <p className="text-white/60 text-[10px] mt-0.5 flex items-center gap-1">
                      <Users size={9}/> {live.viewers} spectateurs · démarré il y a {Math.floor((Date.now() - new Date(live.startedAt).getTime()) / 60000)} min
                    </p>
                  </div>
                  <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">LIVE</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Webinaires */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">📅 Webinaires</p>
        <div className="space-y-3">
          {webinars.map(wb => (
            <div key={wb.id} className={cn('bg-white dark:bg-dark-card border rounded-2xl p-4', wb.isPast ? 'border-gray-100 dark:border-dark-border opacity-70' : 'border-gray-100 dark:border-dark-border')}>
              {wb.isPast && <span className="text-[9px] font-bold text-gray-400 bg-gray-100 dark:bg-dark-bg rounded-full px-2 py-0.5 mb-2 inline-block">Terminé — Replay disponible</span>}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
                  style={{ background: wb.hostColor }}>{wb.hostInitials}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 dark:text-white leading-tight mb-1">{wb.title}</p>
                  <p className="text-[10px] text-gray-500 line-clamp-2 mb-2">{wb.description}</p>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-3 flex-wrap">
                    <span className="flex items-center gap-1"><Calendar size={10}/>{new Date(wb.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="flex items-center gap-1"><Clock size={10}/>{wb.duration} min</span>
                    <span className="flex items-center gap-1"><Users size={10}/>{wb.registered}/{wb.maxSlots} inscrits</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-dark-bg rounded-full mb-3">
                    <div className="h-full rounded-full bg-gold" style={{ width: `${Math.min(100, (wb.registered / wb.maxSlots) * 100)}%` }}/>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {wb.tags.map(t => <span key={t} className="text-[9px] text-blue-500">{t}</span>)}
                    </div>
                    <button onClick={() => registerWebinar(wb.id)}
                      className={cn('px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all flex-shrink-0',
                        wb.isPast ? 'bg-gray-100 dark:bg-dark-bg text-gray-500 hover:bg-blue-50 hover:text-blue-500'
                        : wb.isRegistered ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-500'
                        : wb.registered >= wb.maxSlots ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gold text-white hover:bg-gold-dark')}>
                      {wb.isPast ? '▶ Voir le replay' : wb.isRegistered ? '✓ Inscrit' : wb.registered >= wb.maxSlots ? 'Complet' : 'S\'inscrire'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────────
export default function FuntwitPage() {
  const { user } = useAppStore()
  const { posts, isLoading: postsLoading, createPost, react, addComment, sharePost } = useFuntwitPosts()
  const { stories, createStory, markSeen } = useFuntwitStories()
  const [activeTab, setActiveTab] = useState<'feed'|'reels'|'explorer'|'groupes'|'live'>('feed')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeStory, setActiveStory] = useState<RealStory | null>(null)
  const [showCreateStory, setShowCreateStory] = useState(false)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  const currentUserId = user?.id || 'me'
  const currentUserName = user ? `${user.firstName} ${user.lastName}` : 'Moi'
  const currentInitials = user ? `${user.firstName?.[0] || '?'}${user.lastName?.[0] || ''}` : 'ME'
  const currentColor = '#06D6A0'
  const currentAvatar = user?.avatar

  const handlePost = async (text: string, badge: any, media: MediaItem[]) => {
    const hashtags = text.match(/#\w+/g) || []
    createPost.mutate({
      content: text, badge, media, hashtags, color: currentColor,
      _tempId: `temp-${Date.now()}`,
      _name: currentUserName,
      _initials: currentInitials,
    })
    toast.success('Publication partagée sur FUNTWIT ! 🎉')
  }

  const handleReact = (postId: string, reaction: Reaction) => {
    react.mutate({ postId, reaction, userId: currentUserId })
  }

  const handleComment = (postId: string, text: string) => {
    addComment.mutate({ postId, text })
  }

  const handleSave = (postId: string) => {
    setSavedIds(s => {
      const next = new Set(s)
      if (next.has(postId)) next.delete(postId)
      else next.add(postId)
      return next
    })
    toast.success(savedIds.has(postId) ? 'Post retiré des sauvegardes' : 'Post sauvegardé !')
  }

  const handleShare = (postId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/funtwit#${postId}`)
    toast.success('Lien copié ! Partagez sur WhatsApp 📲')
    sharePost.mutate(postId)
  }

  const handleStoryClick = (story: RealStory) => {
    markSeen(story.id, currentUserId)
    setActiveStory(story)
  }

  const filteredPosts = (posts as any[]).filter(p =>
    !searchQuery || p.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.hashtags || []).some((h: string) => h.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const communityStats = [
    { label: 'Membres', value: '1.2k', icon: '👥' },
    { label: 'Posts ce mois', value: '486', icon: '📝' },
    { label: 'Objectifs partagés', value: '342', icon: '🎯' },
    { label: 'Épargne collective', value: '128M F', icon: '💰' },
  ]

  const suggestedMembers = [
    { name: 'Mariam Balde', initials: 'MB', color: '#EC4899', bio: 'Freelance · Conakry', mutual: 3 },
    { name: 'Oumar Kone', initials: 'OK', color: '#3B82F6', bio: 'Business · Dakar', mutual: 5 },
    { name: 'Aïcha Touré', initials: 'AT', color: '#14B8A6', bio: 'Entrepreneur · Lomé', mutual: 2 },
  ]

  return (
    <AppLayout>
      {/* Story viewer */}
      {activeStory && <StoryViewer story={activeStory} onClose={() => setActiveStory(null)}/>}
      {/* Create story modal */}
      {showCreateStory && (
        <CreateStoryModal
          myInitials={currentInitials} myColor={currentColor} myAvatar={currentAvatar}
          onClose={() => setShowCreateStory(false)}
          onCreate={async (content, file) => {
            await createStory.mutateAsync({ content, mediaFile: file })
            toast.success('Story publiée pour 24h ! ✨')
          }}
        />
      )}

      {/* ── Theme override ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
        .tt { color-scheme: dark; font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif !important; }
        .tt * { font-family: inherit !important; }
        .tt-bg   { background: #000 !important; }
        .tt-card { background: #161616 !important; border-color: #2a2a2a !important; }
        .tt-card2{ background: #111 !important; border-color: #222 !important; }
        .tt-input{ background: #1e1e1e !important; border-color: #333 !important; color: #fff !important; }
        .tt-text { color: #fff !important; }
        .tt-sub  { color: #aaa !important; }
        .tt-muted{ color: #666 !important; }
        .tt-btn  { background: #fff !important; color: #000 !important; }
        .tt-btn:hover { background: #ddd !important; }
        .tt-tag  { color: #fe2c55 !important; }
        .tt-red  { color: #fe2c55 !important; }
        .tt-border { border-color: #2a2a2a !important; }
        .tt-hover:hover { background: #1e1e1e !important; }
        .tt select, .tt input, .tt textarea { background: #1e1e1e !important; border-color: #333 !important; color: #fff !important; }
        .tt select option { background: #1e1e1e; color: #fff; }
      `}</style>

      <div className="tt tt-bg -m-4 md:-m-5 p-4 md:p-5 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold tt-text flex items-center gap-2">
            <span className="text-2xl">🌍</span> <span className="text-white">Fun</span><span className="text-[#fe2c55]">Twit</span>
          </h1>
          <p className="text-xs tt-sub">La communauté FUNTRACK — partagez, inspirez, progressez</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]"/>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="pl-8 pr-4 py-2 text-xs border border-[#2a2a2a] rounded-full bg-[#161616] text-white placeholder-[#555] focus:outline-none focus:border-[#fe2c55] w-44"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Centre ─────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          {/* Stories */}
          <StoriesBar stories={stories} myInitials={currentInitials} myColor={currentColor} myAvatar={currentAvatar}
            onStoryClick={handleStoryClick} onCreateClick={() => setShowCreateStory(true)}/>

          {/* Tabs */}
          <div className="flex bg-[#111] rounded-2xl p-1 mb-4 gap-1 overflow-x-auto scrollbar-hide">
            {([
              { id: 'feed',     label: '🏠 Fil' },
              { id: 'reels',    label: '🎬 Reels' },
              { id: 'groupes',  label: '👥 Groupes' },
              { id: 'live',     label: '🔴 Live' },
              { id: 'explorer', label: '🔍 Explorer' },
            ] as const).map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={cn('flex-shrink-0 px-3 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap',
                  activeTab === t.id
                    ? 'bg-[#fe2c55] text-white shadow-sm'
                    : 'text-[#888] hover:text-white hover:bg-[#1e1e1e]')}>
                {t.label}
                {t.id === 'live' && SEED_LIVES.length > 0 && (
                  <span className="ml-1 w-1.5 h-1.5 rounded-full bg-red-500 inline-block animate-pulse"/>
                )}
              </button>
            ))}
          </div>

          {/* Feed */}
          {activeTab === 'feed' && (
            <>
              <ComposeBox myInitials={currentInitials} myColor={currentColor} myAvatar={currentAvatar} onPost={handlePost}/>
              {postsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-[#fe2c55] border-t-transparent rounded-full animate-spin"/>
                    <p className="text-[#888] text-xs">Chargement des publications...</p>
                  </div>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-5xl mb-3">{searchQuery ? '🔍' : '✨'}</p>
                  <p className="text-sm font-medium text-white">
                    {searchQuery ? `Aucun post pour "${searchQuery}"` : 'Soyez le premier à publier !'}
                  </p>
                  {!searchQuery && <p className="text-xs text-[#888] mt-1">Partagez votre expérience financière avec la communauté</p>}
                </div>
              ) : (
                filteredPosts.map(post => (
                  <PostCard key={post.id} post={{ ...post, saved: savedIds.has(post.id) }}
                    currentUserId={currentUserId} currentUserName={currentUserName}
                    currentInitials={currentInitials} currentColor={currentColor}
                    onReact={handleReact} onComment={handleComment}
                    onSave={handleSave} onShare={handleShare}
                  />
                ))
              )}
            </>
          )}

          {/* Reels */}
          {activeTab === 'reels' && <ReelsSection/>}

          {/* Groupes */}
          {activeTab === 'groupes' && (
            <GroupsSection myInitials={currentInitials} myColor={currentColor}/>
          )}

          {/* Live */}
          {activeTab === 'live' && (
            <LiveSection myInitials={currentInitials} myColor={currentColor} myName={currentUserName}/>
          )}

          {/* Explorer */}
          {activeTab === 'explorer' && (
            <ExploreSection onHashtagClick={tag => { setSearchQuery(tag); setActiveTab('feed') }}/>
          )}
        </div>

        {/* ── Sidebar droite TikTok ──────────────────────────────────── */}
        <div className="space-y-4">
          {/* Mon profil */}
          <div className="tt-card border tt-border rounded-2xl overflow-hidden">
            <div className="h-16 bg-gradient-to-r from-[#fe2c55]/40 to-[#06D6A0]/30"/>
            <div className="px-4 pb-4 -mt-8">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white border-4 border-[#161616] mb-2"
                style={{ background: currentColor }}>{currentInitials}</div>
              <p className="text-sm font-bold text-white">{currentUserName}</p>
              <p className="text-xs tt-sub">{user?.profile || 'Particulier'}</p>
              <div className="flex gap-4 mt-3 text-center">
                <div><p className="text-sm font-bold text-white">{(posts as any[]).filter(p => p.userId === currentUserId).length}</p><p className="text-[10px] tt-muted">Posts</p></div>
                <div><p className="text-sm font-bold text-white">0</p><p className="text-[10px] tt-muted">Abonnés</p></div>
                <div><p className="text-sm font-bold text-white">0</p><p className="text-[10px] tt-muted">Abonnements</p></div>
              </div>
            </div>
          </div>

          {/* Stats communauté */}
          <div className="tt-card border tt-border rounded-2xl p-4">
            <h3 className="text-sm font-bold text-white mb-3">📊 Communauté</h3>
            <div className="grid grid-cols-2 gap-2">
              {communityStats.map((s, i) => (
                <div key={i} className="tt-card2 border tt-border rounded-xl p-2.5 text-center">
                  <p className="text-base mb-0.5">{s.icon}</p>
                  <p className="text-sm font-bold text-white">{s.value}</p>
                  <p className="text-[10px] tt-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          <div className="tt-card border tt-border rounded-2xl p-4">
            <h3 className="text-sm font-bold text-white mb-3">👥 Personnes à suivre</h3>
            <div className="space-y-3">
              {suggestedMembers.map((m, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: m.color }}>{m.initials}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{m.name}</p>
                    <p className="text-[10px] tt-muted">{m.bio}</p>
                  </div>
                  <button className="px-3 py-1 bg-white text-black text-[10px] font-bold rounded-full hover:bg-gray-200 transition-colors flex-shrink-0">
                    Suivre
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Trending */}
          <div className="tt-card border tt-border rounded-2xl p-4">
            <h3 className="text-sm font-bold text-white mb-3">🔥 Tendances</h3>
            <div className="space-y-1">
              {TRENDING.map((tag, i) => (
                <button key={tag} onClick={() => { setSearchQuery(tag); setActiveTab('feed') }}
                  className="w-full flex items-center justify-between py-1.5 tt-hover rounded-xl px-2 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] tt-muted font-mono w-4">{i + 1}</span>
                    <span className="text-xs font-bold tt-tag">{tag}</span>
                  </div>
                  <span className="text-[10px] tt-muted">{Math.floor(Math.random() * 200) + 50} posts</span>
                </button>
              ))}
            </div>
          </div>

          {/* Règles */}
          <div className="tt-card border border-[#fe2c55]/20 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-white mb-2">📋 Règles FUNTWIT</h3>
            <ul className="space-y-1 text-[11px] tt-sub">
              <li>✅ Partagez vos succès financiers</li>
              <li>✅ Donnez des conseils constructifs</li>
              <li>✅ Respectez la vie privée de chacun</li>
              <li>❌ Pas de pub non sollicitée</li>
              <li>❌ Pas de données financières sensibles</li>
            </ul>
          </div>
        </div>
      </div>

      </div>{/* end tt wrapper */}
    </AppLayout>
  )
}
