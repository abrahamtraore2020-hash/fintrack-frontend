import { NextRequest, NextResponse } from 'next/server'
import { fail, getTrainer } from '@/lib/formationApi'
import { getDisplayName, setDisplayName } from '@/lib/formationStore'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const trainer = await getTrainer(req)
  if (!trainer) return fail('Non autorisé', 401)
  return NextResponse.json({ nom: await getDisplayName(trainer.id) })
}

export async function PUT(req: NextRequest) {
  const trainer = await getTrainer(req)
  if (!trainer) return fail('Non autorisé', 401)
  const { nom } = await req.json().catch(() => ({}))
  if (typeof nom !== 'string') return fail('Nom invalide')
  const error = await setDisplayName(nom.trim(), trainer.id)
  return error ? fail(error, 500) : NextResponse.json({ ok: true })
}
