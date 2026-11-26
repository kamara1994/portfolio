import { NextRequest, NextResponse } from 'next/server'
import { validSid, isLive, readOut } from '@/lib/alerts/live'

// Polled by the PWEZA chat window: is Joseph live in this chat, and any new messages from him?
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const sid = req.nextUrl.searchParams.get('sid')
  const after = Math.max(0, Math.min(10_000, Number(req.nextUrl.searchParams.get('after')) || 0))
  if (!validSid(sid)) return NextResponse.json({ live: false, messages: [], next: after })
  const [live, messages] = await Promise.all([isLive(sid), readOut(sid, after)])
  return NextResponse.json({ live, messages, next: after + messages.length }, { headers: { 'Cache-Control': 'no-store' } })
}
