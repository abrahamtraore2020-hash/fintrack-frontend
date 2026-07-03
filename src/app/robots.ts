import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/auth'],
        disallow: [
          '/dashboard',
          '/coffres',
          '/objectifs',
          '/integrations',
          '/funtwit',
          '/inbox',
          '/planification',
          '/rapports',
          '/previsions',
          '/conseils-ia',
          '/budget',
          '/recurrences',
          '/notifications',
          '/affiliation',
          '/parametres',
          '/pricing',
        ],
      },
    ],
    sitemap: 'https://fintrack-frontend-ebon.vercel.app/sitemap.xml',
  }
}
