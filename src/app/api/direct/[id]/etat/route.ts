import { NextResponse } from 'next/server'
import { debutDate, finDate, salleOuverte } from '@/data/direct'
import { trouverDirect } from '@/lib/formationStore'

export const dynamic = 'force-dynamic'

// Public : état du direct. Le lien de la réunion n'est renvoyé que quand la salle est ouverte.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const found = await trouverDirect(params.id)
  if (!found || 'erreur' in found) return NextResponse.json({ error: 'Direct introuvable' }, { status: 404 })
  const { direct } = found
  const now = new Date()
  return NextResponse.json({
    debut: debutDate(direct).toISOString(),
    fin: finDate(direct).toISOString(),
    ouverte: salleOuverte(direct, now),
    terminee: now >= finDate(direct),
    lien: salleOuverte(direct, now) ? direct.lien : null,
  })
}
