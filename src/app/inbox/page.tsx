'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Image, Video, X, Search, Phone, Video as VideoIcon, MoreVertical, ArrowLeft, Smile, Paperclip, Check, CheckCheck, Loader2, MessageSquarePlus } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useAppStore } from '@/store/useAppStore'
import { useInbox } from '@/hooks/useInbox'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type MediaItem = { type: 'image' | 'video'; url: string; name: string }

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

export default function InboxPage() {
  const { user } = useAppStore()
  const { conversations, isLoading, sendMessage, markRead } = useInbox()
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [mediaPreviews, setMediaPreviews] = useState<MediaItem[]>([])
  const [search, setSearch] = useState('')
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [sending, setSending] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentUserId = user?.id || ''
  const currentInitials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'ME'

  const activeConv = conversations.find(c => c.id === activeConvId)
  const unreadTotal = conversations.reduce((sum, c) =>
    sum + c.messages.filter(m => !m.read && m.senderId !== currentUserId).length, 0)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConv?.messages.length])

  const openConv = (convId: string) => {
    setActiveConvId(convId)
    setShowMobileChat(true)
    if (currentUserId) markRead.mutate({ conversationId: convId, userId: currentUserId })
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

  const handleSend = async () => {
    if (!message.trim() && mediaPreviews.length === 0) return
    if (!activeConvId) return
    setSending(true)
    try {
      await sendMessage.mutateAsync({
        conversationId: activeConvId,
        content: message.trim(),
        media: mediaPreviews.length > 0 ? mediaPreviews : undefined,
      })
      setMessage('')
      setMediaPreviews([])
    } catch {
      toast.error('Erreur lors de l\'envoi')
    } finally {
      setSending(false)
    }
  }

  const filteredConvs = conversations.filter(c =>
    c.participantName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppLayout>
      <div className="h-[calc(100vh-7rem)] flex gap-4 overflow-hidden">

        {/* ── Liste conversations ─────────────────────────────────────── */}
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
                  <span className="bg-gold text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadTotal}</span>
                )}
              </h2>
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl focus:outline-none focus:border-gold text-gray-700 dark:text-gray-300"/>
            </div>
          </div>

          {/* Liste */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={20} className="animate-spin text-gold"/>
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aucune conversation</p>
                <p className="text-xs text-gray-400 mt-1">Contactez un membre depuis FunTwit pour démarrer</p>
              </div>
            ) : (
              filteredConvs.map(conv => {
                const lastMsg = conv.messages[conv.messages.length - 1]
                const unread = conv.messages.filter(m => !m.read && m.senderId !== currentUserId).length
                const isActive = conv.id === activeConvId
                return (
                  <button key={conv.id} onClick={() => openConv(conv.id)}
                    className={cn('w-full flex items-center gap-3 p-3.5 text-left hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors border-b border-gray-50 dark:border-dark-border/50',
                      isActive ? 'bg-gold/5 border-l-2 border-l-gold' : '')}>
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: conv.participantColor }}>
                        {conv.participantInitials}
                      </div>
                      {conv.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white dark:border-dark-card rounded-full"/>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={cn('text-sm font-semibold truncate', unread > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300')}>
                          {conv.participantName}
                        </span>
                        {lastMsg && <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{timeAgo(lastMsg.createdAt)}</span>}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={cn('text-xs truncate max-w-[160px]', unread > 0 ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-400')}>
                          {lastMsg ? (lastMsg.senderId === currentUserId ? 'Vous: ' : '') + (lastMsg.media ? '📎 Média' : lastMsg.content) : 'Nouvelle conversation'}
                        </p>
                        {unread > 0 && (
                          <span className="bg-gold text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ml-1">{unread}</span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* ── Fenêtre chat ────────────────────────────────────────────── */}
        <div className={cn(
          'flex-1 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl flex flex-col overflow-hidden',
          !showMobileChat ? 'hidden md:flex' : 'flex'
        )}>
          {activeConv ? (
            <>
              {/* Header chat */}
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
                  <p className="text-xs text-gray-400">{activeConv.online ? '🟢 En ligne' : '⚫ Hors ligne'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg text-gray-400 transition-colors"><Phone size={16}/></button>
                  <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg text-gray-400 transition-colors"><VideoIcon size={16}/></button>
                  <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg text-gray-400 transition-colors"><MoreVertical size={16}/></button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeConv.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="text-4xl mb-2">👋</div>
                    <p className="text-sm text-gray-500">Commencez la conversation !</p>
                  </div>
                ) : (
                  activeConv.messages.map(msg => {
                    const isMe = msg.senderId === currentUserId
                    return (
                      <div key={msg.id} className={cn('flex mb-3', isMe ? 'justify-end' : 'justify-start')}>
                        <div className="max-w-[75%] space-y-1">
                          {msg.media && msg.media.length > 0 && (
                            <div className={cn('grid gap-1 mb-1', msg.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
                              {msg.media.map((m, i) => (
                                <div key={i} className="rounded-xl overflow-hidden bg-gray-100 dark:bg-dark-bg">
                                  {m.type === 'image'
                                    ? <img src={m.url} alt={m.name} className="w-full max-h-48 object-cover"/>
                                    : <video src={m.url} controls className="w-full max-h-48"/>
                                  }
                                </div>
                              ))}
                            </div>
                          )}
                          {msg.content && (
                            <div className={cn('px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
                              isMe ? 'bg-gold text-white rounded-br-sm' : 'bg-gray-100 dark:bg-dark-bg text-gray-800 dark:text-white rounded-bl-sm')}>
                              {msg.content}
                            </div>
                          )}
                          <div className={cn('flex items-center gap-1', isMe ? 'justify-end' : 'justify-start')}>
                            <span className="text-[10px] text-gray-400">{timeAgo(msg.createdAt)}</span>
                            {isMe && (msg.read ? <CheckCheck size={12} className="text-blue-500"/> : <Check size={12} className="text-gray-400"/>)}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef}/>
              </div>

              {/* Media previews */}
              {mediaPreviews.length > 0 && (
                <div className="flex gap-2 px-4 py-2 border-t border-gray-50 dark:border-dark-border overflow-x-auto">
                  {mediaPreviews.map((m, i) => (
                    <div key={i} className="relative flex-shrink-0">
                      {m.type === 'image'
                        ? <img src={m.url} className="w-16 h-16 rounded-xl object-cover" alt=""/>
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
                  <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleMedia}/>
                  <button onClick={() => fileInputRef.current?.click()} className="p-1.5 text-gray-400 hover:text-gold transition-colors flex-shrink-0">
                    <Paperclip size={18}/>
                  </button>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                    placeholder="Écrire un message... (Entrée pour envoyer)"
                    rows={1}
                    className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none resize-none max-h-24"
                    style={{ lineHeight: '1.5' }}
                  />
                  <button onClick={handleSend}
                    disabled={(!message.trim() && mediaPreviews.length === 0) || sending}
                    className="p-2 bg-gold text-white rounded-xl hover:bg-gold-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0">
                    {sending ? <Loader2 size={15} className="animate-spin"/> : <Send size={15}/>}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Vos messages privés</h3>
              <p className="text-sm text-gray-400 max-w-xs">Sélectionnez une conversation ou contactez un membre depuis FunTwit</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
