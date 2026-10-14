import { NextRequest, NextResponse } from 'next/server'
import { fail, requireTrainer } from '@/lib/formationApi'
import { listerResultats } from '@/lib/formationStore'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireTrainer(req)
  if (denied) return denied
  const { resultats, erreur } = await listerResultats(params.id)
  return erreur ? fail(erreur, 500) : NextResponse.json({ resultats })
}
