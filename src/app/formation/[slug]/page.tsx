import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEpisodeBySlug } from '@/lib/formationStore'
import { Whiteboard } from '@/components/formation/Whiteboard'

export const dynamic = 'force-dynamic'

export default async function EpisodePage({ params }: { params: { slug: string } }) {
  const found = await getEpisodeBySlug(params.slug)
  if (!found) notFound()
  const { episode, suivant } = found

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <Link href="/formation" className="text-sm text-lion-gold">← Tous les épisodes</Link>
      <p className="mt-4 text-sm text-lion-gold">Épisode {episode.numero}</p>
      <h1 className="text-3xl font-bold">{episode.titre}</h1>
      <p className="mt-2 opacity-80">{episode.resume}</p>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_28rem]">
      <ol className="space-y-4">
        {episode.lecons.map((l, i) => (
          <li key={l.titre} className="rounded-xl border border-lion-gold/30 bg-white p-5">
            <h2 className="font-semibold">{i + 1}. {l.titre}</h2>
            <ul className="mt-2 list-disc pl-5 opacity-80 space-y-1">
              {l.points.map(p => <li key={p}>{p}</li>)}
            </ul>
          </li>
        ))}
      </ol>
      <aside className="lg:sticky lg:top-4 self-start">
        <Whiteboard />
      </aside>
      </div>
      {suivant && (
        <Link href={`/formation/${suivant.slug}`} className="mt-8 inline-block rounded-lg bg-lion-gold px-5 py-2 font-semibold text-black">
          Épisode suivant : {suivant.titre} →
        </Link>
      )}
    </main>
  )
}
