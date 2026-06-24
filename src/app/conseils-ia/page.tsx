'use client'
import { useState, useRef, useEffect } from 'react'
import { Brain, Send, Sparkles, TrendingUp, PiggyBank, Target, RefreshCw } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

type Message = { role: 'user' | 'ai'; content: string; timestamp: Date }

const INITIAL_MESSAGES: Message[] = [
  {
    role: 'ai',
    content: 'Bonjour Kofi ! 👋 Je suis votre conseiller IA FinTrack. J\'ai analysé vos finances du mois de juin et j\'ai plusieurs recommandations personnalisées pour vous. Par où voulez-vous commencer ?',
    timestamp: new Date(),
  },
]

const QUICK_PROMPTS = [
  { icon: TrendingUp, label: 'Analyser mes dépenses', prompt: 'Analyse mes dépenses du mois et dis-moi où je peux économiser.' },
  { icon: PiggyBank, label: 'Optimiser mon épargne', prompt: 'Comment puis-je améliorer mon taux d\'épargne ce mois-ci ?' },
  { icon: Target, label: 'Atteindre mes objectifs', prompt: 'Quel est le meilleur plan pour atteindre mon objectif Vacances Dakar à temps ?' },
  { icon: Brain, label: 'Conseil budgétaire', prompt: 'Donne-moi un plan budgétaire adapté à mon profil freelance.' },
]

const AI_RESPONSES: Record<string, string> = {
  default: 'Bonne question ! En analysant vos données de juin 2025, je constate que votre taux d\'épargne de 35.6% est excellent — bien au-dessus des 20% recommandés. Voici mon conseil principal : réallouez 5% de vos dépenses alimentaires (environ 15 000 F) vers votre coffre Vacances Dakar pour l\'atteindre 3 mois plus tôt.',
  depenses: '📊 Analyse de vos dépenses — Juin 2025 :\n\n• 🏠 Logement : 120 000 F (35%) — dans la norme\n• 🍽️ Alimentation : 87 200 F (28%) — légèrement élevé\n• 🚗 Transport : 37 500 F (12%) — correct\n• 🎭 Loisirs : 31 200 F (10%) — acceptable\n\n💡 Recommandation : Réduisez vos dépenses alimentaires de 10% (~8 700 F) en planifiant vos repas. Redirigez ce montant vers votre coffre Vacances.',
  epargne: '💰 Votre profil d\'épargne actuel :\n\nTaux actuel : **35.6%** (Excellent !)\nÉpargne mensuelle : ~172 600 F\n\nPour optimiser :\n1. Augmentez le coffre Vacances de 10 000 F → 26 000 F/mois\n2. Activez l\'épargne automatique sur Wave (5% de chaque entrée)\n3. Créez un coffre "Fonds d\'urgence" de 500 000 F\n\n📈 En appliquant ces 3 actions, votre patrimoine atteindra 2.1M FCFA d\'ici décembre.',
  objectifs: '🎯 Plan pour Vacances Dakar (200 000 F) :\n\nÉtat actuel : 45 000 F / 200 000 F (22.5%)\nManque : 155 000 F\nDélai : 6 mois (Décembre 2025)\n\nPlan recommandé :\n• Contribution mensuelle nécessaire : 25 833 F\n• Actuelle : 10 000 F → Augmenter de +15 833 F\n• Source suggérée : Réduire "Loisirs" de 10 000 F + 5 833 F depuis revenus freelance\n\n✅ Faisable ! Avec ce plan, vous l\'atteignez le 28 novembre 2025.',
  budget: '📋 Plan budgétaire personnalisé — Profil Freelance :\n\nBasé sur vos revenus moyens de 450 000 F/mois :\n\n• 35% Logement + charges fixes : 157 500 F\n• 20% Alimentation : 90 000 F\n• 10% Transport : 45 000 F\n• 5% Santé : 22 500 F\n• 5% Loisirs : 22 500 F\n• 25% Épargne & Coffres : 112 500 F\n\nVos revenus freelance varient : gardez toujours 3 mois de charges en réserve avant tout investissement.',
}

function getAIResponse(msg: string): string {
  const lower = msg.toLowerCase()
  if (lower.includes('dépense') || lower.includes('économis')) return AI_RESPONSES.depenses
  if (lower.includes('épargne') || lower.includes('taux')) return AI_RESPONSES.epargne
  if (lower.includes('objectif') || lower.includes('vacances') || lower.includes('plan')) return AI_RESPONSES.objectifs
  if (lower.includes('budget') || lower.includes('freelance') || lower.includes('budgétaire')) return AI_RESPONSES.budget
  return AI_RESPONSES.default
}

const AI_TIPS = [
  { icon: '💡', title: 'Conseil du jour', desc: 'Vos dépenses alimentaires ont augmenté de 8% ce mois-ci. Planifier vos repas pour la semaine peut économiser jusqu\'à 15 000 FCFA.', variant: 'gold' as const },
  { icon: '📈', title: 'Opportunité d\'épargne', desc: 'Vous avez reçu 335 000 F de revenus freelance ce mois. Allouer 15% automatiquement sur Wave vous économisera 50 000 F sans effort.', variant: 'blue' as const },
  { icon: '🎯', title: 'Objectif en danger', desc: 'L\'objectif "Ordinateur Pro" est en retard de 14 mois. Un versement exceptionnel de 50 000 F ce mois le remettrait sur les rails.', variant: 'red' as const },
]

export default function ConseilsIAPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { role: 'user', content: text, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)
    await new Promise(r => setTimeout(r, 1200))
    const aiMsg: Message = { role: 'ai', content: getAIResponse(text), timestamp: new Date() }
    setMessages(prev => [...prev, aiMsg])
    setIsTyping(false)
  }

  return (
    <AppLayout>
      <div className="mb-5">
        <h1 className="text-lg font-bold text-gray-800 dark:text-white">
          Conseils <span className="text-glow-blue">IA</span>
        </h1>
        <p className="text-sm text-gray-500">Votre conseiller financier personnel propulsé par Claude AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chat */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="flex flex-col" style={{ height: 520 }}>
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-dark-border mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Brain size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">FinTrack AI</p>
                <p className="text-[10px] text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />En ligne</p>
              </div>
              <button onClick={() => setMessages(INITIAL_MESSAGES)} className="ml-auto text-gray-400 hover:text-gray-600">
                <RefreshCw size={14} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {messages.map((msg, i) => (
                <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {msg.role === 'ai' && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                      <Brain size={10} className="text-white" />
                    </div>
                  )}
                  <div className={cn('max-w-xs lg:max-w-sm rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line',
                    msg.role === 'user'
                      ? 'bg-[#FFD700] text-[#1A1A2E] rounded-tr-sm font-medium'
                      : 'bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 rounded-tl-sm'
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Brain size={10} className="text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-dark-card rounded-2xl rounded-tl-sm px-4 py-2.5 flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick prompts */}
            <div className="flex gap-2 py-2 overflow-x-auto">
              {QUICK_PROMPTS.map((qp, i) => {
                const Icon = qp.icon
                return (
                  <button key={i} onClick={() => sendMessage(qp.prompt)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-dark-card text-[10px] text-gray-600 dark:text-gray-400 hover:bg-yellow-50 hover:text-yellow-700 dark:hover:bg-yellow-900/20 transition-colors whitespace-nowrap flex-shrink-0">
                    <Icon size={11} />
                    {qp.label}
                  </button>
                )
              })}
            </div>

            {/* Input */}
            <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-dark-border">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                placeholder="Posez votre question financière..."
                className="flex-1 text-xs px-3.5 py-2.5 border border-gray-200 dark:border-dark-border rounded-xl bg-white dark:bg-dark-bg text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:border-gold"
              />
              <button onClick={() => sendMessage(input)} disabled={!input.trim() || isTyping}
                className="w-9 h-9 rounded-xl bg-gold flex items-center justify-center disabled:opacity-40 hover:bg-gold-dark transition-colors">
                <Send size={14} className="text-[#1A1A2E]" />
              </button>
            </div>
          </Card>
        </div>

        {/* Sidebar tips */}
        <div className="space-y-3">
          <Card>
            <CardTitle><Sparkles size={16} className="text-gold" /> Analyses automatiques</CardTitle>
            <div className="space-y-3">
              {AI_TIPS.map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
                  <span className="text-lg">{tip.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-white mb-0.5">{tip.title}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle><Brain size={16} className="text-gold" /> Capacités IA</CardTitle>
            <div className="space-y-2">
              {[
                'Analyse de vos dépenses en temps réel',
                'Plans d\'épargne personnalisés',
                'Projections et simulations',
                'Détection d\'anomalies',
                'Conseils basés sur votre profil',
                'Rappels intelligents',
              ].map((cap, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                  {cap}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
