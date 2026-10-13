import { NextRequest, NextResponse } from 'next/server'
import { FORMATION_COOKIE, isFormationAuthorized } from '@/lib/formationAuth'

// Renvoie une réponse 401 si la requête ne vient pas du formateur connecté.
export async function requireTrainer(req: NextRequest): Promise<NextResponse | null> {
  if (await isFormationAuthorized(req.cookies.get(FORMATION_COOKIE)?.value)) return null
  return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
}

export const fail = (error: string, status = 400) => NextResponse.json({ error }, { status })
