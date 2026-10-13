import { notFound } from 'next/navigation'
import { debutDate, finDate } from '@/data/direct'
import { trouverDirect } from '@/lib/formationStore'
import { PageDirect } from '@/components/formation/PageDirect'

export const dynamic = 'force-dynamic'

export default async function DirectPublicPage({ params }: { params: { id: string } }) {
  const found = await trouverDirect(params.id)
  if (!found) notFound()
  if ('erreur' in found) {
    return <main className="mx-auto max-w-2xl px-4 py-10 text-center text-lion-ink/70">Cette page est momentanément indisponible. Réessayez dans quelques instants.</main>
  }
  const { direct, formation } = found
  // Le lien de la réunion n'est jamais envoyé ici : il est servi par /api/direct/[id]/etat, seulement quand la salle ouvre.
  return (
    <PageDirect
      id={direct.id}
      titre={direct.titre}
      formation={formation}
      debut={debutDate(direct).toISOString()}
      fin={finDate(direct).toISOString()}
      duree={direct.duree}
    />
  )
}
