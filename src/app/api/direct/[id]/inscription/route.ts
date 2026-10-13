import { NextResponse } from 'next/server'
import { finDate, verifierInscription } from '@/data/direct'
import { inscrire, trouverDirect } from '@/lib/formationStore'

// Public : inscription d'un participant à un direct.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}))
  // Champ piège caché dans le formulaire : seuls les robots le remplissent.
  if (typeof body.site === 'string' && body.site) return NextResponse.json({ ok: true })
  const found = await trouverDirect(params.id)
  if (!found || 'erreur' in found) return NextResponse.json({ error: 'Direct introuvable' }, { status: 404 })
  if (new Date() >= finDate(found.direct)) return NextResponse.json({ error: 'Ce direct est terminé' }, { status: 410 })
  const v = verifierInscription(body.nom, body.contact)
  if (!v.ok) return NextResponse.json({ error: v.erreur }, { status: 400 })
  const res = await inscrire(params.id, v.nom, v.contact, v.canal)
  if (!res.ok) return NextResponse.json({ error: res.erreur, doublon: res.doublon ?? false }, { status: res.doublon ? 200 : 500 })
  return NextResponse.json({ ok: true })
}
