import Image from 'next/image'
import type { Metadata } from 'next'
import { PLATEFORME } from '@/data/formation'

export const metadata: Metadata = {
  title: { absolute: `Espace formateur | ${PLATEFORME.nom}` },
  icons: { icon: '/lion-attitude-head.png', apple: '/lion-attitude-head.png' },
  robots: { index: false, follow: false },
}

export default function FormateurLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-lion-ink">
      <header className="border-b-2 border-lion-gold">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Image src="/lion-attitude-head.png" alt="" width={44} height={52} priority />
          <span className="min-w-0">
            <span className="block font-serif text-lg tracking-[0.2em] text-lion-blue">{PLATEFORME.nom.toUpperCase()}</span>
            <span className="block text-xs text-lion-ink/70">{PLATEFORME.sousTitre}</span>
          </span>
        </div>
      </header>
      {children}
    </div>
  )
}
