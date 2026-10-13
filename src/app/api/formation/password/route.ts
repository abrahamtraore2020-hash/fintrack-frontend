import { NextRequest, NextResponse } from 'next/server'
import { fail, requireTrainer } from '@/lib/formationApi'
import { changePassword } from '@/lib/formationStore'

export async function POST(req: NextRequest) {
  const denied = await requireTrainer(req)
  if (denied) return denied
  const { actuel, nouveau } = await req.json().catch(() => ({}))
  if (typeof actuel !== 'string' || typeof nouveau !== 'string') return fail('Données invalides')
  if (nouveau.length < 8) return fail('Le nouveau mot de passe doit contenir au moins 8 caractères')
  const error = await changePassword(actuel, nouveau)
  return error ? fail(error, error === 'Mot de passe actuel incorrect' ? 401 : 500) : NextResponse.json({ ok: true })
}
