import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { PLATEFORME } from '@/data/formation'

export const metadata: Metadata = {
  title: { absolute: PLATEFORME.nom, template: `%s | ${PLATEFORME.nom}` },
  description: PLATEFORME.sousTitre,
  icons: { icon: '/lion-attitude-head.png', apple: '/lion-attitude-head.png' },
  robots: { index: false, follow: false },
}

export default function FormationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-lion-cream text-lion-ink">
      <header className="border-b border-lion-gold/30 bg-white">
        <Link href="/formation" className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Image src="/lion-attitude-head.png" alt="" width={48} height={56} priority />
          <span>
            <span className="block font-serif text-xl tracking-[0.2em]">{PLATEFORME.nom.toUpperCase()}</span>
            <span className="block text-xs text-lion-ink/70 sm:text-sm">{PLATEFORME.sousTitre}</span>
          </span>
        </Link>
      </header>
      {children}
    </div>
  )
}
