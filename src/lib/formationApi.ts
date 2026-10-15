import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_ID, FORMATION_COOKIE, readSession } from '@/lib/formationAuth'
import { formationDAtelier, formationDeExercice, formationDuDirect, lireFormateur, proprietaireDe } from '@/lib/formationStore'

export interface Trainer {
  id: string
  admin: boolean
}

async function depuisToken(token: string | undefined): Promise<Trainer | null> {
  const session = await readSession(token)
  if (!session) return null
  if (session.id === ADMIN_ID) return { id: ADMIN_ID, admin: true }
  const f = await lireFormateur(session.id)
  return f && f.actif ? { id: f.id, admin: f.admin } : null // un compte désactivé perd l'accès tout de suite
}

// Le formateur connecté (routes API) ou null.
export const getTrainer = (req: NextRequest) => depuisToken(req.cookies.get(FORMATION_COOKIE)?.value)

// Le formateur connecté (pages serveur) ou null.
export const getTrainerServer = () => depuisToken(cookies().get(FORMATION_COOKIE)?.value)

// Renvoie une réponse 401 si la requête ne vient pas d'un formateur connecté.
export async function requireTrainer(req: NextRequest): Promise<NextResponse | null> {
  if (await getTrainer(req)) return null
  return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
}

// Réservé à l'administrateur de la plateforme.
export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  const t = await getTrainer(req)
  if (!t) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  return t.admin ? null : NextResponse.json({ error: 'Réservé à l’administrateur' }, { status: 403 })
}

// Formateur connecté ET propriétaire de cette formation (sinon 401 / 404 : on ne révèle pas l'existence des autres espaces).
export async function requireFormation(req: NextRequest, slug: string): Promise<{ trainer: Trainer } | { denied: NextResponse }> {
  const trainer = await getTrainer(req)
  if (!trainer) return { denied: NextResponse.json({ error: 'Non autorisé' }, { status: 401 }) }
  if ((await proprietaireDe(slug)) !== trainer.id) return { denied: NextResponse.json({ error: 'Introuvable' }, { status: 404 }) }
  return { trainer }
}

// Idem pour un objet rattaché à une formation (exercice, atelier, direct) retrouvé par son identifiant.
export async function requireObjet(req: NextRequest, genre: 'exercice' | 'atelier' | 'direct', id: string): Promise<{ trainer: Trainer } | { denied: NextResponse }> {
  const slug = genre === 'exercice' ? await formationDeExercice(id) : genre === 'atelier' ? await formationDAtelier(id) : await formationDuDirect(id)
  if (!slug) {
    const t = await getTrainer(req)
    return t ? { denied: NextResponse.json({ error: 'Introuvable' }, { status: 404 }) } : { denied: NextResponse.json({ error: 'Non autorisé' }, { status: 401 }) }
  }
  return requireFormation(req, slug)
}

export const fail = (error: string, status = 400) => NextResponse.json({ error }, { status })
