import { NextRequest, NextResponse } from 'next/server'
import { fail, requireAdmin } from '@/lib/formationApi'
import { supprimerInvitation } from '@/lib/formationStore'

export async function DELETE(req: NextRequest, { params }: { params: { code: string } }) {
  const denied = await requireAdmin(req)
  if (denied) return denied
  const error = await supprimerInvitation(params.code)
  return error ? fail(error, 500) : NextResponse.json({ ok: true })
}
