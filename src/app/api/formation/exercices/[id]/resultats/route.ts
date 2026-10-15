import { NextRequest, NextResponse } from 'next/server'
import { fail, requireObjet } from '@/lib/formationApi'
import { listerResultats } from '@/lib/formationStore'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireObjet(req, 'exercice', params.id)
  if ('denied' in auth) return auth.denied
  const { resultats, erreur } = await listerResultats(params.id)
  return erreur ? fail(erreur, 500) : NextResponse.json({ resultats })
}
