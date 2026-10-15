import { NextRequest, NextResponse } from 'next/server'
import { fail, requireObjet } from '@/lib/formationApi'
import { lireAtelier, listerFiches, sauverAtelier, supprimerAtelier } from '@/lib/formationStore'

export const dynamic = 'force-dynamic'
type Params = { params: { id: string } }

// Réservé au formateur : l'atelier et les fiches de ses étudiants.
export async function GET(req: NextRequest, { params }: Params) {
  const auth = await requireObjet(req, 'atelier', params.id)
  if ('denied' in auth) return auth.denied
  const { atelier, erreur } = await lireAtelier(params.id)
  if (erreur) return fail(erreur, 500)
  if (!atelier) return fail('Atelier introuvable', 404)
  const { fiches, erreur: e2 } = await listerFiches(params.id)
  return e2 ? fail(e2, 500) : NextResponse.json({ atelier, fiches })
}

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = await requireObjet(req, 'atelier', params.id)
  if ('denied' in auth) return auth.denied
  const { titre, ouvert } = await req.json().catch(() => ({}))
  if (typeof titre !== 'string' || !titre.trim()) return fail('Donnez un titre à l’atelier')
  const error = await sauverAtelier(params.id, { titre: titre.trim().slice(0, 150), ouvert: ouvert !== false })
  return error ? fail(error, 500) : NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await requireObjet(req, 'atelier', params.id)
  if ('denied' in auth) return auth.denied
  const error = await supprimerAtelier(params.id)
  return error ? fail(error, 500) : NextResponse.json({ ok: true })
}
