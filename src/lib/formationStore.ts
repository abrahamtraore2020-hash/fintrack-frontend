import { createClient } from '@supabase/supabase-js'
import { EPISODES, FORMATION, type Episode } from '@/data/formation'
import { hashPassword, randomSalt } from '@/lib/formationAuth'
import { slugify } from '@/lib/slug'
import { DEFAULT_THEME, normalizeTheme, type Theme } from '@/data/theme'

export interface Formation {
  slug: string
  titre: string
  sousTitre: string
  episodes: Episode[]
  theme: Theme
}

// Adresses déjà prises par des pages fixes de /formation
const RESERVED = ['acces', 'profil']

const DEFAULT_FORMATION: Formation = {
  slug: 'lance-ton-produit-digital',
  titre: FORMATION.titre,
  sousTitre: FORMATION.sousTitre,
  episodes: EPISODES,
  theme: DEFAULT_THEME,
}

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

type Row = { slug: string; titre: string; sous_titre: string; episodes: Omit<Episode, 'numero'>[]; theme?: unknown }
const toFormation = (r: Row): Formation => ({
  slug: r.slug,
  titre: r.titre,
  sousTitre: r.sous_titre,
  episodes: (r.episodes ?? []).map((e, i) => ({ ...e, numero: i + 1 })),
  theme: normalizeTheme(r.theme),
})

// En cas d'erreur (base indisponible, table pas encore créée), on affiche la formation de départ.
export async function getFormations(): Promise<Formation[]> {
  const db = admin()
  if (!db) return [DEFAULT_FORMATION]
  const { data, error } = await db.from('formation_formations').select('*').order('position').order('created_at')
  if (error || !data) return [DEFAULT_FORMATION]
  return (data as Row[]).map(toFormation)
}

export async function getFormation(slug: string): Promise<Formation | null> {
  return (await getFormations()).find(f => f.slug === slug) ?? null
}

export async function getEpisode(formationSlug: string, episodeSlug: string) {
  const formation = await getFormation(formationSlug)
  if (!formation) return null
  const index = formation.episodes.findIndex(e => e.slug === episodeSlug)
  if (index === -1) return null
  return { formation, episode: formation.episodes[index], suivant: formation.episodes[index + 1] ?? null }
}

export async function createFormation(titre: string, sousTitre: string): Promise<{ slug: string } | { error: string }> {
  const db = admin()
  if (!db) return { error: 'Supabase n’est pas configuré' }
  const { data, error } = await db.from('formation_formations').select('slug, position')
  if (error) return { error: error.message }
  const taken = new Set([...RESERVED, ...data.map(r => r.slug)])
  const base = slugify(titre)
  let slug = base
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`
  const position = data.reduce((m, r) => Math.max(m, r.position + 1), 0)
  const { error: insError } = await db.from('formation_formations').insert({ slug, position, titre, sous_titre: sousTitre, episodes: [] })
  return insError ? { error: insError.message } : { slug }
}

export async function saveFormation(slug: string, f: Omit<Formation, 'slug'>): Promise<string | null> {
  const db = admin()
  if (!db) return 'Supabase n’est pas configuré'
  const episodes = f.episodes.map(({ slug, titre, resume, lecons }) => ({ slug, titre, resume, lecons }))
  const { data, error } = await db
    .from('formation_formations')
    .update({ titre: f.titre, sous_titre: f.sousTitre, episodes, theme: normalizeTheme(f.theme), updated_at: new Date().toISOString() })
    .eq('slug', slug)
    .select('slug')
  if (error && /theme/.test(error.message))
    return 'Il manque la colonne « theme » : exécutez le SQL 008_formation_theme.sql dans Supabase'
  if (error) return error.message
  return data.length === 0 ? 'Formation introuvable' : null
}

export async function deleteFormation(slug: string): Promise<string | null> {
  const db = admin()
  if (!db) return 'Supabase n’est pas configuré'
  const { error } = await db.from('formation_formations').delete().eq('slug', slug)
  return error ? error.message : null
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

export async function changePassword(actuel: string, nouveau: string): Promise<string | null> {
  const rec = await getPasswordRecord()
  if (!rec || 'error' in rec) return rec && 'error' in rec ? rec.error : 'Aucun mot de passe défini'
  if ((await hashPassword(actuel, rec.salt)) !== rec.hash) return 'Mot de passe actuel incorrect'
  const salt = randomSalt()
  const { error } = await admin()!
    .from('formation_settings')
    .update({ password_hash: await hashPassword(nouveau, salt), salt, updated_at: new Date().toISOString() })
    .eq('id', 1)
  return error ? error.message : null
}

export async function getDisplayName(): Promise<string> {
  const db = admin()
  if (!db) return ''
  const { data } = await db.from('formation_settings').select('display_name').eq('id', 1).maybeSingle()
  return data?.display_name ?? ''
}

export async function setDisplayName(nom: string): Promise<string | null> {
  const db = admin()
  if (!db) return 'Supabase n’est pas configuré'
  const { error } = await db.from('formation_settings').update({ display_name: nom }).eq('id', 1)
  return error ? error.message : null
}
