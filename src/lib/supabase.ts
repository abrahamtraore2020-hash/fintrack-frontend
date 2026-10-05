import { createClient } from '@supabase/supabase-js'

let supabaseInstance: any = null

export function getSupabase() {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  }
  return supabaseInstance
}

export const supabase = new Proxy({} as any, {
  get: (target, prop) => {
    return getSupabase()[prop]
  },
})

// Retourne l'user ID validé en temps réel depuis Supabase
// Rafraîchit le token si expiré, lance une erreur si vraiment déconnecté
export async function ensureSession(): Promise<string> {
  // getUser() fait une requête réseau pour valider le token — c'est la source de vérité
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    // Token invalide → tenter un refresh
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
    if (refreshError || !refreshData.user) {
      throw new Error('Session expirée. Veuillez vous reconnecter.')
    }
    return refreshData.user.id
  }

  return user.id
}
