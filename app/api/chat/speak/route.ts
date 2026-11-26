import { NextRequest, NextResponse } from 'next/server'
import { synthesizeSpeech } from '@/lib/pweza-voice'
import { safe } from '@/lib/alerts/store'

// 🔊 Speak any PWEZA reply in PWEZA's own voice (used when an answer arrived without audio,
// e.g. in hands-free talk mode or for instant answers like booking and handoffs).
export const runtime = 'nodejs'
export const maxDuration = 20

export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => ({}))
  const text = typeof b.text === 'string' ? b.text.replace(/\s*\[\d+\]/g, '').trim().slice(0, 900) : ''
  if (!text) return NextResponse.json({ audio: null }, { status: 400 })
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'anon'
  const n = await safe(async (r) => { const k = `speak:${ip}:${Math.floor(Date.now() / 60_000)}`; const v = await r.incr(k); await r.expire(k, 120); return v }, 0)
  if (n > 30) return NextResponse.json({ audio: null, error: 'slow-down' }, { status: 429 })
  const res = await synthesizeSpeech(text)
  return NextResponse.json({ audio: res.audio ?? null })
}
