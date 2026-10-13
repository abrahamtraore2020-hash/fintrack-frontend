import { createClient } from '@supabase/supabase-js'
import { EPISODES, type Episode } from '@/data/formation'

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

// Épisodes depuis Supabase ; si la base est vide ou indisponible, on retombe sur le contenu par défaut.
export async function getEpisodes(): Promise<Episode[]> {
  const db = admin()
  if (!db) return EPISODES
  const { data, error } = await db.from('formation_episodes').select('*').order('position')
  if (error || !data || data.length === 0) return EPISODES
  return data.map((r, i) => ({
    slug: r.slug,
    numero: i + 1,
    titre: r.titre,
    resume: r.resume,
    lecons: r.lecons,
  }))
}

export async function getEpisodeBySlug(slug: string) {
  const all = await getEpisodes()
  const index = all.findIndex(e => e.slug === slug)
  return index === -1 ? null : { episode: all[index], suivant: all[index + 1] ?? null }
}

export async function saveEpisodes(episodes: Episode[]): Promise<string | null> {
  const db = admin()
  if (!db) return 'Supabase n’est pas configuré'
  const rows = episodes.map((e, i) => ({
    slug: e.slug,
    position: i,
    titre: e.titre,
    resume: e.resume,
    lecons: e.lecons,
    updated_at: new Date().toISOString(),
  }))
  const { error } = await db.from('formation_episodes').upsert(rows)
  if (error) return error.message
  const slugs = rows.map(r => r.slug)
  const { error: delError } = await db
    .from('formation_episodes')
    .delete()
    .not('slug', 'in', `(${slugs.map(s => `"${s}"`).join(',')})`)
  return delError ? delError.message : null
}

export async function getPasswordRecord(): Promise<{ hash: string; salt: string } | null | { error: string }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) return { error: 'Variable NEXT_PUBLIC_SUPABASE_URL absente dans Vercel' }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return { error: 'Variable SUPABASE_SERVICE_ROLE_KEY absente dans Vercel (environnement Production)' }
  const db = admin()!
  const { data, error } = await db.from('formation_settings').select('password_hash, salt').eq('id', 1).maybeSingle()
  if (error) return { error: `Supabase répond : ${error.message}` }
  return data ? { hash: data.password_hash, salt: data.salt } : null
}

// Échoue si un mot de passe existe déjà (clé primaire id = 1) : impossible d'écraser.
export async function createPasswordRecord(hash: string, salt: string): Promise<string | null> {
  const db = admin()
  if (!db) return 'Supabase n’est pas configuré'
  const { error } = await db.from('formation_settings').insert({ id: 1, password_hash: hash, salt })
  return error ? error.message : null
}
