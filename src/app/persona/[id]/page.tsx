import { PersonaWizard } from '@/components/formation/PersonaWizard'

export const dynamic = 'force-dynamic'

export default function PersonaPublicPage({ params }: { params: { id: string } }) {
  return <PersonaWizard id={params.id} />
}
