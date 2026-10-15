import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getTrainerServer } from '@/lib/formationApi'
import { GestionFormateurs } from '@/components/formation/GestionFormateurs'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Formateurs' }

export default async function FormateursPage() {
  const trainer = await getTrainerServer()
  if (!trainer) redirect('/formation/acces')
  if (!trainer.admin) redirect('/formation')
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/formation" className="text-sm text-lion-blue">← Mes formations</Link>
      <h1 className="mt-4 text-3xl font-bold text-lion-blue">👥 Formateurs</h1>
      <p className="mt-1 text-lion-ink/70">Invitez d’autres formateurs : chacun reçoit son propre espace (formations, directs, exercices, ateliers) que les autres ne voient pas.</p>
      <GestionFormateurs />
    </main>
  )
}
