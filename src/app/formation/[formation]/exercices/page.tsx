import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getTrainerServer } from '@/lib/formationApi'
import { getFormation, listerExercices } from '@/lib/formationStore'
import { NouvelExercice } from '@/components/formation/NouvelExercice'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Exercices' }

export default async function ExercicesPage({ params }: { params: { formation: string } }) {
  const trainer = await getTrainerServer()
  if (!trainer) redirect('/formation/acces')
  const { formation } = await getFormation(params.formation, trainer.id)
  if (!formation) notFound()
  const { exercices, erreur } = await listerExercices(params.formation)
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href={`/formation/${formation.slug}`} className="text-sm text-lion-blue">← {formation.titre}</Link>
      <h1 className="mt-4 text-3xl font-bold text-lion-blue">🎯 Exercices</h1>
      <p className="mt-1 text-lion-ink/70">Des questions à 3 réponses, une seule est juste, pour tester vos élèves avec une note sur 20.</p>
      <div className="mt-6">
        <NouvelExercice formation={formation.slug} />
      </div>
      {erreur && <p className="mt-6 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">⚠️ {erreur}</p>}
      {!erreur && exercices.length === 0 && (
        <p className="mt-8 rounded-xl border-2 border-dashed border-lion-blue/20 p-6 text-center text-lion-ink/70">Aucun exercice pour l’instant. Créez le premier ci-dessus.</p>
      )}
      <ul className="mt-8 space-y-3">
        {exercices.map(e => (
          <li key={e.id}>
            <Link href={`/formation/${formation.slug}/exercices/${e.id}`} className="block rounded-xl border border-lion-blue/15 border-l-4 border-l-lion-gold bg-white p-4 shadow-sm transition hover:shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{e.titre}</h2>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${e.ouvert ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{e.ouvert ? '🟢 Ouvert' : '🔒 Fermé'}</span>
              </div>
              <p className="mt-1 text-sm text-lion-ink/70">
                {e.questions.length} question{e.questions.length > 1 ? 's' : ''} · {e.passages} passage{e.passages > 1 ? 's' : ''}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
