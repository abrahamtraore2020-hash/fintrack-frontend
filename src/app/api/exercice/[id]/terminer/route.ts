import { NextResponse } from 'next/server'
import { corriger, verifierEleve } from '@/data/exercice'
import { enregistrerResultat, lireExercice } from '@/lib/formationStore'

// Public : corrige les réponses côté serveur, enregistre le résultat et renvoie la note.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}))
  if (typeof body.site === 'string' && body.site) return NextResponse.json({ ok: true }) // champ piège anti-robots
  const eleve = verifierEleve(body.nom, body.email)
  if (!eleve.ok) return NextResponse.json({ error: eleve.erreur }, { status: 400 })
  const { exercice } = await lireExercice(params.id)
  if (!exercice || !exercice.ouvert) return NextResponse.json({ error: 'Exercice indisponible' }, { status: 404 })
  const reponses = Array.isArray(body.reponses)
    ? body.reponses.filter((r: { qid?: unknown; choix?: unknown }) => typeof r?.qid === 'string' && Number.isInteger(r?.choix)).slice(0, 60)
    : []
  const r = corriger(exercice.questions, reponses)
  const erreur = await enregistrerResultat(exercice.id, eleve.nom, eleve.email, r.score, r.total, r.note, reponses)
  if (erreur) return NextResponse.json({ error: 'Résultat non enregistré, réessayez' }, { status: 500 })
  return NextResponse.json({ ...r })
}
