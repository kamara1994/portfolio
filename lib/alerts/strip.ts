import { hmac, SITE } from './telegram'
import { pageName, SECTION_LABELS } from './intel'
import { who, type Ctx, type Live } from './format'

// Encodes a visit into a signed URL that /api/alerts/strip renders as an image.

export type StripData = { w: string; s: number; t: number; p: [string, number, number][]; c: [string, number][] }

export function stripUrl(ctx: Ctx, live: Live, score: number) {
  const data: StripData = {
    w: who(ctx).slice(0, 48),
    s: score,
    t: live.durMs,
    p: live.steps.slice(-8).map((x) => [pageName(x.p).slice(0, 34), x.d, x.s]),
    c: Object.entries(live.sections || {}).filter(([id]) => SECTION_LABELS[id]).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id, ms]) => [SECTION_LABELS[id], ms]),
  }
  const d = Buffer.from(JSON.stringify(data)).toString('base64url')
  return `${SITE}/api/alerts/strip?d=${d}&s=${hmac(d).slice(0, 32)}`
}

export function readStrip(d: string | null, s: string | null): StripData | null {
  if (!d || !s || d.length > 4000 || hmac(d).slice(0, 32) !== s) return null
  try { return JSON.parse(Buffer.from(d, 'base64url').toString('utf8')) as StripData } catch { return null }
}
