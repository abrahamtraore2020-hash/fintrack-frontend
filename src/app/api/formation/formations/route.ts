import { NextRequest, NextResponse } from 'next/server'
import { fail, requireTrainer } from '@/lib/formationApi'
import { createFormation, lireFormations } from '@/lib/formationStore'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const denied = await requireTrainer(req)
  if (denied) return denied
  return NextResponse.json(await lireFormations())
}

export async function POST(req: NextRequest) {
  const denied = await requireTrainer(req)
  if (denied) return denied
  const { titre, sousTitre } = await req.json().catch(() => ({}))
  if (typeof titre !== 'string' || !titre.trim()) return fail('Donnez un nom à la formation')
  const res = await createFormation(titre.trim(), typeof sousTitre === 'string' ? sousTitre.trim() : '')
  if ('error' in res) return fail(res.error, 500)
  return NextResponse.json(res)
}
