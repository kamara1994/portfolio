import { NextRequest, NextResponse } from 'next/server'

// Server-side visitor tracking. Geolocation is resolved from the REAL request
// IP on the server (can't be blocked by ad-blockers or spoofed by the client),
// enriched with ISP/org + VPN/proxy/hosting flags, and pushed to Telegram with
// a map link. LogSnag logging is optional and never blocks the Telegram alert.

export const runtime = 'nodejs'

// Recruiter / target-company signals (matched against ISP/org + referrer).
const TARGET_COMPANIES = [
  'boozallen', 'booz-allen', 'bah.com',
  'anthropic', 'openai', 'google', 'deepmind',
  'microsoft', 'amazon', 'aws',
  'crowdstrike', 'mandiant', 'palo alto', 'paloaltonetworks',
  'wiz.io', 'lakera', 'snyk', 'lacework',
  'deloitte', 'ey.com', 'pwc', 'kpmg', 'accenture',
  'jobyaviation', 'gtlic', 'gi-de', 'situsamc',
  'honeywell', 'lockheedmartin', 'rtx', 'northrop',
  'hackerone', 'bugcrowd',
]

// Best-effort in-memory throttle so the public endpoint can't be used to spam
// the Telegram chat. Resets on cold start — fine for this use case.
const RATE = new Map<string, number>()
const RATE_WINDOW_MS = 30_000

function esc(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function clamp(s: unknown, max = 300): string {
  if (typeof s !== 'string') return ''
  return s.slice(0, max)
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') || ''
}

function parseUA(ua: string): string {
  const browser =
    /Edg\//.test(ua) ? 'Edge' :
    /OPR\/|Opera/.test(ua) ? 'Opera' :
    /Firefox\//.test(ua) ? 'Firefox' :
    /Chrome\//.test(ua) ? 'Chrome' :
    /Safari\//.test(ua) ? 'Safari' : 'Unknown browser'
  const os =
    /iPhone|iPad|iPod/.test(ua) ? 'iOS' :
    /Android/.test(ua) ? 'Android' :
    /Mac OS X/.test(ua) ? 'macOS' :
    /Windows/.test(ua) ? 'Windows' :
    /Linux/.test(ua) ? 'Linux' : 'Unknown OS'
  const kind = /Mobi|Android|iPhone|iPad/.test(ua) ? 'Mobile' : 'Desktop'
  return `${browser} on ${os} · ${kind}`
}

interface Geo {
  city?: string; region?: string; country?: string; zip?: string
  lat?: number; lon?: number; timezone?: string
  isp?: string; org?: string; as?: string
  proxy?: boolean; hosting?: boolean; mobile?: boolean
}

async function geolocate(ip: string): Promise<Geo> {
  if (!ip || ip === '::1' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return {} // local / private address — nothing to resolve
  }
  try {
    const fields = 'status,message,country,regionName,city,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting,query'
    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=${fields}`, {
      // don't let a slow geo lookup hang the request
      signal: AbortSignal.timeout(3500),
    })
    if (!res.ok) return {}
    const d = await res.json()
    if (d.status !== 'success') return {}
    return {
      city: d.city, region: d.regionName, country: d.country, zip: d.zip,
      lat: d.lat, lon: d.lon, timezone: d.timezone,
      isp: d.isp, org: d.org, as: d.as,
      proxy: d.proxy, hosting: d.hosting, mobile: d.mobile,
    }
  } catch {
    return {}
  }
}

async function sendTelegram(text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!botToken || !chatId) return { ok: false, error: 'telegram-not-configured' }
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    })
    return res.ok ? { ok: true } : { ok: false, status: res.status }
  } catch (e: any) {
    return { ok: false, error: e?.message || 'telegram-failed' }
  }
}

async function logSnag(payload: Record<string, unknown>) {
  const token = process.env.LOGSNAG_TOKEN
  const project = process.env.LOGSNAG_PROJECT
  const channel = process.env.LOGSNAG_CHANNEL
  if (!token || !project || !channel) return // optional — silently skip
  try {
    await fetch('https://api.logsnag.com/v1/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ project, channel, ...payload }),
    })
  } catch { /* analytics logging is best-effort */ }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const ip = clientIp(req)

    // throttle per IP
    const now = Date.now()
    const last = RATE.get(ip) || 0
    if (ip && now - last < RATE_WINDOW_MS) {
      return NextResponse.json({ ok: true, throttled: true })
    }
    if (ip) RATE.set(ip, now)

    const page = clamp(body.page, 200) || '/'
    const referrer = clamp(body.referrer, 300) || 'direct'
    const screen = clamp(body.screen, 40)
    const language = clamp(body.language, 40)
    const ua = clamp(req.headers.get('user-agent') || '', 400)

    const geo = await geolocate(ip)

    const locationParts = [geo.city, geo.region, geo.country].filter(Boolean)
    const location = locationParts.length ? locationParts.join(', ') : 'Unknown'
    const orgStr = geo.org || geo.isp || ''

    // priority-company detection across org, ISP, ASN, and referrer
    const haystack = `${geo.org || ''} ${geo.isp || ''} ${geo.as || ''} ${referrer}`.toLowerCase()
    const matched = TARGET_COMPANIES.find((c) => haystack.includes(c)) || ''

    const flags: string[] = []
    if (geo.proxy) flags.push('VPN/Proxy')
    if (geo.hosting) flags.push('Datacenter/Bot')
    if (geo.mobile) flags.push('Mobile network')

    const isPriority = !!matched
    const header = isPriority ? '🔥 <b>PRIORITY VISIT</b>' : flags.length ? '🕵️ <b>Portfolio visit</b>' : '👀 <b>Portfolio visit</b>'
    const mapLink = geo.lat != null && geo.lon != null
      ? `https://www.google.com/maps?q=${geo.lat},${geo.lon}`
      : ''

    const lines = [
      header,
      '',
      `📄 Page: ${esc(page)}`,
      `📍 Location: ${esc(location)}${geo.zip ? ` (${esc(geo.zip)})` : ''}`,
      mapLink ? `🗺️ Map: ${mapLink}` : null,
      geo.timezone ? `🕓 TZ: ${esc(geo.timezone)}` : null,
      ip ? `🌐 IP: ${esc(ip)}` : null,
      orgStr ? `🏢 ISP/Org: ${esc(orgStr)}` : null,
      matched ? `🎯 Match: ${esc(matched)}` : null,
      flags.length ? `🚩 Flags: ${esc(flags.join(' · '))}` : null,
      `🔗 Referrer: ${esc(referrer)}`,
      `📱 Device: ${esc(parseUA(ua))}${screen ? ` · ${esc(screen)}` : ''}${language ? ` · ${esc(language)}` : ''}`,
      `🕐 Time: ${new Date().toISOString()}`,
    ].filter(Boolean) as string[]

    const telegram = await sendTelegram(lines.join('\n'))

    // optional analytics log (non-blocking to the response contract)
    await logSnag({
      event: isPriority ? '🔥 PRIORITY VISIT' : 'Portfolio visit',
      description: `${location} · ${orgStr} · ${page}`,
      icon: isPriority ? '🔥' : '👀',
      notify: isPriority,
      tags: {
        page,
        priority: isPriority ? 'high' : 'normal',
        country: geo.country || 'unknown',
        ...(matched ? { company: matched } : {}),
      },
    })

    return NextResponse.json({ ok: true, telegram })
  } catch (err: any) {
    // never surface internals or 500 the visitor for an analytics failure
    return NextResponse.json({ ok: true, error: 'handled' })
  }
}
