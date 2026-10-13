import { NextRequest, NextResponse } from 'next/server'
import { fail, requireTrainer } from '@/lib/formationApi'
import { listerInscriptions } from '@/lib/formationStore'

export const dynamic = 'force-dynamic'

// Réservé au formateur : liste des inscrits à un direct.
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireTrainer(req)
  if (denied) return denied
  const { inscriptions, erreur } = await listerInscriptions(params.id)
  return erreur ? fail(erreur, 500) : NextResponse.json({ inscriptions })
}
