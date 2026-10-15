import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getFormation, listerAteliers } from '@/lib/formationStore'
import { NouvelAtelier } from '@/components/formation/NouvelAtelier'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Persona' }

export default async function PersonaListePage({ params }: { params: { formation: string } }) {
  const { formation } = await getFormation(params.formation)
  if (!formation) notFound()
  const { ateliers, erreur } = await listerAteliers(params.formation)
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href={`/formation/${formation.slug}`} className="text-sm text-lion-blue">← {formation.titre}</Link>
      <h1 className="mt-4 text-3xl font-bold text-lion-blue">🧭 Comprendre son persona</h1>
      <p className="mt-1 text-lion-ink/70">Un guide en 4 étapes pour vos étudiants : du problème au produit digital, puis à l’avatar de leur client idéal, avec des prompts pour une IA. Créez un atelier, envoyez le lien, et suivez leur travail.</p>
      <div className="mt-6">
        <NouvelAtelier formation={formation.slug} />
      </div>
      {erreur && <p className="mt-6 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">⚠️ {erreur}</p>}
      {!erreur && ateliers.length === 0 && <p className="mt-8 rounded-xl border-2 border-dashed border-lion-blue/20 p-6 text-center text-lion-ink/70">Aucun atelier pour l’instant. Créez le premier ci-dessus.</p>}
      <ul className="mt-8 space-y-3">
        {ateliers.map(a => (
          <li key={a.id}>
            <Link href={`/formation/${formation.slug}/persona/${a.id}`} className="block rounded-xl border border-lion-blue/15 border-l-4 border-l-lion-gold bg-white p-4 shadow-sm transition hover:shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{a.titre}</h2>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${a.ouvert ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{a.ouvert ? '🟢 Ouvert' : '🔒 Fermé'}</span>
              </div>
              <p className="mt-1 text-sm text-lion-ink/70">{a.fiches} étudiant{a.fiches > 1 ? 's' : ''}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
