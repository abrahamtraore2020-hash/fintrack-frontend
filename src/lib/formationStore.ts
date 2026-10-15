import { createClient } from '@supabase/supabase-js'
import { EPISODES, FORMATION, type Episode } from '@/data/formation'
import { hashPassword, randomSalt } from '@/lib/formationAuth'
import { slugify } from '@/lib/slug'
import { DEFAULT_THEME, normalizeTheme, type Theme } from '@/data/theme'
import { normalizeDirects, type Direct, type Inscription } from '@/data/direct'
import { normalizeQuestions, type Exercice, type Resultat } from '@/data/exercice'
import { normaliserFiche, type Fiche } from '@/data/persona'

export interface Formation {
  slug: string
  titre: string
  sousTitre: string
  episodes: Episode[]
  theme: Theme
  directs: Direct[]
}

// Adresses déjà prises par des pages fixes de /formation
const RESERVED = ['acces', 'profil']

const DEFAULT_FORMATION: Formation = {
  slug: 'lance-ton-produit-digital',
  titre: FORMATION.titre,
  sousTitre: FORMATION.sousTitre,
  episodes: EPISODES,
  theme: DEFAULT_THEME,
  directs: [],
}

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  // Jamais de cache : chaque page doit montrer ce qui vient d'être enregistré.
  return createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) },
  })
}

type Row = { slug: string; titre: string; sous_titre: string; episodes: Omit<Episode, 'numero'>[]; theme?: unknown; directs?: unknown }
const toFormation = (r: Row): Formation => ({
  slug: r.slug,
  titre: r.titre,
  sousTitre: r.sous_titre,
  episodes: (r.episodes ?? []).map((e, i) => ({ ...e, numero: i + 1 })),
  theme: normalizeTheme(r.theme),
  directs: normalizeDirects(r.directs),
})

// Si la base ne répond pas, on affiche la formation de départ AVEC la cause de l'erreur :
// les pages l'annoncent et l'éditeur refuse d'enregistrer (pour ne pas écraser le vrai contenu).
export async function lireFormations(): Promise<{ formations: Formation[]; erreur: string | null }> {
  const db = admin()
  if (!db) return { formations: [DEFAULT_FORMATION], erreur: 'Variables Supabase absentes dans Vercel' }
  const { data, error } = await db.from('formation_formations').select('*').order('position').order('created_at')
  if (error || !data) return { formations: [DEFAULT_FORMATION], erreur: `Lecture impossible : ${error?.message ?? 'réponse vide'}` }
  return { formations: (data as Row[]).map(toFormation), erreur: null }
}

export async function getFormation(slug: string): Promise<{ formation: Formation | null; erreur: string | null }> {
  const { formations, erreur } = await lireFormations()
  return { formation: formations.find(f => f.slug === slug) ?? null, erreur }
}

export async function getEpisode(formationSlug: string, episodeSlug: string) {
  const { formation, erreur } = await getFormation(formationSlug)
  if (!formation) return null
  const index = formation.episodes.findIndex(e => e.slug === episodeSlug)
  if (index === -1) return null
  return { formation, episode: formation.episodes[index], suivant: formation.episodes[index + 1] ?? null, erreur }
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

export async function saveFormation(slug: string, f: Omit<Formation, 'slug' | 'directs'>): Promise<string | null> {
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

export async function saveDirects(slug: string, directs: Direct[]): Promise<string | null> {
  const db = admin()
  if (!db) return 'Supabase n’est pas configuré'
  const { data, error } = await db.from('formation_formations').update({ directs: normalizeDirects(directs) }).eq('slug', slug).select('slug')
  if (error && /directs/.test(error.message))
    return 'Il manque la colonne « directs » : exécutez le SQL 009_formation_directs.sql dans Supabase'
  if (error) return error.message
  return data.length === 0 ? 'Formation introuvable' : null
}

export async function deleteFormation(slug: string): Promise<string | null> {
  const db = admin()
  if (!db) return 'Supabase n’est pas configuré'
  const { error } = await db.from('formation_formations').delete().eq('slug', slug)
  await db.from('formation_ateliers').delete().eq('formation_slug', slug) // ateliers persona et leurs fiches (cascade)
  await db.from('formation_exercices').delete().eq('formation_slug', slug) // et leurs résultats (cascade) ; ignoré si la table n'existe pas encore
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

// ---- Directs : page publique et inscriptions ----

export async function trouverDirect(id: string): Promise<{ direct: Direct; formation: string } | null | { erreur: string }> {
  const { formations, erreur } = await lireFormations()
  if (erreur) return { erreur }
  for (const f of formations) {
    const direct = f.directs.find(d => d.id === id)
    if (direct) return { direct, formation: f.titre }
  }
  return null
}

const MAX_INSCRITS = 1000

export async function inscrire(directId: string, nom: string, contact: string, canal: 'whatsapp' | 'email'): Promise<{ ok: true } | { ok: false; erreur: string; doublon?: boolean }> {
  const db = admin()
  if (!db) return { ok: false, erreur: 'Service indisponible' }
  const { count, error: errCount } = await db.from('formation_inscriptions').select('id', { count: 'exact', head: true }).eq('direct_id', directId)
  if (errCount) return { ok: false, erreur: /formation_inscriptions/.test(errCount.message) ? 'Les inscriptions ne sont pas encore activées' : 'Service indisponible' }
  if ((count ?? 0) >= MAX_INSCRITS) return { ok: false, erreur: 'Les inscriptions sont complètes' }
  const { error } = await db.from('formation_inscriptions').insert({ direct_id: directId, nom, contact, canal })
  if (error?.code === '23505') return { ok: false, erreur: 'Vous êtes déjà inscrit(e)', doublon: true }
  return error ? { ok: false, erreur: 'Inscription impossible, réessayez' } : { ok: true }
}

export async function listerInscriptions(directId: string): Promise<{ inscriptions: Inscription[]; erreur: string | null }> {
  const db = admin()
  if (!db) return { inscriptions: [], erreur: 'Supabase n’est pas configuré' }
  const { data, error } = await db.from('formation_inscriptions').select('id, nom, contact, canal, created_at').eq('direct_id', directId).order('created_at')
  if (error) return { inscriptions: [], erreur: /formation_inscriptions/.test(error.message) ? 'Exécutez le SQL 010_formation_inscriptions.sql dans Supabase' : error.message }
  return { inscriptions: (data ?? []) as Inscription[], erreur: null }
}

export async function compterInscriptions(): Promise<Record<string, number>> {
  const db = admin()
  if (!db) return {}
  const { data } = await db.from('formation_inscriptions').select('direct_id')
  const n: Record<string, number> = {}
  for (const r of data ?? []) n[r.direct_id] = (n[r.direct_id] ?? 0) + 1
  return n
}

// ---- Exercices ----

type LigneExercice = { id: string; formation_slug: string; titre: string; modules: unknown; questions: unknown; ouvert: boolean; created_at: string }
const versExercice = (r: LigneExercice): Exercice => ({
  id: r.id,
  formation: r.formation_slug,
  titre: r.titre,
  modules: Array.isArray(r.modules) ? r.modules.filter((m): m is string => typeof m === 'string') : [],
  questions: normalizeQuestions(r.questions),
  ouvert: r.ouvert,
  created_at: r.created_at,
})
const messageTable = (m: string) => (/formation_(exercices|resultats)/.test(m) ? 'Exécutez le SQL 011_formation_exercices.sql dans Supabase' : m)

export async function listerExercices(formation: string): Promise<{ exercices: (Exercice & { passages: number })[]; erreur: string | null }> {
  const db = admin()
  if (!db) return { exercices: [], erreur: 'Supabase n’est pas configuré' }
  const { data, error } = await db.from('formation_exercices').select('*').eq('formation_slug', formation).order('created_at', { ascending: false })
  if (error) return { exercices: [], erreur: messageTable(error.message) }
  const ids = (data ?? []).map(r => r.id)
  const passages: Record<string, number> = {}
  if (ids.length) {
    const { data: res } = await db.from('formation_resultats').select('exercice_id').in('exercice_id', ids)
    for (const r of res ?? []) passages[r.exercice_id] = (passages[r.exercice_id] ?? 0) + 1
  }
  return { exercices: (data as LigneExercice[]).map(r => ({ ...versExercice(r), passages: passages[r.id] ?? 0 })), erreur: null }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function lireExercice(id: string): Promise<{ exercice: Exercice | null; erreur: string | null }> {
  const db = admin()
  if (!db) return { exercice: null, erreur: 'Supabase n’est pas configuré' }
  if (!UUID.test(id)) return { exercice: null, erreur: null }
  const { data, error } = await db.from('formation_exercices').select('*').eq('id', id).maybeSingle()
  if (error) return { exercice: null, erreur: messageTable(error.message) }
  return { exercice: data ? versExercice(data as LigneExercice) : null, erreur: null }
}

export async function creerExercice(formation: string, titre: string): Promise<{ id: string } | { erreur: string }> {
  const db = admin()
  if (!db) return { erreur: 'Supabase n’est pas configuré' }
  const { data, error } = await db.from('formation_exercices').insert({ formation_slug: formation, titre }).select('id').single()
  return error || !data ? { erreur: messageTable(error?.message ?? 'Création impossible') } : { id: data.id }
}

export async function sauverExercice(id: string, e: { titre: string; modules: string[]; questions: unknown; ouvert: boolean }): Promise<string | null> {
  const db = admin()
  if (!db) return 'Supabase n’est pas configuré'
  if (!UUID.test(id)) return 'Exercice introuvable'
  const { data, error } = await db
    .from('formation_exercices')
    .update({ titre: e.titre, modules: e.modules, questions: normalizeQuestions(e.questions), ouvert: e.ouvert, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id')
  if (error) return messageTable(error.message)
  return data.length === 0 ? 'Exercice introuvable' : null
}

export async function supprimerExercice(id: string): Promise<string | null> {
  const db = admin()
  if (!db) return 'Supabase n’est pas configuré'
  if (!UUID.test(id)) return 'Exercice introuvable'
  const { error } = await db.from('formation_exercices').delete().eq('id', id)
  return error ? messageTable(error.message) : null
}

export async function listerResultats(exerciceId: string): Promise<{ resultats: Resultat[]; erreur: string | null }> {
  const db = admin()
  if (!db) return { resultats: [], erreur: 'Supabase n’est pas configuré' }
  if (!UUID.test(exerciceId)) return { resultats: [], erreur: null }
  const { data, error } = await db.from('formation_resultats').select('id, nom, email, score, total, note, created_at').eq('exercice_id', exerciceId).order('created_at', { ascending: false })
  if (error) return { resultats: [], erreur: messageTable(error.message) }
  return { resultats: (data ?? []).map(r => ({ ...r, note: Number(r.note) })) as Resultat[], erreur: null }
}

export async function enregistrerResultat(exerciceId: string, nom: string, email: string, score: number, total: number, note: number, reponses: unknown): Promise<string | null> {
  const db = admin()
  if (!db) return 'Service indisponible'
  const { error } = await db.from('formation_resultats').insert({ exercice_id: exerciceId, nom, email, score, total, note, reponses })
  return error ? messageTable(error.message) : null
}

// ---- Ateliers « Comprendre son persona » ----

export interface Atelier {
  id: string
  formation: string
  titre: string
  ouvert: boolean
  created_at: string
}
export interface FicheEleve {
  id: string
  nom: string
  email: string
  data: Fiche
  generations: number
  created_at: string
  updated_at: string
}
type LigneAtelier = { id: string; formation_slug: string; titre: string; ouvert: boolean; created_at: string }
const versAtelier = (r: LigneAtelier): Atelier => ({ id: r.id, formation: r.formation_slug, titre: r.titre, ouvert: r.ouvert, created_at: r.created_at })
const messageAtelier = (m: string) => (/formation_(ateliers|personas)/.test(m) ? 'Exécutez le SQL 012_formation_persona.sql dans Supabase' : m)

export const MAX_FICHES = 500
export const MAX_GENERATIONS = 12 // appels IA par fiche : protège votre clé

export async function listerAteliers(formation: string): Promise<{ ateliers: (Atelier & { fiches: number })[]; erreur: string | null }> {
  const db = admin()
  if (!db) return { ateliers: [], erreur: 'Supabase n’est pas configuré' }
  const { data, error } = await db.from('formation_ateliers').select('*').eq('formation_slug', formation).order('created_at', { ascending: false })
  if (error) return { ateliers: [], erreur: messageAtelier(error.message) }
  const ids = (data ?? []).map(r => r.id)
  const n: Record<string, number> = {}
  if (ids.length) {
    const { data: f } = await db.from('formation_personas').select('atelier_id').in('atelier_id', ids)
    for (const r of f ?? []) n[r.atelier_id] = (n[r.atelier_id] ?? 0) + 1
  }
  return { ateliers: (data as LigneAtelier[]).map(r => ({ ...versAtelier(r), fiches: n[r.id] ?? 0 })), erreur: null }
}

export async function lireAtelier(id: string): Promise<{ atelier: Atelier | null; erreur: string | null }> {
  const db = admin()
  if (!db) return { atelier: null, erreur: 'Supabase n’est pas configuré' }
  if (!UUID.test(id)) return { atelier: null, erreur: null }
  const { data, error } = await db.from('formation_ateliers').select('*').eq('id', id).maybeSingle()
  if (error) return { atelier: null, erreur: messageAtelier(error.message) }
  return { atelier: data ? versAtelier(data as LigneAtelier) : null, erreur: null }
}

export async function creerAtelier(formation: string, titre: string): Promise<{ id: string } | { erreur: string }> {
  const db = admin()
  if (!db) return { erreur: 'Supabase n’est pas configuré' }
  const { data, error } = await db.from('formation_ateliers').insert({ formation_slug: formation, titre }).select('id').single()
  return error || !data ? { erreur: messageAtelier(error?.message ?? 'Création impossible') } : { id: data.id }
}

export async function sauverAtelier(id: string, a: { titre: string; ouvert: boolean }): Promise<string | null> {
  const db = admin()
  if (!db) return 'Supabase n’est pas configuré'
  if (!UUID.test(id)) return 'Atelier introuvable'
  const { data, error } = await db.from('formation_ateliers').update({ titre: a.titre, ouvert: a.ouvert }).eq('id', id).select('id')
  if (error) return messageAtelier(error.message)
  return data.length === 0 ? 'Atelier introuvable' : null
}

export async function supprimerAtelier(id: string): Promise<string | null> {
  const db = admin()
  if (!db) return 'Supabase n’est pas configuré'
  if (!UUID.test(id)) return 'Atelier introuvable'
  const { error } = await db.from('formation_ateliers').delete().eq('id', id)
  return error ? messageAtelier(error.message) : null
}

export async function listerFiches(atelierId: string): Promise<{ fiches: FicheEleve[]; erreur: string | null }> {
  const db = admin()
  if (!db) return { fiches: [], erreur: 'Supabase n’est pas configuré' }
  if (!UUID.test(atelierId)) return { fiches: [], erreur: null }
  const { data, error } = await db.from('formation_personas').select('id, nom, email, data, generations, created_at, updated_at').eq('atelier_id', atelierId).order('created_at', { ascending: false })
  if (error) return { fiches: [], erreur: messageAtelier(error.message) }
  return { fiches: (data ?? []).map(r => ({ ...r, data: normaliserFiche(r.data) })) as FicheEleve[], erreur: null }
}

// L'étudiant n'a pas de compte : la fiche est protégée par une clé secrète que seul son navigateur connaît.
export async function creerFiche(atelierId: string, nom: string, email: string): Promise<{ id: string; cle: string } | { erreur: string }> {
  const db = admin()
  if (!db) return { erreur: 'Service indisponible' }
  const { count, error: errCount } = await db.from('formation_personas').select('id', { count: 'exact', head: true }).eq('atelier_id', atelierId)
  if (errCount) return { erreur: messageAtelier(errCount.message) }
  if ((count ?? 0) >= MAX_FICHES) return { erreur: 'Cet atelier est complet' }
  const cle = `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, '')
  const { data, error } = await db.from('formation_personas').insert({ atelier_id: atelierId, cle, nom, email, data: normaliserFiche({}) }).select('id').single()
  return error || !data ? { erreur: 'Impossible de démarrer, réessayez' } : { id: data.id, cle }
}

export async function lireFiche(id: string, cle: string): Promise<{ fiche: (FicheEleve & { atelier_id: string }) | null }> {
  const db = admin()
  if (!db || !UUID.test(id) || typeof cle !== 'string' || cle.length < 20) return { fiche: null }
  const { data } = await db.from('formation_personas').select('*').eq('id', id).maybeSingle()
  if (!data || data.cle !== cle) return { fiche: null }
  return { fiche: { id: data.id, atelier_id: data.atelier_id, nom: data.nom, email: data.email, data: normaliserFiche(data.data), generations: data.generations, created_at: data.created_at, updated_at: data.updated_at } }
}

export async function sauverFiche(id: string, cle: string, fiche: Fiche, generations?: number): Promise<boolean> {
  const db = admin()
  const { fiche: f } = await lireFiche(id, cle)
  if (!db || !f) return false
  const maj: Record<string, unknown> = { data: normaliserFiche(fiche), updated_at: new Date().toISOString() }
  if (generations !== undefined) maj.generations = generations
  const { error } = await db.from('formation_personas').update(maj).eq('id', id)
  return !error
}
