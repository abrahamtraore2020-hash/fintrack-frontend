import { NextRequest, NextResponse } from 'next/server'
import { fail, requireFormation } from '@/lib/formationApi'
import { saveDirects } from '@/lib/formationStore'
import { normalizeDirects } from '@/data/direct'

export async function PUT(req: NextRequest, { params }: { params: { formation: string } }) {
  const auth = await requireFormation(req, params.formation)
  if ('denied' in auth) return auth.denied
  const { directs } = await req.json().catch(() => ({}))
  if (!Array.isArray(directs)) return fail('Données invalides')
  const propres = normalizeDirects(directs)
  if (propres.length !== directs.length) return fail('Un direct est incomplet : titre, date, heure et lien https sont obligatoires')
  const error = await saveDirects(params.formation, propres)
  return error ? fail(error, 500) : NextResponse.json({ ok: true })
}
