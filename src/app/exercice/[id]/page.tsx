import { SalleExercice } from '@/components/formation/SalleExercice'

export const dynamic = 'force-dynamic'

export default function ExercicePublicPage({ params }: { params: { id: string } }) {
  return <SalleExercice id={params.id} />
}
