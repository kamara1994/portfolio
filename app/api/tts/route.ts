import { NextRequest, NextResponse } from 'next/server'
import { synthesizeSpeech } from '@/lib/pweza-voice'

export async function POST(req: NextRequest) {
  try {
    const { text, lang } = await req.json()
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text required' }, { status: 400 })
    }
    // hard cap so a giant payload can't be turned into a huge synthesis bill
    const clipped = text.slice(0, 800)
    const { audio, error } = await synthesizeSpeech(clipped, typeof lang === 'string' && /^[a-z]{2}$/.test(lang) ? lang : undefined)
    return NextResponse.json({ audio, ...(error ? { error } : {}) })
  } catch (e) {
    console.error('TTS route error:', e)
    return NextResponse.json({ audio: null, error: 'bad-request' })
  }
}
