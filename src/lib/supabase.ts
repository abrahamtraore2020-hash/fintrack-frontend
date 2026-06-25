import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
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
