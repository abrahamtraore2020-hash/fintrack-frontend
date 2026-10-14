import { NextResponse } from 'next/server'
import { lireExercice, lireFormations } from '@/lib/formationStore'

export const dynamic = 'force-dynamic'

// Public : l'exercice SANS les bonnes réponses.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { exercice, erreur } = await lireExercice(params.id)
  if (erreur) return NextResponse.json({ error: 'Service indisponible' }, { status: 503 })
  if (!exercice) return NextResponse.json({ error: 'Exercice introuvable' }, { status: 404 })
  const { formations } = await lireFormations()
  return NextResponse.json({
    titre: exercice.titre,
    formation: formations.find(f => f.slug === exercice.formation)?.titre ?? '',
    ouvert: exercice.ouvert,
    questions: exercice.ouvert
      ? exercice.questions.map(q => ({ id: q.id, texte: q.texte, reponses: q.reponses.map((r, i) => ({ i, texte: r.texte })) }))
      : [],
  })
}
