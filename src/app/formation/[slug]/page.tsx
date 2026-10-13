import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EPISODES, getEpisode } from '@/data/formation'
import { Whiteboard } from '@/components/formation/Whiteboard'

export function generateStaticParams() {
  return EPISODES.map(e => ({ slug: e.slug }))
}

export default function EpisodePage({ params }: { params: { slug: string } }) {
  const episode = getEpisode(params.slug)
  if (!episode) notFound()
  const index = EPISODES.indexOf(episode)
  const suivant = EPISODES[index + 1]

  return (
    <main className="min-h-screen max-w-6xl mx-auto px-4 py-10">
      <Link href="/formation" className="text-sm text-gold">← Tous les épisodes</Link>
      <p className="mt-4 text-sm text-gold">Épisode {episode.numero}</p>
      <h1 className="text-3xl font-bold">{episode.titre}</h1>
      <p className="mt-2 opacity-80">{episode.resume}</p>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_28rem]">
      <ol className="space-y-4">
        {episode.lecons.map((l, i) => (
          <li key={l.titre} className="rounded-xl border border-gold/30 p-5">
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
        <Link href={`/formation/${suivant.slug}`} className="mt-8 inline-block rounded-lg bg-gold px-5 py-2 font-semibold text-black">
          Épisode suivant : {suivant.titre} →
        </Link>
      )}
    </main>
  )
}
