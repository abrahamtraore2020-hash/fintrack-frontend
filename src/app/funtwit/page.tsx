'use client'
import { useState, useRef } from 'react'
import {
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  ThumbsUp, Laugh, Zap, Search, Image, Video, X, Play,
  Plus, TrendingUp, Target, BarChart2, Users, Compass,
  ChevronLeft, ChevronRight, Send, Smile
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

// ── Types ───────────────────────────────────────────────────────────────────────
type Reaction = 'like' | 'love' | 'haha' | 'wow' | 'fire'
type MediaItem = { type: 'image' | 'video'; url: string }
type Badge = { type: 'milestone'|'objectif'|'epargne'|'conseil'; label: string; amount?: string }
type Story = { id: string; userId: string; name: string; initials: string; color: string; seen: boolean; content: string }
type Comment = { id: string; userId: string; name: string; initials: string; color: string; text: string; likes: number; createdAt: string }
type Post = {
  id: string; userId: string; name: string; initials: string; color: string
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
function StoryViewer({ story, onClose }: { story: Story; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={onClose}>
      <div className="relative w-full max-w-sm h-screen flex flex-col items-center justify-center"
        onClick={e => e.stopPropagation()}>
        <div className="w-full h-2 bg-white/20 rounded-full mb-4 mx-6" style={{ width: 'calc(100% - 3rem)' }}>
          <div className="h-full bg-white rounded-full" style={{ width: '60%', transition: 'width 5s linear' }}/>
        </div>
        <div className="flex items-center gap-3 mb-auto px-4 w-full">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ background: story.color }}>{story.initials}</div>
          <div>
            <p className="text-white font-semibold text-sm">{story.name}</p>
            <p className="text-white/60 text-xs">À l'instant</p>
          </div>
          <button onClick={onClose} className="ml-auto text-white"><X size={20}/></button>
        </div>
        <div className="flex-1 flex items-center justify-center w-full px-6">
          <div className="w-full aspect-[9/16] max-h-[70vh] rounded-2xl flex items-center justify-center text-6xl"
            style={{ background: story.color + '30', border: `2px solid ${story.color}40` }}>
            {story.content}
          </div>
        </div>
        <div className="mt-auto pb-8 px-4 w-full">
          <div className="flex items-center gap-3 bg-white/10 rounded-full px-4 py-2.5">
            <input placeholder="Répondre..." className="flex-1 bg-transparent text-white text-sm placeholder-white/50 focus:outline-none"/>
            <Send size={16} className="text-white/60"/>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Stories bar ─────────────────────────────────────────────────────────────────
function StoriesBar({ stories, myInitials, myColor, onStoryClick }: {
  stories: Story[]; myInitials: string; myColor: string; onStoryClick: (s: Story) => void
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide mb-4">
      {/* Ma story */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer group">
        <div className="relative w-16 h-16 rounded-full flex items-center justify-center text-sm font-bold text-white"
          style={{ background: myColor, boxShadow: '0 0 0 3px white, 0 0 0 4px #E5E7EB' }}>
          {myInitials}
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-gold rounded-full flex items-center justify-center border-2 border-white">
            <Plus size={10} className="text-white"/>
          </div>
        </div>
        <p className="text-[10px] text-gray-500 font-medium">Ma story</p>
      </div>
      {/* Stories des autres */}
      {stories.map(s => (
        <div key={s.id} className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer" onClick={() => onStoryClick(s)}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{
              background: s.color,
              boxShadow: s.seen ? '0 0 0 3px white, 0 0 0 4px #D1D5DB' : `0 0 0 3px white, 0 0 0 4px ${s.color}`,
              opacity: s.seen ? 0.7 : 1,
            }}>
            {s.initials}
          </div>
          <p className="text-[10px] text-gray-500 font-medium truncate w-16 text-center">{s.name}</p>
        </div>
      ))}
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
    <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl overflow-hidden mb-4 shadow-sm">

      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ring-2 ring-white dark:ring-dark-card"
          style={{ background: post.color }}>
          {post.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 dark:text-white">{post.name}</p>
          <p className="text-[11px] text-gray-400 flex items-center gap-1">
            {timeAgo(post.createdAt)}
            {post.location && <> · 📍 {post.location}</>}
          </p>
        </div>
        <button className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg text-gray-400 transition-colors">
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
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{post.content}</p>
        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.hashtags.map(tag => (
              <span key={tag} className="text-xs text-blue-500 font-medium cursor-pointer hover:underline">{tag}</span>
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
        <div className="flex items-center justify-between px-4 py-2 text-[11px] text-gray-400 border-b border-gray-50 dark:border-dark-border">
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
      <div className="flex items-center px-2 py-1 border-b border-gray-50 dark:border-dark-border relative">
        {/* Reactions popup */}
        {showReactions && (
          <div className="absolute bottom-full left-2 mb-2 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl shadow-xl p-2 flex gap-1 z-20 animate-fade-in">
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
            myReaction ? 'text-blue-500' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-bg')}>
          {myReaction ? (
            <span className="text-base">{REACTIONS_CONFIG.find(r => r.key === myReaction)?.emoji}</span>
          ) : (
            <ThumbsUp size={16}/>
          )}
          {myReaction ? REACTIONS_CONFIG.find(r => r.key === myReaction)?.label : 'J\'aime'}
        </button>

        <button onClick={() => setShowComments(v => !v)}
          className="flex items-center gap-2 flex-1 justify-center py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors">
          <MessageCircle size={16}/> Commenter
        </button>

        <button onClick={() => onShare(post.id)}
          className="flex items-center gap-2 flex-1 justify-center py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors">
          <Share2 size={16}/> Partager
        </button>

        <button onClick={() => onSave(post.id)}
          className={cn('p-2 rounded-xl transition-colors', post.saved ? 'text-gold' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-bg')}>
          <Bookmark size={16} fill={post.saved ? 'currentColor' : 'none'}/>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="px-4 py-3 space-y-3">
          {post.comments.length > 2 && !showAllComments && (
            <button onClick={() => setShowAllComments(true)} className="text-xs text-gray-500 hover:text-gray-700 font-medium">
              Voir les {post.comments.length - 2} commentaires précédents
            </button>
          )}
          {visibleComments.map(c => (
            <div key={c.id} className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                style={{ background: c.color }}>{c.initials}</div>
              <div className="flex-1">
                <div className="bg-gray-50 dark:bg-dark-bg rounded-2xl px-3 py-2">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{c.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{c.text}</p>
                </div>
                <div className="flex items-center gap-3 mt-1 ml-3">
                  <span className="text-[10px] text-gray-400">{timeAgo(c.createdAt)}</span>
                  <button className="text-[10px] text-gray-500 font-semibold hover:text-blue-500">J'aime {c.likes > 0 && `· ${c.likes}`}</button>
                  <button className="text-[10px] text-gray-500 font-semibold hover:text-blue-500">Répondre</button>
                </div>
              </div>
            </div>
          ))}

          {/* Write comment */}
          <div className="flex items-center gap-2 mt-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
              style={{ background: currentColor }}>{currentInitials}</div>
            <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-full px-3 py-2">
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && commentText.trim()) { onComment(post.id, commentText.trim()); setCommentText('') } }}
                placeholder="Écrire un commentaire..."
                className="flex-1 bg-transparent text-xs text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none"
              />
              <Smile size={14} className="text-gray-400"/>
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
function ComposeBox({ myInitials, myColor, onPost }: {
  myInitials: string; myColor: string
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
    <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl mb-4 shadow-sm overflow-hidden">
      {/* Top */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ background: myColor }}>{myInitials}</div>
        <button className="flex-1 text-left px-4 py-2.5 bg-gray-50 dark:bg-dark-bg rounded-full text-sm text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
          onClick={() => (document.getElementById('compose-textarea') as HTMLTextAreaElement)?.focus()}>
          Qu'avez-vous en tête ?
        </button>
      </div>

      {/* Textarea (expands when focused) */}
      <div className="px-4 pb-3">
        <textarea
          id="compose-textarea"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Partagez votre expérience financière, une astuce, un objectif atteint... Utilisez #hashtag pour être découvert"
          rows={text ? 4 : 2}
          className="w-full text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 bg-transparent resize-none focus:outline-none leading-relaxed"
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
      <div className="flex items-center border-t border-gray-50 dark:border-dark-border px-4 py-2 gap-1">
        <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleMedia}/>
        <button onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
          <Image size={15}/> Photo
        </button>
        <button onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <Video size={15}/> Vidéo
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors">
          <Smile size={15}/> Feeling
        </button>
        <button onClick={submit} disabled={!text.trim() && previews.length === 0}
          className="ml-auto px-5 py-2 bg-gold text-white text-xs font-bold rounded-xl hover:bg-gold-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          Publier
        </button>
      </div>
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────────
export default function FuntwitPage() {
  const { user } = useAppStore()
  const [posts, setPosts] = useState<Post[]>(SEED_POSTS)
  const [activeTab, setActiveTab] = useState<'feed'|'reels'|'explorer'>('feed')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeStory, setActiveStory] = useState<Story | null>(null)
  const [stories, setStories] = useState<Story[]>(STORIES)

  const currentUserId = user?.id || 'me'
  const currentUserName = user ? `${user.firstName} ${user.lastName}` : 'Moi'
  const currentInitials = user ? `${user.firstName?.[0] || '?'}${user.lastName?.[0] || ''}` : 'ME'
  const currentColor = '#06D6A0'

  const handlePost = (text: string, badge: any, media: MediaItem[]) => {
    const hashtags = text.match(/#\w+/g) || []
    const post: Post = {
      id: `p-${Date.now()}`, userId: currentUserId,
      name: currentUserName, initials: currentInitials, color: currentColor,
      content: text, badge, media: media.length > 0 ? media : undefined,
      hashtags, reactions: { like: [], love: [], haha: [], wow: [], fire: [] },
      comments: [], shares: 0, saved: false, createdAt: new Date().toISOString(),
    }
    setPosts(p => [post, ...p])
    toast.success('Publication partagée sur FUNTWIT ! 🎉')
  }

  const handleReact = (postId: string, reaction: Reaction) => {
    setPosts(p => p.map(post => {
      if (post.id !== postId) return post
      const newReactions = { ...post.reactions }
      // Remove existing reaction
      ;(Object.keys(newReactions) as Reaction[]).forEach(r => {
        newReactions[r] = newReactions[r].filter(id => id !== currentUserId)
      })
      // Add new if different
      const wasReacted = (Object.keys(post.reactions) as Reaction[]).some(r =>
        r === reaction && post.reactions[r].includes(currentUserId)
      )
      if (!wasReacted) newReactions[reaction] = [...newReactions[reaction], currentUserId]
      return { ...post, reactions: newReactions }
    }))
  }

  const handleComment = (postId: string, text: string) => {
    setPosts(p => p.map(post => {
      if (post.id !== postId) return post
      const comment: Comment = {
        id: `c-${Date.now()}`, userId: currentUserId,
        name: currentUserName, initials: currentInitials,
        color: currentColor, text, likes: 0,
        createdAt: new Date().toISOString(),
      }
      return { ...post, comments: [...post.comments, comment] }
    }))
  }

  const handleSave = (postId: string) => {
    setPosts(p => p.map(post => post.id === postId ? { ...post, saved: !post.saved } : post))
    toast.success('Post sauvegardé !')
  }

  const handleShare = (postId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/funtwit#${postId}`)
    toast.success('Lien copié ! Partagez sur WhatsApp 📲')
    setPosts(p => p.map(post => post.id === postId ? { ...post, shares: post.shares + 1 } : post))
  }

  const handleStoryClick = (story: Story) => {
    setStories(s => s.map(st => st.id === story.id ? { ...st, seen: true } : st))
    setActiveStory(story)
  }

  const filteredPosts = posts.filter(p =>
    !searchQuery || p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.hashtags.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()))
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

      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <span className="text-2xl">🌍</span> Fun<span className="text-gold">Twit</span>
          </h1>
          <p className="text-xs text-gray-500">La communauté FUNTRACK — partagez, inspirez, progressez</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="pl-8 pr-4 py-2 text-xs border border-gray-200 dark:border-dark-border rounded-full bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gold w-44"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Centre ─────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          {/* Stories */}
          <StoriesBar stories={stories} myInitials={currentInitials} myColor={currentColor} onStoryClick={handleStoryClick}/>

          {/* Tabs */}
          <div className="flex bg-gray-100 dark:bg-dark-bg rounded-2xl p-1 mb-4 gap-1">
            {([
              { id: 'feed',     label: '🏠 Fil d\'actu', icon: null },
              { id: 'reels',    label: '🎬 Reels',        icon: null },
              { id: 'explorer', label: '🔍 Explorer',     icon: null },
            ] as const).map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={cn('flex-1 py-2.5 rounded-xl text-xs font-bold transition-all',
                  activeTab === t.id
                    ? 'bg-white dark:bg-dark-card text-gray-800 dark:text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300')}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Feed */}
          {activeTab === 'feed' && (
            <>
              <ComposeBox myInitials={currentInitials} myColor={currentColor} onPost={handlePost}/>
              {filteredPosts.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-5xl mb-3">🔍</p>
                  <p className="text-sm font-medium">Aucun post trouvé pour "{searchQuery}"</p>
                </div>
              ) : (
                filteredPosts.map(post => (
                  <PostCard key={post.id} post={post}
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

          {/* Explorer */}
          {activeTab === 'explorer' && (
            <ExploreSection onHashtagClick={tag => { setSearchQuery(tag); setActiveTab('feed') }}/>
          )}
        </div>

        {/* ── Sidebar droite ─────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Mon profil */}
          <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl overflow-hidden">
            <div className="h-16 bg-gradient-to-r from-gold/40 to-blue-400/40"/>
            <div className="px-4 pb-4 -mt-8">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white border-4 border-white dark:border-dark-card mb-2"
                style={{ background: currentColor }}>{currentInitials}</div>
              <p className="text-sm font-bold text-gray-800 dark:text-white">{currentUserName}</p>
              <p className="text-xs text-gray-500">{user?.profile || 'Particulier'}</p>
              <div className="flex gap-4 mt-3 text-center">
                <div><p className="text-sm font-bold text-gray-800 dark:text-white">{posts.filter(p => p.userId === currentUserId).length}</p><p className="text-[10px] text-gray-400">Posts</p></div>
                <div><p className="text-sm font-bold text-gray-800 dark:text-white">0</p><p className="text-[10px] text-gray-400">Abonnés</p></div>
                <div><p className="text-sm font-bold text-gray-800 dark:text-white">0</p><p className="text-[10px] text-gray-400">Abonnements</p></div>
              </div>
            </div>
          </div>

          {/* Stats communauté */}
          <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-4">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">📊 Communauté FUNTRACK</h3>
            <div className="grid grid-cols-2 gap-2">
              {communityStats.map((s, i) => (
                <div key={i} className="bg-gray-50 dark:bg-dark-bg rounded-xl p-2.5 text-center">
                  <p className="text-base mb-0.5">{s.icon}</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white">{s.value}</p>
                  <p className="text-[10px] text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-4">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">👥 Personnes à suivre</h3>
            <div className="space-y-3">
              {suggestedMembers.map((m, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: m.color }}>{m.initials}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{m.name}</p>
                    <p className="text-[10px] text-gray-400">{m.bio} · {m.mutual} amis communs</p>
                  </div>
                  <button className="px-2.5 py-1 bg-gold/10 text-gold text-[10px] font-bold rounded-full hover:bg-gold/20 transition-colors flex-shrink-0">
                    + Suivre
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Trending */}
          <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-4">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">🔥 Tendances</h3>
            <div className="space-y-1">
              {TRENDING.map((tag, i) => (
                <button key={tag} onClick={() => { setSearchQuery(tag); setActiveTab('feed') }}
                  className="w-full flex items-center justify-between py-1.5 hover:bg-gray-50 dark:hover:bg-dark-bg rounded-xl px-2 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-300 font-mono w-4">{i + 1}</span>
                    <span className="text-xs font-medium text-blue-500">{tag}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">{(Math.floor(Math.random() * 200) + 50)}  posts</span>
                </button>
              ))}
            </div>
          </div>

          {/* Règles */}
          <div className="bg-gold/5 border border-gold/20 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-2">📋 Règles FUNTWIT</h3>
            <ul className="space-y-1 text-[11px] text-gray-500">
              <li>✅ Partagez vos succès financiers</li>
              <li>✅ Donnez des conseils constructifs</li>
              <li>✅ Respectez la vie privée de chacun</li>
              <li>❌ Pas de pub non sollicitée</li>
              <li>❌ Pas de données financières sensibles</li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
