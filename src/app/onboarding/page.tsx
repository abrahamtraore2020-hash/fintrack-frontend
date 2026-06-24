'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronRight, ChevronLeft, Wallet, Target, Plug, Bell, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import toast from 'react-hot-toast'

const STEPS = [
  { id: 1, title: 'Bienvenue !', icon: Sparkles, desc: 'Configurons FinTrack pour vous' },
  { id: 2, title: 'Votre profil', icon: Wallet, desc: 'Parlez-nous de vous' },
  { id: 3, title: 'Vos objectifs', icon: Target, desc: 'Que voulez-vous accomplir ?' },
  { id: 4, title: 'Intégrations', icon: Plug, desc: 'Connectez vos comptes' },
  { id: 5, title: 'Alertes', icon: Bell, desc: 'Restez informé' },
]

const PROFILES = [
  { id: 'personal', emoji: '👤', label: 'Particulier', desc: 'Gérer mes finances personnelles' },
  { id: 'freelance', emoji: '💼', label: 'Freelance', desc: 'Revenus variables, projets clients' },
  { id: 'business', emoji: '🏢', label: 'PME / Entrepreneur', desc: 'Gérer les finances de mon entreprise' },
  { id: 'student', emoji: '🎓', label: 'Étudiant', desc: 'Budget limité, économiser pour l\'avenir' },
]

const GOALS = [
  { id: 'save', emoji: '💰', label: 'Épargner régulièrement' },
  { id: 'budget', emoji: '📊', label: 'Contrôler mes dépenses' },
  { id: 'debt', emoji: '📉', label: 'Rembourser des dettes' },
  { id: 'invest', emoji: '📈', label: 'Investir et faire fructifier' },
  { id: 'project', emoji: '🎯', label: 'Financer un projet' },
  { id: 'emergency', emoji: '🛡️', label: 'Constituer un fonds d\'urgence' },
]

const INTEGRATIONS = [
  { id: 'wave', emoji: '🌊', label: 'Wave', color: '#1B74E8' },
  { id: 'orange', emoji: '🟠', label: 'Orange Money', color: '#FF6600' },
  { id: 'mtn', emoji: '🟡', label: 'MTN MoMo', color: '#FFCC00' },
  { id: 'moov', emoji: '🔵', label: 'Moov Money', color: '#0066CC' },
  { id: 'stripe', emoji: '💳', label: 'Stripe', color: '#635BFF' },
  { id: 'paypal', emoji: '🅿️', label: 'PayPal', color: '#003087' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user, setCurrency } = useAppStore()
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState('')
  const [goals, setGoals] = useState<string[]>([])
  const [integrations, setIntegrations] = useState<string[]>([])
  const [currency, setCurrencyLocal] = useState('XOF')
  const [income, setIncome] = useState('')
  const [alertEmail, setAlertEmail] = useState(true)
  const [alertPush, setAlertPush] = useState(true)

  const toggleGoal = (id: string) =>
    setGoals(g => g.includes(id) ? g.filter(x => x !== id) : [...g, id])
  const toggleIntegration = (id: string) =>
    setIntegrations(i => i.includes(id) ? i.filter(x => x !== id) : [...i, id])

  const next = () => {
    if (step < 5) setStep(s => s + 1)
    else finish()
  }
  const back = () => setStep(s => Math.max(1, s - 1))

  const finish = () => {
    setCurrency(currency as any)
    localStorage.setItem('onboarding_done', 'true')
    toast.success('Bienvenue sur FinTrack ! 🎉')
    router.push('/dashboard')
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center">
              <span className="text-[#1A1A2E] font-bold text-lg">F</span>
            </div>
            <span className="text-white font-bold text-xl">FinTrack</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
            <div className="bg-gold h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-white/50 text-xs">Étape {step} sur {STEPS.length}</p>
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map(s => (
            <div key={s.id} className={cn('transition-all duration-300',
              s.id === step ? 'w-6 h-2 rounded-full bg-gold' :
              s.id < step ? 'w-2 h-2 rounded-full bg-gold/60' : 'w-2 h-2 rounded-full bg-white/20'
            )} />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-2xl">
          {/* Step 1 — Welcome */}
          {step === 1 && (
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold to-orange-400 flex items-center justify-center mx-auto mb-4">
                <Sparkles size={36} className="text-[#1A1A2E]" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                Bonjour {user?.firstName || ''} ! 👋
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Bienvenue sur FinTrack. En 2 minutes, nous allons personnaliser votre expérience pour que vous puissiez prendre le contrôle de vos finances.
              </p>
              <div className="space-y-2 text-left mb-6">
                {['Connecter vos comptes Wave, OM, MTN', 'Créer vos coffres d\'épargne', 'Définir vos objectifs financiers', 'Recevoir des conseils personnalisés'].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-dark-bg rounded-xl">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check size={11} className="text-green-600" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Profile */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Votre profil</h2>
              <p className="text-xs text-gray-500 mb-4">Nous adaptons FinTrack à votre situation</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {PROFILES.map(p => (
                  <button key={p.id} onClick={() => setProfile(p.id)}
                    className={cn('p-3 rounded-xl border text-left transition-all',
                      profile === p.id ? 'border-gold bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-100 dark:border-dark-border hover:border-gray-200')}>
                    <div className="text-xl mb-1">{p.emoji}</div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{p.label}</p>
                    <p className="text-[10px] text-gray-400">{p.desc}</p>
                  </button>
                ))}
              </div>
              <Select label="Devise principale" value={currency} onChange={e => setCurrencyLocal(e.target.value)} options={[
                { value: 'XOF', label: 'FCFA — Franc CFA' },
                { value: 'USD', label: 'USD — Dollar' },
                { value: 'EUR', label: 'EUR — Euro' },
              ]} />
              <div className="mt-3">
                <Input label="Revenu mensuel estimé (optionnel)" type="number" placeholder="Ex: 350000" value={income} onChange={e => setIncome(e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 3 — Goals */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Vos objectifs</h2>
              <p className="text-xs text-gray-500 mb-4">Sélectionnez tout ce qui vous correspond</p>
              <div className="grid grid-cols-2 gap-2">
                {GOALS.map(g => (
                  <button key={g.id} onClick={() => toggleGoal(g.id)}
                    className={cn('p-3 rounded-xl border text-left flex items-center gap-2 transition-all',
                      goals.includes(g.id) ? 'border-gold bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-100 dark:border-dark-border hover:border-gray-200')}>
                    <span className="text-lg">{g.emoji}</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight">{g.label}</span>
                    {goals.includes(g.id) && <Check size={12} className="text-gold ml-auto flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 — Integrations */}
          {step === 4 && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Connectez vos comptes</h2>
              <p className="text-xs text-gray-500 mb-4">Vous pourrez en ajouter plus tard dans Intégrations</p>
              <div className="grid grid-cols-3 gap-2">
                {INTEGRATIONS.map(intg => (
                  <button key={intg.id} onClick={() => toggleIntegration(intg.id)}
                    className={cn('p-3 rounded-xl border text-center transition-all',
                      integrations.includes(intg.id) ? 'border-gold bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-100 dark:border-dark-border hover:border-gray-200')}>
                    <div className="text-2xl mb-1">{intg.emoji}</div>
                    <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400">{intg.label}</p>
                    {integrations.includes(intg.id) && (
                      <div className="mt-1 w-4 h-4 rounded-full bg-gold flex items-center justify-center mx-auto">
                        <Check size={9} className="text-[#1A1A2E]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-3">
                Note : La connexion réelle se fait dans la page Intégrations avec vos identifiants.
              </p>
            </div>
          )}

          {/* Step 5 — Alerts */}
          {step === 5 && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Alertes & notifications</h2>
              <p className="text-xs text-gray-500 mb-5">Ne manquez aucun événement important</p>
              <div className="space-y-3">
                {[
                  { id: 'email', emoji: '📧', label: 'Notifications par email', desc: 'Résumés hebdo, alertes de budget', val: alertEmail, set: setAlertEmail },
                  { id: 'push', emoji: '📱', label: 'Notifications push', desc: 'Alertes en temps réel', val: alertPush, set: setAlertPush },
                ].map(item => (
                  <button key={item.id} onClick={() => item.set(!item.val)}
                    className={cn('w-full p-4 rounded-xl border text-left flex items-center gap-3 transition-all',
                      item.val ? 'border-gold bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-100 dark:border-dark-border')}>
                    <span className="text-2xl">{item.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                    <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                      item.val ? 'bg-gold border-gold' : 'border-gray-300')}>
                      {item.val && <Check size={11} className="text-[#1A1A2E]" />}
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-5 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-100 dark:border-yellow-800/40 text-center">
                <p className="text-sm font-bold text-gray-800 dark:text-white mb-1">🎉 Vous êtes prêt !</p>
                <p className="text-xs text-gray-500">Votre espace FinTrack est configuré. Commençons !</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center gap-3 mt-6">
            {step > 1 && (
              <Button variant="outline" onClick={back} className="flex-shrink-0">
                <ChevronLeft size={16} />
              </Button>
            )}
            <Button onClick={next} className="flex-1">
              {step === 5 ? 'Commencer FinTrack 🚀' : (
                <><span>Continuer</span><ChevronRight size={16} /></>
              )}
            </Button>
          </div>
          {step < 5 && (
            <button onClick={finish} className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Passer la configuration
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
