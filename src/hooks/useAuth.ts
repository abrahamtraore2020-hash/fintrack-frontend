'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return url.length > 0 && !url.includes('xxxxx') && url.startsWith('https://')
}

export function useAuth() {
  const { user, setUser, logout, setCoffres, setObjectifs, setAccounts, setTransactions } = useAppStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isSupabaseConfigured()) return

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (profile) {
          setUser(profile)
        } else {
          // Profil absent — on crée un utilisateur minimal pour que les hooks fonctionnent
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            firstName: '',
            lastName: '',
            profile: 'personal',
            plan: 'starter',
            currency: 'XOF',
            lang: 'fr',
            createdAt: session.user.created_at,
          })
        }
        if (event === 'SIGNED_IN') router.push('/dashboard')
      } else {
        logout()
        if (!pathname?.startsWith('/auth')) router.push('/auth')
      }
    })
    return () => subscription.unsubscribe()
  }, [pathname])

  const resetUserData = () => {
    setCoffres([])
    setObjectifs([])
    setAccounts([])
    setTransactions([])
  }

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) throw new Error('SUPABASE_NOT_CONFIGURED')
    resetUserData()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        throw new Error('EMAIL_NOT_CONFIRMED')
      }
      throw error
    }
    if (data.user) {
      const { data: profile } = await supabase.from('users').select('*').eq('id', data.user.id).single()
      if (profile) setUser(profile)
      else setUser({ id: data.user.id, email, firstName: '', lastName: '', profile: 'personal' as any, plan: 'starter', currency: 'XOF', lang: 'fr', createdAt: new Date().toISOString() })
    }
    router.push('/dashboard')
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string, profile: string) => {
    if (!isSupabaseConfigured()) throw new Error('SUPABASE_NOT_CONFIGURED')
    resetUserData()
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id, email, firstName, lastName,
        profile, plan: 'starter', currency: 'XOF', lang: 'fr',
        createdAt: new Date().toISOString(),
        trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString(),
      })
      // Si session active (email confirmation désactivée) → rediriger direct
      if (data.session) {
        setUser({ id: data.user.id, email, firstName, lastName, profile: profile as any, plan: 'starter', currency: 'XOF', lang: 'fr', createdAt: new Date().toISOString(), trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString() })
        router.push('/onboarding')
      } else {
        // Email confirmation activée → informer l'utilisateur
        throw new Error('CHECK_EMAIL')
      }
    }
  }

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured()) throw new Error('SUPABASE_NOT_CONFIGURED')
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
  }

  const signInWithApple = async () => {
    if (!isSupabaseConfigured()) throw new Error('SUPABASE_NOT_CONFIGURED')
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
  }

  const signOut = async () => {
    if (isSupabaseConfigured()) await supabase.auth.signOut()
    logout()
    router.push('/auth')
  }

  return { user, signIn, signUp, signInWithGoogle, signInWithApple, signOut, isAuthenticated: !!user }
}
