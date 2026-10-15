import { NextRequest, NextResponse } from 'next/server'
import { fail, requireAdmin } from '@/lib/formationApi'
import { changerActifFormateur } from '@/lib/formationStore'

// Réservé à l'administrateur : active ou désactive un formateur (un compte désactivé ne peut plus se connecter).
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireAdmin(req)
  if (denied) return denied
  const { actif } = await req.json().catch(() => ({}))
  if (typeof actif !== 'boolean') return fail('Données invalides')
  const error = await changerActifFormateur(params.id, actif)
  return error ? fail(error, 500) : NextResponse.json({ ok: true })
}
