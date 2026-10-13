import { NextRequest, NextResponse } from 'next/server'
import { FORMATION_COOKIE, isFormationAuthorized } from '@/lib/formationAuth'
import { getEpisodes, saveEpisodes } from '@/lib/formationStore'
import type { Episode } from '@/data/formation'

export const dynamic = 'force-dynamic'

const deny = () => NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

export async function GET(req: NextRequest) {
  if (!(await isFormationAuthorized(req.cookies.get(FORMATION_COOKIE)?.value))) return deny()
  return NextResponse.json({ episodes: await getEpisodes() })
}

function valid(e: unknown): e is Episode {
  const x = e as Episode
  return (
    !!x && typeof x.slug === 'string' && /^[a-z0-9-]+$/.test(x.slug) &&
    typeof x.titre === 'string' && x.titre.trim() !== '' &&
    typeof x.resume === 'string' && Array.isArray(x.lecons) &&
    x.lecons.every(l => typeof l.titre === 'string' && Array.isArray(l.points) && l.points.every(p => typeof p === 'string'))
  )
}

export async function PUT(req: NextRequest) {
  if (!(await isFormationAuthorized(req.cookies.get(FORMATION_COOKIE)?.value))) return deny()
  const { episodes } = await req.json().catch(() => ({ episodes: null }))
  if (!Array.isArray(episodes) || episodes.length === 0 || !episodes.every(valid)) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }
  if (new Set(episodes.map((e: Episode) => e.slug)).size !== episodes.length) {
    return NextResponse.json({ error: 'Deux épisodes ont le même identifiant' }, { status: 400 })
  }
  const error = await saveEpisodes(episodes)
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ ok: true })
}
