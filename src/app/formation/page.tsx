import Link from 'next/link'
import { lireFormations } from '@/lib/formationStore'
import { ErreurBase } from '@/components/formation/ErreurBase'
import { DirectsPanel, LiveBanner } from '@/components/formation/DirectsPanel'
import { CreateFormation } from '@/components/formation/CreateFormation'

export const dynamic = 'force-dynamic'
export const metadata = { title: { absolute: 'Mes formations | Lion Attitude' } }

export default async function MesFormationsPage() {
  const { formations, erreur } = await lireFormations()
  return (
    <>
    <ErreurBase message={erreur} />
    <main className="mx-auto max-w-3xl px-4 py-10">
      <LiveBanner directs={formations.flatMap(f => f.directs)} />
      <h1 className="mt-4 text-3xl font-bold text-lion-blue">Mes formations</h1>
      <div className="mt-6">
        <CreateFormation />
      </div>
      {formations.length === 0 ? (
        <p className="mt-8 text-lion-ink/70">Vous n’avez pas encore de formation. Créez la première ci-dessus.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {formations.map(f => (
            <li key={f.slug}>
              <Link href={`/formation/${f.slug}`} className="block rounded-xl border border-lion-blue/15 border-l-4 border-l-lion-gold bg-white p-5 shadow-sm transition hover:shadow-md">
                <h2 className="text-xl font-semibold">{f.titre}</h2>
                {f.sousTitre && <p className="mt-1 text-lion-ink/75">{f.sousTitre}</p>}
                <p className="mt-2 text-sm font-medium text-lion-blue">{f.episodes.length} module{f.episodes.length > 1 ? 's' : ''}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <DirectsPanel formations={formations.map(f => ({ slug: f.slug, titre: f.titre, directs: f.directs }))} />
    </main>
    </>
  )
}
