import { NextRequest, NextResponse } from 'next/server'
import { getMemory, validVid } from '@/lib/pweza/extras'

// What PWEZA remembers about a returning (anonymous) visitor, for a "welcome back" opener.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const vid = req.nextUrl.searchParams.get('vid')
  if (!validVid(vid)) return NextResponse.json({ memory: null })
  const m = await getMemory(vid)
  return NextResponse.json({ memory: m && Date.now() - m.lastAt > 20 * 60_000 ? { topics: m.topics, last: m.questions[0], lastAt: m.lastAt } : null }, { headers: { 'Cache-Control': 'no-store' } })
}
