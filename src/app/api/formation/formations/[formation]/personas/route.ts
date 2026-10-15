import { NextRequest, NextResponse } from 'next/server'
import { fail, requireTrainer } from '@/lib/formationApi'
import { creerAtelier, getFormation, listerAteliers } from '@/lib/formationStore'

export const dynamic = 'force-dynamic'
type Params = { params: { formation: string } }

export async function GET(req: NextRequest, { params }: Params) {
  const denied = await requireTrainer(req)
  if (denied) return denied
  const { ateliers, erreur } = await listerAteliers(params.formation)
  return erreur ? fail(erreur, 500) : NextResponse.json({ ateliers })
}

export async function POST(req: NextRequest, { params }: Params) {
  const denied = await requireTrainer(req)
  if (denied) return denied
  const { titre } = await req.json().catch(() => ({}))
  if (typeof titre !== 'string' || !titre.trim()) return fail('Donnez un titre à l’atelier')
  const { formation } = await getFormation(params.formation)
  if (!formation) return fail('Formation introuvable', 404)
  const res = await creerAtelier(params.formation, titre.trim().slice(0, 150))
  return 'erreur' in res ? fail(res.erreur, 500) : NextResponse.json(res)
}
