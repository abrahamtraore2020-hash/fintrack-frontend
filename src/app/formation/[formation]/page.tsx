import Link from 'next/link'
import { notFound } from 'next/navigation'
import { compterInscriptions, getFormation } from '@/lib/formationStore'
import { ErreurBase } from '@/components/formation/ErreurBase'
import { DownloadPptx } from '@/components/formation/DownloadPptx'
import { DirectsPanel, LiveBanner } from '@/components/formation/DirectsPanel'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { formation: string } }) {
  const { formation } = await getFormation(params.formation)
  return { title: formation?.titre ?? 'Formation' }
}

export default async function FormationPage({ params }: { params: { formation: string } }) {
  const { formation: f, erreur } = await getFormation(params.formation)
  if (!f) notFound()
  const inscrits = await compterInscriptions()
  return (
    <>
    <ErreurBase message={erreur} />
    <main className="mx-auto max-w-3xl px-4 py-10">
      <LiveBanner directs={f.directs} />
      <Link href="/formation" className="mt-4 inline-block text-sm text-lion-blue">← Mes formations</Link>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{f.titre}</h1>
          {f.sousTitre && <p className="mt-2 text-lg text-lion-ink/75">{f.sousTitre}</p>}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row">
          <DownloadPptx formationTitre={f.titre} episodes={f.episodes} theme={f.theme} label="PowerPoint de la formation" />
          <Link href={`/formation/${f.slug}/editeur`} className="rounded-lg border border-lion-blue/30 px-3 py-1.5 text-sm text-lion-blue">✏️ Modifier</Link>
        </div>
      </div>
      {f.episodes.length === 0 ? (
        <div className="mt-8 rounded-xl border-2 border-dashed border-lion-gold p-8 text-center">
          <p className="text-lion-ink/75">Cette formation n’a pas encore de module.</p>
          <Link href={`/formation/${f.slug}/editeur?nouveau=1`} className="mt-4 inline-block rounded-lg bg-lion-blue px-5 py-2.5 font-semibold text-white">
            + Créer le premier module
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-8 space-y-4">
            {f.episodes.map(e => (
              <li key={e.slug}>
                <Link href={`/formation/${f.slug}/${e.slug}`} className="block rounded-xl border border-lion-blue/15 border-l-4 border-l-lion-gold bg-white p-5 shadow-sm transition hover:shadow-md">
                  <span className="text-sm font-medium text-lion-blue">Module {e.numero}</span>
                  <h2 className="text-xl font-semibold">{e.titre}</h2>
                  {e.resume && <p className="mt-1 text-lion-ink/75">{e.resume}</p>}
                  <p className="mt-2 text-sm text-lion-ink/60">{e.lecons.length} leçon{e.lecons.length > 1 ? 's' : ''}</p>
                </Link>
              </li>
            ))}
          </ul>
          <Link href={`/formation/${f.slug}/editeur?nouveau=1`} className="mt-6 inline-block rounded-lg bg-lion-blue px-5 py-2.5 font-semibold text-white">
            + Ajouter un module
          </Link>
        </>
      )}
      <DirectsPanel formations={[{ slug: f.slug, titre: f.titre, directs: f.directs }]} fixe={f.slug} inscrits={inscrits} />
    </main>
    </>
  )
}
