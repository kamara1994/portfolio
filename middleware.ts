import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server'
import { matchRule, shouldAlert, securityAlert } from '@/lib/alerts/security'
import { viaSlug } from '@/lib/alerts/slug'

// 1) Mini SOC: block scanner / exploit / credential-file probes and canary paths, alert on Telegram.
// 2) Company links: josephkamara.vercel.app/deloitte shows the homepage; the visit alert says which link was used.

export function middleware(req: NextRequest, event: NextFetchEvent) {
  const { pathname, search } = req.nextUrl
  const rule = matchRule(pathname, search)
  if (rule) {
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim()
    if (shouldAlert(`${ip}|${rule.id}`)) {
      event.waitUntil(securityAlert({
        rule, path: pathname + search, method: req.method, ip,
        ua: req.headers.get('user-agent') || '',
        city: decode(req.headers.get('x-vercel-ip-city')), country: req.headers.get('x-vercel-ip-country'),
      }))
    }
    return new NextResponse('Not found', { status: 404, headers: { 'content-type': 'text/plain' } })
  }
  if (viaSlug(pathname)) return NextResponse.rewrite(new URL('/', req.url))
  return NextResponse.next()
}

function decode(v: string | null) { if (!v) return null; try { return decodeURIComponent(v) } catch { return v } }

export const config = {
  // Everything except Next's own assets; real files with extensions still get probe checks.
  matcher: ['/((?!_next/static|_next/image|_next/data).*)'],
}
