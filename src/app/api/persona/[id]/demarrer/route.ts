import { NextResponse } from 'next/server'
import { verifierEleve } from '@/data/exercice'
import { creerFiche, lireAtelier } from '@/lib/formationStore'

// Public : l'étudiant donne son nom et son email, puis reçoit sa fiche (identifiant + clé secrète).
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}))
  if (typeof body.site === 'string' && body.site) return NextResponse.json({ ok: true }) // champ piège anti-robots
  const e = verifierEleve(body.nom, body.email)
  if (!e.ok) return NextResponse.json({ error: e.erreur }, { status: 400 })
  const { atelier } = await lireAtelier(params.id)
  if (!atelier || !atelier.ouvert) return NextResponse.json({ error: 'Atelier indisponible' }, { status: 404 })
  const r = await creerFiche(atelier.id, e.nom, e.email)
  return 'erreur' in r ? NextResponse.json({ error: r.erreur }, { status: 500 }) : NextResponse.json(r)
}
