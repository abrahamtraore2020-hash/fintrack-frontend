import { NextRequest, NextResponse } from 'next/server'
import { fail, getTrainer } from '@/lib/formationApi'
import { changePassword } from '@/lib/formationStore'

export async function POST(req: NextRequest) {
  const trainer = await getTrainer(req)
  if (!trainer) return fail('Non autorisé', 401)
  const { actuel, nouveau } = await req.json().catch(() => ({}))
  if (typeof actuel !== 'string' || typeof nouveau !== 'string') return fail('Données invalides')
  if (nouveau.length < 8) return fail('Le nouveau mot de passe doit contenir au moins 8 caractères')
  const error = await changePassword(actuel, nouveau, trainer.id)
  return error ? fail(error, error === 'Mot de passe actuel incorrect' ? 401 : 500) : NextResponse.json({ ok: true })
}
