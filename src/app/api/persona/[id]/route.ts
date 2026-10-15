import { NextResponse } from 'next/server'
import { lireAtelier, lireFormations } from '@/lib/formationStore'

export const dynamic = 'force-dynamic'

// Public : informations de l'atelier (titre, ouvert ou fermé).
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { atelier, erreur } = await lireAtelier(params.id)
  if (erreur) return NextResponse.json({ error: 'Service indisponible' }, { status: 503 })
  if (!atelier) return NextResponse.json({ error: 'Atelier introuvable' }, { status: 404 })
  const { formations } = await lireFormations()
  return NextResponse.json({ titre: atelier.titre, ouvert: atelier.ouvert, formation: formations.find(f => f.slug === atelier.formation)?.titre ?? '' })
}
