import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/internal-backup/', '/admin-portal/'] },
    sitemap: 'https://josephkamara.vercel.app/sitemap.xml',
  }
}
