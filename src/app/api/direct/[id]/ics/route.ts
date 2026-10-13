import { PLATEFORME } from '@/data/formation'
import { fichierIcs } from '@/data/direct'
import { trouverDirect } from '@/lib/formationStore'

export const dynamic = 'force-dynamic'

// Public : fichier agenda (.ics) avec rappels. Il ne contient jamais le lien de la réunion.
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const found = await trouverDirect(params.id)
  if (!found || 'erreur' in found) return new Response('Direct introuvable', { status: 404 })
  const origine = new URL(req.url).origin
  return new Response(fichierIcs(found.direct, `${origine}/direct/${params.id}`, PLATEFORME.nom), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': 'attachment; filename="direct.ics"' },
  })
}
