import { NextRequest, NextResponse } from 'next/server'
import { fail, requireTrainer } from '@/lib/formationApi'
import { getDisplayName, setDisplayName } from '@/lib/formationStore'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const denied = await requireTrainer(req)
  if (denied) return denied
  return NextResponse.json({ nom: await getDisplayName() })
}

export async function PUT(req: NextRequest) {
  const denied = await requireTrainer(req)
  if (denied) return denied
  const { nom } = await req.json().catch(() => ({}))
  if (typeof nom !== 'string') return fail('Nom invalide')
  const error = await setDisplayName(nom.trim())
  return error ? fail(error, 500) : NextResponse.json({ ok: true })
}
