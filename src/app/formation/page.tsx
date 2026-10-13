import Link from 'next/link'
import { FORMATION } from '@/data/formation'
import { getEpisodes } from '@/lib/formationStore'

export const dynamic = 'force-dynamic'
export const metadata = { title: FORMATION.titre }

export default async function FormationPage() {
  const episodes = await getEpisodes()
  return (
    <main className="min-h-screen max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gold">{FORMATION.titre}</h1>
          <p className="mt-2 text-lg opacity-80">{FORMATION.sousTitre}</p>
        </div>
        <Link href="/formation/editeur" className="rounded-lg border border-gold/50 px-3 py-1.5 text-sm">✏️ Modifier</Link>
      </div>
      <ul className="mt-8 space-y-4">
        {episodes.map(e => (
          <li key={e.slug}>
            <Link href={`/formation/${e.slug}`} className="block rounded-xl border border-gold/30 p-5 hover:border-gold transition">
              <span className="text-sm text-gold">Épisode {e.numero}</span>
              <h2 className="text-xl font-semibold">{e.titre}</h2>
              <p className="mt-1 opacity-80">{e.resume}</p>
              <p className="mt-2 text-sm opacity-60">{e.lecons.length} leçon{e.lecons.length > 1 ? 's' : ''}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
