import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEpisode } from '@/lib/formationStore'
import { Whiteboard } from '@/components/formation/Whiteboard'
import { DownloadPptx } from '@/components/formation/DownloadPptx'
import { SlideViewer } from '@/components/formation/SlideViewer'
import { ImageGallery } from '@/components/formation/Lightbox'
import { ErreurBase } from '@/components/formation/ErreurBase'
import { LiveBanner } from '@/components/formation/DirectsPanel'

export const dynamic = 'force-dynamic'
type Params = { params: { formation: string; episode: string } }

export async function generateMetadata({ params }: Params) {
  const found = await getEpisode(params.formation, params.episode)
  return { title: found?.episode.titre ?? 'Module' }
}

export default async function EpisodePage({ params }: Params) {
  const found = await getEpisode(params.formation, params.episode)
  if (!found) notFound()
  const { formation, episode, suivant, erreur } = found

  return (
    <>
    <ErreurBase message={erreur} />
    <main className="mx-auto max-w-7xl px-4 py-10">
      <LiveBanner directs={formation.directs} />
      <Link href={`/formation/${formation.slug}`} className="mt-4 inline-block text-sm text-lion-blue">← {formation.titre}</Link>
      <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:justify-between sm:gap-4">
        <div>
          <p className="text-sm font-medium text-lion-blue">Module {episode.numero}</p>
          <h1 className="text-3xl font-bold">{episode.titre}</h1>
          {episode.resume && <p className="mt-2 text-lion-ink/75">{episode.resume}</p>}
        </div>
        <DownloadPptx formationTitre={formation.titre} episodes={[episode]} theme={formation.theme} label="PowerPoint du module" />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_26rem]">
        <div className="min-w-0 space-y-6">
          <SlideViewer formationTitre={formation.titre} episode={episode} theme={formation.theme} />
          <ol className="space-y-4">
            {episode.lecons.map((l, i) => (
              <li key={i} className="rounded-xl border border-lion-blue/15 border-l-4 border-l-lion-gold bg-white p-5 shadow-sm">
                <h2 className="font-semibold">{i + 1}. {l.titre}</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-lion-ink/80">
                  {l.points.map((p, k) => <li key={k}>{p}</li>)}
                </ul>
                <ImageGallery images={l.images ?? []} />
              </li>
            ))}
          </ol>
        </div>
        <aside className="self-start lg:sticky lg:top-4">
          <Whiteboard />
        </aside>
      </div>
      {suivant && (
        <Link href={`/formation/${formation.slug}/${suivant.slug}`} className="mt-8 inline-block rounded-lg bg-lion-blue px-5 py-2.5 font-semibold text-white">
          Module suivant : {suivant.titre} →
        </Link>
      )}
    </main>
    </>
  )
}
