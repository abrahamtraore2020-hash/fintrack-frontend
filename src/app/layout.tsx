import type { Metadata } from 'next'
import { Providers } from '@/components/layout/Providers'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://fintrack-frontend-ebon.vercel.app'),
  title: {
    default: 'FINTRACK — Gérez vos finances avec intelligence',
    template: '%s | FINTRACK',
  },
  description: 'La solution financière africaine pour tracker vos revenus, dépenses et épargne. Connectez Wave, Orange Money, MTN, vos banques et gérez votre budget en FCFA.',
  keywords: [
    'fintrack', 'gestion finances Afrique', 'budget Afrique', 'Wave tracker',
    'Orange Money gestion', 'MTN Money', 'finances personnelles', 'épargne Afrique',
    'FCFA budget', 'XOF gestion financière', 'application financière Côte d\'Ivoire',
    'coffre épargne', 'revenus dépenses', 'Sénégal finances', 'Mali finances',
  ],
  authors: [{ name: 'FINTRACK' }],
  creator: 'FINTRACK',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://fintrack-frontend-ebon.vercel.app',
    siteName: 'FINTRACK',
    title: 'FINTRACK — Gérez vos finances avec intelligence',
    description: 'La solution financière africaine. Connectez Wave, Orange Money, MTN, tracktez vos revenus, créez des coffres d\'épargne et atteignez vos objectifs.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'FINTRACK - Gestion financière pour l\'Afrique' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FINTRACK — Gérez vos finances avec intelligence',
    description: 'La solution financière africaine. Wave, Orange Money, MTN, banques — tout au même endroit.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'FINTRACK' },
  other: { 'mobile-web-app-capable': 'yes' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#06D6A0" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
