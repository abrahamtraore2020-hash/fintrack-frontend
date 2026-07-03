import { MetadataRoute } from 'next'

const BASE = 'https://fintrack-frontend-ebon.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE}/auth`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ]
}
