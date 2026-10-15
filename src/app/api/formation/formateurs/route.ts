import { NextRequest, NextResponse } from 'next/server'
import { fail, requireAdmin } from '@/lib/formationApi'
import { creerInvitation, listerFormateurs, listerInvitations } from '@/lib/formationStore'

export const dynamic = 'force-dynamic'

// Réservé à l'administrateur : formateurs et invitations.
export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req)
  if (denied) return denied
  const [f, i] = await Promise.all([listerFormateurs(), listerInvitations()])
  return NextResponse.json({ formateurs: f.formateurs, invitations: i.invitations, erreur: f.erreur || i.erreur })
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req)
  if (denied) return denied
  const { nom } = await req.json().catch(() => ({}))
  const res = await creerInvitation(typeof nom === 'string' ? nom.trim().slice(0, 80) : '')
  return 'erreur' in res ? fail(res.erreur, 500) : NextResponse.json(res)
}
