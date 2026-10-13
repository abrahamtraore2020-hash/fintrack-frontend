import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEpisode } from '@/lib/formationStore'
import { Whiteboard } from '@/components/formation/Whiteboard'

export const dynamic = 'force-dynamic'
type Params = { params: { formation: string; episode: string } }

export async function generateMetadata({ params }: Params) {
  const found = await getEpisode(params.formation, params.episode)
  return { title: found?.episode.titre ?? 'Module' }
}

export default async function EpisodePage({ params }: Params) {
  const found = await getEpisode(params.formation, params.episode)
  if (!found) notFound()
  const { formation, episode, suivant } = found

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Link href={`/formation/${formation.slug}`} className="text-sm text-lion-blue">← {formation.titre}</Link>
      <p className="mt-4 text-sm font-medium text-lion-blue">Module {episode.numero}</p>
      <h1 className="text-3xl font-bold">{episode.titre}</h1>
      {episode.resume && <p className="mt-2 text-lion-ink/75">{episode.resume}</p>}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_28rem]">
        <ol className="space-y-4">
          {episode.lecons.map((l, i) => (
            <li key={i} className="rounded-xl border border-lion-blue/15 border-l-4 border-l-lion-gold bg-white p-5 shadow-sm">
              <h2 className="font-semibold">{i + 1}. {l.titre}</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-lion-ink/80">
                {l.points.map((p, k) => <li key={k}>{p}</li>)}
              </ul>
            </li>
          ))}
        </ol>
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
  )
}
