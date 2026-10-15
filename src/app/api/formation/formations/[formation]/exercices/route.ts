import { NextRequest, NextResponse } from 'next/server'
import { fail, requireFormation } from '@/lib/formationApi'
import { creerExercice, getFormation, listerExercices } from '@/lib/formationStore'

export const dynamic = 'force-dynamic'
type Params = { params: { formation: string } }

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await requireFormation(req, params.formation)
  if ('denied' in auth) return auth.denied
  const { exercices, erreur } = await listerExercices(params.formation)
  return erreur ? fail(erreur, 500) : NextResponse.json({ exercices })
}

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await requireFormation(req, params.formation)
  if ('denied' in auth) return auth.denied
  const { titre } = await req.json().catch(() => ({}))
  if (typeof titre !== 'string' || !titre.trim()) return fail('Donnez un titre à l’exercice')
  const { formation } = await getFormation(params.formation)
  if (!formation) return fail('Formation introuvable', 404)
  const res = await creerExercice(params.formation, titre.trim().slice(0, 150))
  return 'erreur' in res ? fail(res.erreur, 500) : NextResponse.json(res)
}
