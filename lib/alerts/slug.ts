// Company links: josephkamara.vercel.app/deloitte. Edge-safe (used by middleware).

export const RESERVED = new Set(['projects', 'recruiter', 'privacy', 'api', '_next', 'r', 'static', 'public', 'favicon', 'icon', 'manifest', 'sw', 'robots', 'sitemap', 'tg'])

/** "deloitte" for "/deloitte"; empty for real pages, files and anything that isn't a simple word. */
export function viaSlug(path: string): string {
  const m = (path || '').split('?')[0].match(/^\/([a-z0-9][a-z0-9-]{1,39})\/?$/i)
  if (!m) return ''
  const slug = m[1].toLowerCase()
  return RESERVED.has(slug) ? '' : slug
}

