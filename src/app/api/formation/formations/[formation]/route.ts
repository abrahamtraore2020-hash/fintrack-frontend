import { NextRequest, NextResponse } from 'next/server'
import type { Episode } from '@/data/formation'
import { fail, requireFormation } from '@/lib/formationApi'
import { deleteFormation, getFormation, saveFormation } from '@/lib/formationStore'
import { normalizeTheme } from '@/data/theme'

export const dynamic = 'force-dynamic'
type Params = { params: { formation: string } }

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await requireFormation(req, params.formation)
  if ('denied' in auth) return auth.denied
  const { formation, erreur } = await getFormation(params.formation)
  if (erreur) return fail(`La base de données n’a pas pu être lue (${erreur}). Rien n’a été chargé pour ne pas écraser votre contenu.`, 503)
  return formation ? NextResponse.json({ formation }) : fail('Formation introuvable', 404)
}

function validEpisode(e: unknown): e is Episode {
  const x = e as Episode
  return (
    !!x && typeof x.slug === 'string' && /^[a-z0-9-]+$/.test(x.slug) &&
    typeof x.titre === 'string' && x.titre.trim() !== '' &&
    typeof x.resume === 'string' && Array.isArray(x.lecons) &&
    x.lecons.every(l =>
      typeof l.titre === 'string' && Array.isArray(l.points) && l.points.every(p => typeof p === 'string') &&
      (l.images === undefined || (Array.isArray(l.images) && l.images.every(u => typeof u === 'string' && /^https?:\/\//.test(u))))
    )
  )
}

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = await requireFormation(req, params.formation)
  if ('denied' in auth) return auth.denied
  const { titre, sousTitre, episodes, theme } = await req.json().catch(() => ({}))
  if (typeof titre !== 'string' || !titre.trim()) return fail('Donnez un nom à la formation')
  if (typeof sousTitre !== 'string' || !Array.isArray(episodes) || !episodes.every(validEpisode)) return fail('Données invalides')
  if (new Set(episodes.map((e: Episode) => e.slug)).size !== episodes.length) return fail('Deux modules ont le même identifiant')
  const error = await saveFormation(params.formation, { titre: titre.trim(), sousTitre: sousTitre.trim(), episodes, theme: normalizeTheme(theme) })
  return error ? fail(error, 500) : NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await requireFormation(req, params.formation)
  if ('denied' in auth) return auth.denied
  const error = await deleteFormation(params.formation)
  return error ? fail(error, 500) : NextResponse.json({ ok: true })
}
