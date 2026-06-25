'use client'
import { useState, useEffect } from 'react'
import { Wallet, Check, Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth, isSupabaseConfigured } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import toast from 'react-hot-toast'
import { MaskBaoule, MaskDogon, MaskDan, CoinFCFA, BilletAfrica } from '@/components/ui/AfricanIllustrations'

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
  remember: z.boolean().optional(),
})

const registerSchema = z.object({
  firstName: z.string().min(2, 'Minimum 2 caractères'),
  lastName: z.string().min(2, 'Minimum 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
  confirmPassword: z.string(),
  profile: z.enum(['personal', 'freelance', 'business', 'enterprise']),
  remember: z.boolean().optional(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

const FEATURES = [
  'Connectez Wave, Orange Money, banques et plus',
  "Coffres virtuels & objectifs d'épargne",
  'Rapports analytiques & conseils IA',
  'Alertes intelligentes personnalisées',
  "14 jours d'essai gratuit inclus",
]

const SAVED_EMAIL_KEY = 'fintrack_saved_email'

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [showLoginPwd, setShowLoginPwd] = useState(false)
  const [showRegisterPwd, setShowRegisterPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const { signIn, signUp, signInWithGoogle, signInWithApple } = useAuth()
  const supabaseReady = isSupabaseConfigured()

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: false },
  })

  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  useEffect(() => {
    const saved = localStorage.getItem(SAVED_EMAIL_KEY)
    if (saved) {
      loginForm.setValue('email', saved)
      loginForm.setValue('remember', true)
    }
  }, [])

  const handleLogin = async (data: LoginForm) => {
    try {
      if (data.remember) {
        localStorage.setItem(SAVED_EMAIL_KEY, data.email)
      } else {
        localStorage.removeItem(SAVED_EMAIL_KEY)
      }
      await signIn(data.email, data.password)
    } catch (e: any) {
      if (e.message === 'SUPABASE_NOT_CONFIGURED') {
        toast.error('Base de données non configurée.', { duration: 4000 })
      } else if (e.message === 'EMAIL_NOT_CONFIRMED') {
        toast.error('Confirmez votre email avant de vous connecter. Vérifiez votre boîte mail.', { duration: 6000 })
      } else {
        toast.error('Email ou mot de passe incorrect')
      }
    }
  }

  const handleRegister = async (data: RegisterForm) => {
    try {
      if (data.remember) {
        localStorage.setItem(SAVED_EMAIL_KEY, data.email)
      } else {
        localStorage.removeItem(SAVED_EMAIL_KEY)
      }
      await signUp(data.email, data.password, data.firstName, data.lastName, data.profile)
      toast.success('Compte créé ! Bienvenue sur FinTrack 🎉')
    } catch (e: any) {
      if (e.message === 'SUPABASE_NOT_CONFIGURED') {
        toast.error('Base de données non configurée.', { duration: 4000 })
      } else if (e.message === 'CHECK_EMAIL') {
        toast.success('Compte créé ! Vérifiez votre boîte mail pour confirmer votre email.', { duration: 8000 })
      } else {
        toast.error(e.message || "Erreur lors de l'inscription")
      }
    }
  }

  const handleOAuth = async (provider: 'google' | 'apple') => {
    try {
      if (provider === 'google') await signInWithGoogle()
      else await signInWithApple()
    } catch (e: any) {
      if (e.message === 'SUPABASE_NOT_CONFIGURED') {
        toast.error('Connexion via ' + (provider === 'google' ? 'Google' : 'Apple') + ' non disponible pour le moment.', { duration: 4000 })
      } else {
        toast.error(`Erreur avec ${provider === 'google' ? 'Google' : 'Apple'}`)
      }
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-5/12 bg-gradient-dark flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gold/5" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-blue-500/10" />
        {/* Illustrations africaines — blanc translucide */}
        <MaskBaoule  size={180} opacity={0.08} className="absolute -top-4 -right-6 rotate-6 pointer-events-none" />
        <MaskDogon   size={140} opacity={0.07} className="absolute bottom-24 -left-8 -rotate-3 pointer-events-none" />
        <MaskDan     size={110} opacity={0.07} className="absolute top-1/3 right-2 rotate-2 pointer-events-none" />
        <CoinFCFA    size={80}  opacity={0.08} className="absolute bottom-6 right-16 rotate-12 pointer-events-none" />
        <BilletAfrica width={130} opacity={0.07} className="absolute bottom-40 left-8 -rotate-8 pointer-events-none" />
        <CoinFCFA    size={50}  opacity={0.06} className="absolute top-20 left-12 -rotate-6 pointer-events-none" />
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 bg-gold rounded-xl flex items-center justify-center">
            <Wallet size={18} className="text-[#1A1A2E]" />
          </div>
          <span className="text-white font-bold text-lg">Fin<span className="text-gold">Track</span></span>
        </div>
        <div className="relative z-10">
          <h2 className="text-white text-3xl font-bold leading-tight mb-3 text-glow-blue">
            Contrôlez vos <span className="text-gold">finances</span> avec intelligence
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mb-8">
            La plateforme de gestion financière conçue pour l'Afrique francophone et le monde.
          </p>
          <div className="space-y-3">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-2.5 text-white/80 text-sm">
                <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <Check size={11} className="text-gold" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/30 text-xs relative z-10">© 2025 FinTrack. Tous droits réservés.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-[#0F1117] overflow-y-auto">
        <div className="w-full max-w-md py-6">

          {/* Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  tab === t
                    ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {t === 'login' ? 'Se connecter' : "S'inscrire"}
              </button>
            ))}
          </div>

          {tab === 'login' ? (
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Bon retour 👋</h1>
              <p className="text-sm text-gray-500 mb-5">
                Heureux de vous revoir sur{' '}
                <span className="text-blue-500 font-medium">FinTrack</span>
              </p>

              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="vous@exemple.com"
                  {...loginForm.register('email')}
                  error={loginForm.formState.errors.email?.message}
                />
                <div className="relative">
                  <Input
                    label="Mot de passe"
                    type={showLoginPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...loginForm.register('password')}
                    error={loginForm.formState.errors.password?.message}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPwd(v => !v)}
                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showLoginPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      {...loginForm.register('remember')}
                      className="w-4 h-4 rounded border-gray-300 accent-[#FFD700] cursor-pointer"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Se souvenir de moi</span>
                  </label>
                  <span className="text-xs text-blue-500 cursor-pointer hover:underline">
                    Mot de passe oublié ?
                  </span>
                </div>

                <Button type="submit" className="w-full" size="lg" loading={loginForm.formState.isSubmitting}>
                  Se connecter
                </Button>
              </form>

              <div className="flex items-center gap-3 my-4 text-xs text-gray-400">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                ou continuer avec
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <OAuthButton provider="google" onClick={() => handleOAuth('google')} />
                <OAuthButton provider="apple" onClick={() => handleOAuth('apple')} />
              </div>
            </div>
          ) : (
            <div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/40 rounded-xl px-4 py-3 text-center text-xs text-yellow-800 dark:text-yellow-300 mb-4">
                🎁 <strong>14 jours gratuits</strong> — Aucune carte bancaire requise
              </div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Créer un compte</h1>
              <p className="text-sm text-gray-500 mb-4">
                Rejoignez <span className="text-blue-500 font-medium">FinTrack</span> et prenez le contrôle
              </p>

              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Prénom"
                    placeholder="Kofi"
                    {...registerForm.register('firstName')}
                    error={registerForm.formState.errors.firstName?.message}
                  />
                  <Input
                    label="Nom"
                    placeholder="Asante"
                    {...registerForm.register('lastName')}
                    error={registerForm.formState.errors.lastName?.message}
                  />
                </div>
                <Input
                  label="Email"
                  type="email"
                  placeholder="vous@exemple.com"
                  {...registerForm.register('email')}
                  error={registerForm.formState.errors.email?.message}
                />
                <div className="relative">
                  <Input
                    label="Mot de passe"
                    type={showRegisterPwd ? 'text' : 'password'}
                    placeholder="8 caractères minimum"
                    {...registerForm.register('password')}
                    error={registerForm.formState.errors.password?.message}
                  />
                  <button type="button" onClick={() => setShowRegisterPwd(v => !v)}
                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showRegisterPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    label="Confirmer le mot de passe"
                    type={showConfirmPwd ? 'text' : 'password'}
                    placeholder="Répétez votre mot de passe"
                    {...registerForm.register('confirmPassword')}
                    error={registerForm.formState.errors.confirmPassword?.message}
                  />
                  <button type="button" onClick={() => setShowConfirmPwd(v => !v)}
                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <Select
                  label="Profil"
                  {...registerForm.register('profile')}
                  options={[
                    { value: 'personal', label: 'Particulier' },
                    { value: 'freelance', label: 'Freelance / Entrepreneur' },
                    { value: 'business', label: 'PME' },
                    { value: 'enterprise', label: 'Grande entreprise' },
                  ]}
                />
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    {...registerForm.register('remember')}
                    className="w-4 h-4 rounded border-gray-300 accent-[#FFD700] cursor-pointer"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Se souvenir de moi</span>
                </label>

                <Button type="submit" className="w-full" size="lg" loading={registerForm.formState.isSubmitting}>
                  Créer mon compte gratuit
                </Button>
              </form>

              <div className="flex items-center gap-3 my-4 text-xs text-gray-400">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                ou s'inscrire avec
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <OAuthButton provider="google" onClick={() => handleOAuth('google')} />
                <OAuthButton provider="apple" onClick={() => handleOAuth('apple')} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function OAuthButton({ provider, onClick }: { provider: 'google' | 'apple'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:border-[#FFD700] hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-all flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300"
    >
      {provider === 'google' ? (
        <>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </>
      ) : (
        <>
          <svg width="16" height="18" viewBox="0 0 814 1000" fill="currentColor">
            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-127.4C46.7 790.7 0 663 0 541.8c0-207.5 135.4-317.3 270-317.3 70.1 0 128.4 46.4 172.5 46.4 42.1 0 108.6-49 193.5-49 31.3 0 113.6 2.6 168.4 98.3zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
          </svg>
          Apple
        </>
      )}
    </button>
  )
}
