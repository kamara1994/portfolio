import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text required' }, { status: 400 })
    }

    const apiKey  = process.env.ELEVENLABS_API_KEY
    const voiceId = process.env.ELEVENLABS_VOICE_ID
    if (!apiKey || !voiceId) return NextResponse.json({ audio: null })

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.35, similarity_boost: 0.75, style: 0.65, speed: 1.0, use_speaker_boost: true },
      }),
    })

    if (!res.ok) {
      console.warn('ElevenLabs TTS failed:', res.status, await res.text())
      return NextResponse.json({ audio: null })
    }

    const buffer = await res.arrayBuffer()
    const audio  = `data:audio/mpeg;base64,${Buffer.from(buffer).toString('base64')}`
    return NextResponse.json({ audio })
  } catch (e) {
    console.error('TTS route error:', e)
    return NextResponse.json({ audio: null })
  }
}
