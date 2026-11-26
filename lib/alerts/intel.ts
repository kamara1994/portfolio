import type { NextRequest } from 'next/server'
import { projects } from '@/data/projects'

// ---------- network & location ----------

export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-vercel-forwarded-for') || req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') || ''
}

const dec = (v: string | null) => { if (!v) return undefined; try { return decodeURIComponent(v) } catch { return v } }
const num = (v: string | null) => { const n = Number(v); return v && Number.isFinite(n) ? n : undefined }

export type Company = { name: string; domain?: string; type?: string }
export type Geo = {
  city?: string; region?: string; country?: string; zip?: string
  lat?: number; lon?: number; tz?: string
  org?: string; asn?: string
  company?: Company
  vpn?: boolean; proxy?: boolean; hosting?: boolean; tor?: boolean
}

export async function locate(req: NextRequest, ip: string): Promise<Geo> {
  const edge: Geo = {
    city: dec(req.headers.get('x-vercel-ip-city')),
    region: dec(req.headers.get('x-vercel-ip-country-region')),
    country: dec(req.headers.get('x-vercel-ip-country')),
    zip: dec(req.headers.get('x-vercel-ip-postal-code')),
    lat: num(req.headers.get('x-vercel-ip-latitude')),
    lon: num(req.headers.get('x-vercel-ip-longitude')),
    tz: dec(req.headers.get('x-vercel-ip-timezone')),
  }
  let info: Geo = {}
  const isPrivate = !ip || ip === '::1' || /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip)
  if (!isPrivate) {
    try {
      const token = process.env.IPINFO_TOKEN ? `?token=${process.env.IPINFO_TOKEN}` : ''
      const res = await fetch(`https://ipinfo.io/${encodeURIComponent(ip)}/json${token}`, { signal: AbortSignal.timeout(3500) })
      if (res.ok) {
        const d = await res.json()
        if (!d.bogon) {
          const [lat, lon] = String(d.loc || '').split(',').map(Number)
          const orgRaw = typeof d.org === 'string' ? d.org : ''
          info = {
            city: d.city, region: d.region, country: d.country, zip: d.postal,
            lat: Number.isFinite(lat) ? lat : undefined, lon: Number.isFinite(lon) ? lon : undefined,
            tz: d.timezone,
            org: orgRaw.replace(/^AS\d+\s+/, '') || d.asn?.name,
            asn: orgRaw.match(/^AS\d+/)?.[0] || d.asn?.asn,
            // Present on IPinfo plans that include company / privacy data; ignored otherwise.
            company: d.company?.name ? { name: d.company.name, domain: d.company.domain, type: d.company.type } : undefined,
            vpn: d.privacy?.vpn, proxy: d.privacy?.proxy, hosting: d.privacy?.hosting ?? (d.company?.type === 'hosting' || d.asn?.type === 'hosting' || undefined), tor: d.privacy?.tor,
          }
        }
      }
    } catch { /* enrichment is best-effort */ }
  }
  return {
    ...info,
    city: edge.city || info.city,
    region: info.region || edge.region,
    country: info.country || edge.country,
    zip: edge.zip || info.zip,
    lat: edge.lat ?? info.lat,
    lon: edge.lon ?? info.lon,
    tz: edge.tz || info.tz,
  }
}

// ---------- companies we care about ----------

const TARGETS: [string, string][] = [
  ['booz', 'Booz Allen Hamilton'], ['bah.com', 'Booz Allen Hamilton'],
  ['anthropic', 'Anthropic'], ['openai', 'OpenAI'], ['google', 'Google'], ['deepmind', 'Google DeepMind'],
  ['microsoft', 'Microsoft'], ['amazon', 'Amazon'], ['aws', 'Amazon Web Services'],
  ['crowdstrike', 'CrowdStrike'], ['mandiant', 'Mandiant'], ['palo alto', 'Palo Alto Networks'], ['paloaltonetworks', 'Palo Alto Networks'],
  ['wiz.io', 'Wiz'], ['lakera', 'Lakera'], ['snyk', 'Snyk'], ['lacework', 'Lacework'],
  ['deloitte', 'Deloitte'], ['ey.com', 'EY'], ['ernst', 'EY'], ['pwc', 'PwC'], ['kpmg', 'KPMG'], ['accenture', 'Accenture'],
  ['jobyaviation', 'Joby Aviation'], ['gtlic', 'Guarantee Trust Life'], ['gi-de', 'Giesecke+Devrient'], ['situsamc', 'SitusAMC'],
  ['honeywell', 'Honeywell'], ['lockheed', 'Lockheed Martin'], ['rtx', 'RTX'], ['raytheon', 'RTX'], ['northrop', 'Northrop Grumman'],
  ['hackerone', 'HackerOne'], ['bugcrowd', 'Bugcrowd'], ['cisco', 'Cisco'], ['ibm', 'IBM'], ['oracle', 'Oracle'],
  ['leidos', 'Leidos'], ['saic', 'SAIC'], ['caci', 'CACI'], ['mitre', 'MITRE'], ['fortinet', 'Fortinet'], ['cloudflare', 'Cloudflare'],
]
// ISP / hosting names that contain a target keyword but are not that employer.
const NOT_EMPLOYER = /google fiber|google cloud|amazon\.com.*(aws|ec2|data ?center)|amazon technologies|microsoft azure|azure|cloudflare warp/i

export function matchTarget(geo: Geo, referrerHost: string, via = ''): string {
  const hay = `${geo.company?.name || ''} ${geo.company?.domain || ''} ${geo.org || ''} ${referrerHost} ${via}`.toLowerCase()
  if (NOT_EMPLOYER.test(hay) && !geo.company) return ''
  return TARGETS.find(([k]) => hay.includes(k))?.[1] || ''
}

/** Joseph's own watchlist (from /watch): first term found in the visitor's company, network, referrer or link. */
export function watchMatch(terms: string[] | undefined, geo: Geo, referrerHost: string, via = ''): string {
  if (!terms?.length) return ''
  const hay = `${geo.company?.name || ''} ${geo.company?.domain || ''} ${geo.org || ''} ${referrerHost} ${via}`.toLowerCase().replace(/[^a-z0-9]+/g, ' ')
  const squash = hay.replace(/\s+/g, '')
  return terms.find((t) => {
    const k = t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
    return k && (hay.includes(k) || squash.includes(k.replace(/\s+/g, '')))
  }) || ''
}

// ---------- company links: josephkamara.vercel.app/deloitte ----------

export { RESERVED, viaSlug } from './slug'
import { viaSlug } from './slug'

// ---------- where they came from ----------

export type Ref = { label: string; kind: 'job' | 'social' | 'search' | 'ai' | 'email' | 'school' | 'site' | 'direct' | 'internal'; host: string }

const REFS: [RegExp, string, Ref['kind']][] = [
  [/(^|\.)linkedin\.com$|(^|\.)lnkd\.in$/, 'LinkedIn', 'job'],
  [/joinhandshake\.com$/, 'Handshake', 'job'],
  [/indeed\./, 'Indeed', 'job'],
  [/glassdoor\./, 'Glassdoor', 'job'],
  [/wellfound\.com$|angel\.co$/, 'Wellfound', 'job'],
  [/ziprecruiter\./, 'ZipRecruiter', 'job'],
  [/dice\.com$/, 'Dice', 'job'],
  [/clearancejobs\.com$/, 'ClearanceJobs', 'job'],
  [/usajobs\.gov$/, 'USAJOBS', 'job'],
  [/lever\.co$|greenhouse\.io$|myworkdayjobs\.com$|workday\.com$|ashbyhq\.com$|icims\.com$|smartrecruiters\.com$|jobvite\.com$|taleo\.net$/, 'Job application portal', 'job'],
  [/(^|\.)google\./, 'Google Search', 'search'],
  [/bing\.com$/, 'Bing', 'search'],
  [/duckduckgo\.com$/, 'DuckDuckGo', 'search'],
  [/chatgpt\.com$|openai\.com$/, 'ChatGPT', 'ai'],
  [/claude\.ai$/, 'Claude', 'ai'],
  [/perplexity\.ai$/, 'Perplexity', 'ai'],
  [/gemini\.google\.com$/, 'Gemini', 'ai'],
  [/mail\.google\.com$|outlook\.|mail\.yahoo\./, 'Email', 'email'],
  [/byui\.edu$/, 'BYU-Idaho', 'school'],
  [/github\.com$/, 'GitHub', 'site'],
  [/t\.co$|twitter\.com$|x\.com$/, 'X / Twitter', 'social'],
  [/facebook\.com$|fb\.com$|instagram\.com$|threads\.net$/, 'Meta', 'social'],
  [/reddit\.com$/, 'Reddit', 'social'],
  [/youtube\.com$/, 'YouTube', 'social'],
]

export function classifyReferrer(raw: string, selfHost: string): Ref {
  if (!raw || raw === 'direct') return { label: 'Direct / typed link', kind: 'direct', host: '' }
  let host = ''
  try { host = new URL(raw).hostname.replace(/^www\./, '') } catch { return { label: raw.slice(0, 60), kind: 'site', host: '' } }
  if (host === selfHost) return { label: 'Internal', kind: 'internal', host }
  const hit = REFS.find(([re]) => re.test(host))
  return hit ? { label: hit[1], kind: hit[2], host } : { label: host, kind: 'site', host }
}

// ---------- device & bots ----------

export function parseUA(ua: string) {
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\/|Opera/.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Unknown browser'
  const os = /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac OS X/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : /CrOS/.test(ua) ? 'ChromeOS' : /Linux/.test(ua) ? 'Linux' : 'Unknown OS'
  const kind = /Mobi|Android|iPhone|iPad/.test(ua) ? 'Mobile' : 'Desktop'
  return `${browser} · ${os} · ${kind}`
}

const CRAWLER = /bot\b|bot\/|crawl|spider|slurp|facebookexternalhit|embedly|preview|headless|lighthouse|pagespeed|python-requests|python-urllib|curl\/|wget|axios|node-fetch|undici|go-http|okhttp|httpclient|scrapy|phantom|puppeteer|playwright|selenium|vercel-screenshot|whatsapp|telegrambot|discordbot|slackbot|skypeuripreview/i

export function crawlerName(ua: string): string {
  if (!ua) return 'Empty user agent'
  const m = ua.match(CRAWLER)
  if (!m) return ''
  const named = ua.match(/([A-Za-z-]*bot)\b/i)?.[1]
  return named || m[0]
}

// ---------- pages ----------

const PAGE_NAMES: Record<string, string> = { '/': 'Home', '/projects': 'Project library', '/recruiter': 'Recruiter page', '/privacy': 'Privacy' }

export function pageName(path: string): string {
  const clean = (path || '/').split('?')[0].split('#')[0]
  if (PAGE_NAMES[clean]) return PAGE_NAMES[clean]
  const via = viaSlug(clean)
  if (via) return `Home (via /${via})`
  const m = clean.match(/^\/projects\/([^/]+)/)
  if (m) {
    const p = projects.find((x) => x.id === m[1])
    return p ? p.title : m[1]
  }
  return clean
}

export const SECTION_LABELS: Record<string, string> = {
  work: 'Projects', skills: 'Skills', credentials: 'Certifications', experience: 'Experience', story: 'Story', contact: 'Contact',
  architecture: 'Architecture', evidence: 'Evidence', 'source-code': 'Source code', 'project-index': 'Project index', 'featured-heading': 'Featured',
}

export const isProjectPage = (path: string) => /^\/projects\/[^/]+/.test(path || '')

// ---------- actions & lead score ----------

export const ACTIONS: Record<string, { label: string; loud: boolean; weight: number }> = {
  resume: { label: '📄 Résumé', loud: true, weight: 25 },
  email: { label: '✉️ Email', loud: true, weight: 25 },
  linkedin: { label: '💼 LinkedIn', loud: true, weight: 20 },
  github: { label: '🐙 GitHub', loud: false, weight: 10 },
  source: { label: '🧾 Source code', loud: false, weight: 10 },
  evidence: { label: '🔍 Evidence', loud: false, weight: 8 },
  demo: { label: '🖥 Live demo', loud: false, weight: 10 },
  video: { label: '🎬 Demo video', loud: false, weight: 6 },
  pweza: { label: '💬 Asked PWEZA', loud: false, weight: 8 },
}

export type Step = { p: string; d: number; s: number } // path, ms on page, max scroll %

export type ScoreInput = {
  target: string; company?: Company; ref: Ref; role?: string | null; via?: string; watch?: string
  durMs: number; steps: Step[]; actions: string[]; visits: number; bot: boolean
}

export function leadScore(i: ScoreInput): number {
  if (i.bot) return 0
  let s = 5
  if (i.via) s += 30
  if (i.watch) s += 25
  if (i.target) s += 35
  else if (i.company?.type === 'business') s += 12
  if (i.ref.kind === 'job') s += 20
  else if (i.ref.kind === 'search' || i.ref.kind === 'ai') s += 5
  if (i.role === 'recruiter') s += 20
  else if (i.role) s += 10
  if (i.durMs > 180_000) s += 20
  else if (i.durMs > 60_000) s += 10
  const pages = new Set(i.steps.map((x) => x.p)).size
  if (pages >= 3) s += 10
  s += Math.min(15, i.steps.filter((x) => isProjectPage(x.p)).length * 5)
  if (i.steps.some((x) => x.p === '/recruiter')) s += 10
  for (const a of Array.from(new Set(i.actions))) s += ACTIONS[a]?.weight || 0
  if (i.visits >= 3) s += 15
  else if (i.visits === 2) s += 10
  return Math.max(0, Math.min(100, Math.round(s)))
}
