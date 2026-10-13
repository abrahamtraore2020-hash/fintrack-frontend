import Link from 'next/link'
import { EPISODES, FORMATION } from '@/data/formation'

export const metadata = { title: FORMATION.titre }

export default function FormationPage() {
  return (
    <main className="min-h-screen max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold">{FORMATION.titre}</h1>
      <p className="mt-2 text-lg opacity-80">{FORMATION.sousTitre}</p>
      <ul className="mt-8 space-y-4">
        {EPISODES.map(e => (
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
