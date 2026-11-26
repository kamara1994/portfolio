import { NextRequest, NextResponse } from 'next/server'
import { securityAlert, shouldAlert } from '@/lib/alerts/security'
import { CANARY_KEY } from '@/lib/alerts/canary'

// 🪤 Canary endpoint (see lib/alerts/canary.ts). Always refuses; always alerts (throttled per source).

export const runtime = 'nodejs'

async function trip(req: NextRequest) {
  const url = new URL(req.url)
  const sent = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || url.searchParams.get('key') || url.searchParams.get('apiKey') || ''
  const usedKey = sent.includes(CANARY_KEY)
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim()
  if (shouldAlert(`${ip}|canary|${usedKey}`)) {
    let city: string | null = req.headers.get('x-vercel-ip-city')
    try { city = city && decodeURIComponent(city) } catch {}
    await securityAlert({
      rule: usedKey
        ? { title: 'Canary API key used', technique: 'T1552 Unsecured Credentials → T1078 Valid Accounts (attempted)', severity: 'High' }
        : { title: 'Hidden internal endpoint probed', technique: 'T1595.003 Active Scanning: Wordlist Scanning', severity: 'Medium' },
      path: url.pathname + url.search, method: req.method, ip,
      ua: req.headers.get('user-agent') || '', city, country: req.headers.get('x-vercel-ip-country'),
      extra: usedKey ? 'The key was harvested from the page source — a deliberate secrets-scraping attempt.' : undefined,
    })
  }
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
}

export const GET = trip
export const POST = trip
export const PUT = trip
export const DELETE = trip
