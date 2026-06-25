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

// Appeler cette fonction avant toute mutation Supabase
// Elle rafraîchit le token si expiré, sinon ne fait rien
export async function ensureSession(): Promise<boolean> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error || !session) return false

    const expiresAt = (session.expires_at ?? 0) * 1000
    // Rafraîchir si le token expire dans moins de 60 secondes
    if (expiresAt - Date.now() < 60_000) {
      const { error: refreshError } = await supabase.auth.refreshSession()
      if (refreshError) return false
    }
    return true
  } catch {
    return false
  }
}
