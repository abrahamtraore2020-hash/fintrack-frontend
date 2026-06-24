'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Image, Video, X, Search, Phone, Video as VideoIcon, MoreVertical, ArrowLeft, Smile, Paperclip, Check, CheckCheck } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────
type MediaItem = { type: 'image' | 'video'; url: string; name: string }
type Message = {
  id: string
  senderId: string
  content: string
  media?: MediaItem[]
  createdAt: string
  read: boolean
}
type Conversation = {
  id: string
  participantId: string
  participantName: string
  participantInitials: string
  participantColor: string
  participantProfile: string
  messages: Message[]
  online: boolean
}

// ── Seed data ──────────────────────────────────────────────────────────────────
const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv1', participantId: 'u1',
    participantName: 'Aminata Diallo', participantInitials: 'AD',
    participantColor: '#8B5CF6', participantProfile: 'Freelance · Dakar', online: true,
    messages: [
      { id: 'm1', senderId: 'u1', content: 'Salut ! Tu as vu mon post sur FUNTWIT ? J\'ai atteint mon objectif 🎉', createdAt: new Date(Date.now() - 3600000).toISOString(), read: true },
      { id: 'm2', senderId: 'me', content: 'Oui félicitations ! Comment tu as fait pour tenir autant ?', createdAt: new Date(Date.now() - 3500000).toISOString(), read: true },
      { id: 'm3', senderId: 'u1', content: 'Le coffre automatique de FinTrack ! Je mets 10% de chaque Wave reçu automatiquement. Tu devrais essayer 😊', createdAt: new Date(Date.now() - 1800000).toISOString(), read: false },
    ],
  },
  {
    id: 'conv2', participantId: 'u2',
    participantName: 'Ibrahim Coulibaly', participantInitials: 'IC',
    participantColor: '#F97316', participantProfile: 'Business · Abidjan', online: true,
    messages: [
      { id: 'm4', senderId: 'u2', content: 'Bonjour ! Tu utilises Stripe ou PayPal pour tes paiements freelance ?', createdAt: new Date(Date.now() - 86400000).toISOString(), read: true },
      { id: 'm5', senderId: 'me', content: 'Stripe principalement, les frais sont plus bas pour l\'Afrique.', createdAt: new Date(Date.now() - 82800000).toISOString(), read: true },
      { id: 'm6', senderId: 'u2', content: 'Merci pour le conseil ! Je vais tester ça cette semaine.', createdAt: new Date(Date.now() - 79200000).toISOString(), read: true },
    ],
  },
  {
    id: 'conv3', participantId: 'u3',
    participantName: 'Fatou Traoré', participantInitials: 'FT',
    participantColor: '#22C55E', participantProfile: 'Particulier · Bamako', online: false,
    messages: [
      { id: 'm7', senderId: 'u3', content: 'Coucou ! Tu peux m\'expliquer comment fonctionne les coffres virtuels ?', createdAt: new Date(Date.now() - 172800000).toISOString(), read: true },
      { id: 'm8', senderId: 'me', content: 'Bien sûr ! C\'est comme des enveloppes d\'épargne. Ton argent reste sur Wave mais tu le "taggues" mentalement.', createdAt: new Date(Date.now() - 169200000).toISOString(), read: true },
    ],
  },
  {
    id: 'conv4', participantId: 'u4',
    participantName: 'Moussa Sankara', participantInitials: 'MS',
    participantColor: '#14B8A6', participantProfile: 'Entrepreneur · Ouaga', online: false,
    messages: [
      { id: 'm9', senderId: 'u4', content: 'Tu regardes mon post sur les mobile money ?', createdAt: new Date(Date.now() - 259200000).toISOString(), read: true },
    ],
  },
]

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'maintenant'
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d === 1) return 'hier'
  if (d < 7) return `${d}j`
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

// ── Message bubble ─────────────────────────────────────────────────────────────
function MessageBubble({ msg, isMe }: { msg: Message; isMe: boolean }) {
  return (
    <div className={cn('flex mb-3', isMe ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[75%] space-y-1')}>
        {/* Media */}
        {msg.media && msg.media.length > 0 && (
          <div className={cn('grid gap-1 mb-1', msg.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
            {msg.media.map((m, i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-gray-100 dark:bg-dark-bg">
                {m.type === 'image' ? (
                  <img src={m.url} alt={m.name} className="w-full max-h-48 object-cover"/>
                ) : (
                  <video src={m.url} controls className="w-full max-h-48 object-cover"/>
                )}
              </div>
            ))}
          </div>
        )}
        {/* Text */}
        {msg.content && (
          <div className={cn('px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
            isMe
              ? 'bg-gold text-[#1A1A2E] rounded-br-sm'
              : 'bg-gray-100 dark:bg-dark-bg text-gray-800 dark:text-white rounded-bl-sm'
          )}>
            {msg.content}
          </div>
        )}
        {/* Time + read */}
        <div className={cn('flex items-center gap-1', isMe ? 'justify-end' : 'justify-start')}>
          <span className="text-[10px] text-gray-400">{timeAgo(msg.createdAt)}</span>
          {isMe && (
            msg.read
              ? <CheckCheck size={12} className="text-blue-500"/>
              : <Check size={12} className="text-gray-400"/>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function InboxPage() {
  const { user } = useAppStore()
  const [conversations, setConversations] = useState<Conversation[]>(SEED_CONVERSATIONS)
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [mediaPreviews, setMediaPreviews] = useState<MediaItem[]>([])
  const [search, setSearch] = useState('')
  const [showMobileChat, setShowMobileChat] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentUserId = 'me'
  const currentInitials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'ME'

  const activeConv = conversations.find(c => c.id === activeConvId)
  const unreadTotal = conversations.reduce((sum, c) => sum + c.messages.filter(m => !m.read && m.senderId !== 'me').length, 0)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConv?.messages.length])

  // Mark as read when opening
  const openConv = (convId: string) => {
    setActiveConvId(convId)
    setShowMobileChat(true)
    setConversations(prev => prev.map(c => {
      if (c.id !== convId) return c
      return { ...c, messages: c.messages.map(m => ({ ...m, read: true })) }
    }))
  }

  const handleMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const items: MediaItem[] = files.map(f => ({
      type: f.type.startsWith('video') ? 'video' : 'image',
      url: URL.createObjectURL(f),
      name: f.name,
    }))
    setMediaPreviews(p => [...p, ...items])
    e.target.value = ''
  }

  const sendMessage = () => {
    if (!message.trim() && mediaPreviews.length === 0) return
    if (!activeConvId) return

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      senderId: 'me',
      content: message.trim(),
      media: mediaPreviews.length > 0 ? [...mediaPreviews] : undefined,
      createdAt: new Date().toISOString(),
      read: false,
    }
    setConversations(prev => prev.map(c =>
      c.id === activeConvId ? { ...c, messages: [...c.messages, newMsg] } : c
    ))
    setMessage('')
    setMediaPreviews([])
  }

  const filteredConvs = conversations.filter(c =>
    c.participantName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppLayout>
      <div className="h-[calc(100vh-7rem)] flex gap-4 overflow-hidden">

        {/* ── Conversations list ─────────────────────────────────────── */}
        <div className={cn(
          'w-full md:w-80 flex-shrink-0 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl flex flex-col overflow-hidden',
          showMobileChat ? 'hidden md:flex' : 'flex'
        )}>
          {/* Header */}
          <div className="p-4 border-b border-gray-100 dark:border-dark-border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-800 dark:text-white text-sm flex items-center gap-2">
                Messages
                {unreadTotal > 0 && (
                  <span className="bg-gold text-[#1A1A2E] text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadTotal}</span>
                )}
              </h2>
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher une conversation..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl focus:outline-none focus:border-gold text-gray-700 dark:text-gray-300"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConvs.map(conv => {
              const lastMsg = conv.messages[conv.messages.length - 1]
              const unread = conv.messages.filter(m => !m.read && m.senderId !== 'me').length
              const isActive = conv.id === activeConvId
              return (
                <button key={conv.id} onClick={() => openConv(conv.id)}
                  className={cn('w-full flex items-center gap-3 p-3.5 text-left hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors border-b border-gray-50 dark:border-dark-border/50',
                    isActive ? 'bg-yellow-50 dark:bg-yellow-900/10' : '')}>
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: conv.participantColor }}>
                      {conv.participantInitials}
                    </div>
                    {conv.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white dark:border-dark-card rounded-full"/>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={cn('text-sm font-semibold truncate', unread > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300')}>
                        {conv.participantName}
                      </span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{timeAgo(lastMsg.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={cn('text-xs truncate max-w-[160px]', unread > 0 ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-400')}>
                        {lastMsg.senderId === 'me' ? 'Vous: ' : ''}{lastMsg.media ? '📎 Média' : lastMsg.content}
                      </p>
                      {unread > 0 && (
                        <span className="bg-gold text-[#1A1A2E] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ml-1">{unread}</span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Chat window ────────────────────────────────────────────── */}
        <div className={cn(
          'flex-1 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl flex flex-col overflow-hidden',
          !showMobileChat ? 'hidden md:flex' : 'flex'
        )}>
          {activeConv ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-dark-border">
                <button onClick={() => setShowMobileChat(false)} className="md:hidden p-1 rounded-lg text-gray-400 hover:text-gray-700">
                  <ArrowLeft size={18}/>
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: activeConv.participantColor }}>
                    {activeConv.participantInitials}
                  </div>
                  {activeConv.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white dark:border-dark-card rounded-full"/>}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{activeConv.participantName}</p>
                  <p className="text-xs text-gray-400">{activeConv.online ? '🟢 En ligne' : '⚫ Hors ligne'} · {activeConv.participantProfile}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg text-gray-400 hover:text-gray-700 transition-colors">
                    <Phone size={16}/>
                  </button>
                  <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg text-gray-400 hover:text-gray-700 transition-colors">
                    <VideoIcon size={16}/>
                  </button>
                  <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg text-gray-400 hover:text-gray-700 transition-colors">
                    <MoreVertical size={16}/>
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {activeConv.messages.map(msg => (
                  <MessageBubble key={msg.id} msg={msg} isMe={msg.senderId === 'me'}/>
                ))}
                <div ref={messagesEndRef}/>
              </div>

              {/* Media previews */}
              {mediaPreviews.length > 0 && (
                <div className="flex gap-2 px-4 py-2 border-t border-gray-50 dark:border-dark-border overflow-x-auto">
                  {mediaPreviews.map((m, i) => (
                    <div key={i} className="relative flex-shrink-0">
                      {m.type === 'image'
                        ? <img src={m.url} className="w-16 h-16 rounded-xl object-cover" alt="preview"/>
                        : <div className="w-16 h-16 rounded-xl bg-gray-900 flex items-center justify-center"><Video size={20} className="text-white"/></div>
                      }
                      <button onClick={() => setMediaPreviews(p => p.filter((_, idx) => idx !== i))}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <X size={10} className="text-white"/>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-gray-100 dark:border-dark-border">
                <div className="flex items-end gap-2 bg-gray-50 dark:bg-dark-bg rounded-2xl px-3 py-2 border border-gray-100 dark:border-dark-border focus-within:border-gold transition-colors">
                  {/* Media button */}
                  <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleMedia}/>
                  <button onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 text-gray-400 hover:text-gold transition-colors flex-shrink-0">
                    <Paperclip size={18}/>
                  </button>
                  {/* Text */}
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                    placeholder="Écrire un message... (Entrée pour envoyer)"
                    rows={1}
                    className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none resize-none max-h-24"
                    style={{ lineHeight: '1.5' }}
                  />
                  {/* Send */}
                  <button onClick={sendMessage}
                    disabled={!message.trim() && mediaPreviews.length === 0}
                    className="p-2 bg-gold text-[#1A1A2E] rounded-xl hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0">
                    <Send size={15}/>
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-1.5">📎 Cliquez sur le trombone pour joindre photo/vidéo</p>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Vos messages privés</h3>
              <p className="text-sm text-gray-400 max-w-xs">Sélectionnez une conversation à gauche ou contactez un membre depuis FUNTWIT</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
