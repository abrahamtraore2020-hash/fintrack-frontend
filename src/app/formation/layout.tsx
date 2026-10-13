import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { PLATEFORME } from '@/data/formation'
import { FORMATION_COOKIE, isFormationAuthorized } from '@/lib/formationAuth'
import { FormationMenu } from '@/components/formation/FormationMenu'

export const metadata: Metadata = {
  title: { absolute: PLATEFORME.nom, template: `%s | ${PLATEFORME.nom}` },
  description: PLATEFORME.sousTitre,
  icons: { icon: '/lion-attitude-head.png', apple: '/lion-attitude-head.png' },
  robots: { index: false, follow: false },
}

export default async function FormationLayout({ children }: { children: React.ReactNode }) {
  const connecte = await isFormationAuthorized(cookies().get(FORMATION_COOKIE)?.value)
  return (
    <div className="min-h-screen bg-white text-lion-ink">
      <header className="border-b-2 border-lion-gold bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link href="/formation" className="flex min-w-0 flex-1 items-center gap-3">
            <Image src="/lion-attitude-head.png" alt="" width={48} height={56} priority />
            <span className="min-w-0">
              <span className="block font-serif text-xl tracking-[0.2em] text-lion-blue">{PLATEFORME.nom.toUpperCase()}</span>
              <span className="block text-xs text-lion-ink/70 sm:text-sm">{PLATEFORME.sousTitre}</span>
            </span>
          </Link>
          {connecte && <FormationMenu />}
        </div>
      </header>
      {children}
    </div>
  )
}
