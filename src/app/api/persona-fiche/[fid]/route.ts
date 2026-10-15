import { NextRequest, NextResponse } from 'next/server'
import { normaliserFiche } from '@/data/persona'
import { lireFiche, sauverFiche } from '@/lib/formationStore'

export const dynamic = 'force-dynamic'

// Public (clé secrète de l'étudiant) : reprendre sa fiche.
export async function GET(req: NextRequest, { params }: { params: { fid: string } }) {
  const { fiche } = await lireFiche(params.fid, req.nextUrl.searchParams.get('cle') ?? '')
  if (!fiche) return NextResponse.json({ error: 'Fiche introuvable' }, { status: 404 })
  return NextResponse.json({ nom: fiche.nom, data: fiche.data, generations: fiche.generations })
}

// Public (clé secrète de l'étudiant) : enregistrer sa fiche.
export async function PUT(req: NextRequest, { params }: { params: { fid: string } }) {
  const { cle, data } = await req.json().catch(() => ({}))
  const ok = await sauverFiche(params.fid, cle, normaliserFiche(data))
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Enregistrement impossible' }, { status: 403 })
}
