import { NextResponse } from 'next/server'
import { lireExercice } from '@/lib/formationStore'

// Public : indique si le choix est juste et révèle la bonne réponse (après que l'élève a répondu).
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { qid, choix } = await req.json().catch(() => ({}))
  const { exercice } = await lireExercice(params.id)
  if (!exercice || !exercice.ouvert) return NextResponse.json({ error: 'Exercice indisponible' }, { status: 404 })
  const q = exercice.questions.find(x => x.id === qid)
  if (!q || !Number.isInteger(choix) || !q.reponses[choix]) return NextResponse.json({ error: 'Réponse invalide' }, { status: 400 })
  return NextResponse.json({ juste: q.reponses[choix].juste, bonne: q.reponses.findIndex(r => r.juste), explication: q.explication ?? null })
}
