import { NextRequest, NextResponse } from 'next/server'
import { fail, getTrainer } from '@/lib/formationApi'
import { createFormation, lireFormations } from '@/lib/formationStore'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const trainer = await getTrainer(req)
  if (!trainer) return fail('Non autorisé', 401)
  return NextResponse.json(await lireFormations(trainer.id))
}

export async function POST(req: NextRequest) {
  const trainer = await getTrainer(req)
  if (!trainer) return fail('Non autorisé', 401)
  const { titre, sousTitre } = await req.json().catch(() => ({}))
  if (typeof titre !== 'string' || !titre.trim()) return fail('Donnez un nom à la formation')
  const res = await createFormation(titre.trim(), typeof sousTitre === 'string' ? sousTitre.trim() : '', trainer.id)
  if ('error' in res) return fail(res.error, 500)
  return NextResponse.json(res)
}
