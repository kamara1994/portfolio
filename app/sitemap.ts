import type { MetadataRoute } from 'next'
import { projects } from '@/data/projects'

const SITE = 'https://josephkamara.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: SITE, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    ...projects
      .filter((p) => p.placement)
      .map((p) => ({ url: `${SITE}/projects/${p.id}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 })),
    { url: `${SITE}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
