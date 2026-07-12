// lib/pweza-voice.ts
// Shared ElevenLabs voice layer for PWEZA. Centralizes voice-id / model
// resolution and synthesis so the chat and tts routes stay in sync.

// Accept either env name — the portfolio historically read ELEVENLABS_VOICE_ID,
// while the surrounding environment defines PWEZA_ELEVENLABS_VOICE_ID.
export function resolveVoiceId(): string {
  return process.env.ELEVENLABS_VOICE_ID || process.env.PWEZA_ELEVENLABS_VOICE_ID || ''
}

export function resolveModel(): string {
  // eleven_turbo_v2_5 is the low-latency sweet spot for live chat; honor an
  // explicit override (the environment sets eleven_multilingual_v2 for quality).
  return process.env.ELEVENLABS_TTS_MODEL || 'eleven_turbo_v2_5'
}

// Voice settings tuned to sound like a real person mid-conversation, not a
// flat narrator: enough stability to stay clear, enough style for warmth.
export const HUMAN_VOICE_SETTINGS = {
  stability: 0.45,
  similarity_boost: 0.8,
  style: 0.4,
  use_speaker_boost: true,
  speed: 1.0,
}

export interface SynthResult {
  audio: string | null
  error?: string
}

// Returns a base64 data URL for the spoken text, or null with a reason. Never
// throws — callers can always fall back to browser speech synthesis.
export async function synthesizeSpeech(text: string): Promise<SynthResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  const voiceId = resolveVoiceId()
  if (!apiKey) return { audio: null, error: 'no-api-key' }
  if (!voiceId) return { audio: null, error: 'no-voice-id' }

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({
        text,
        model_id: resolveModel(),
        voice_settings: HUMAN_VOICE_SETTINGS,
      }),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      // Surface the common, actionable failure explicitly.
      const reason = /payment/i.test(detail) ? 'elevenlabs-payment-required'
        : res.status === 401 ? 'elevenlabs-unauthorized'
        : `elevenlabs-${res.status}`
      console.warn('ElevenLabs TTS failed:', res.status, detail)
      return { audio: null, error: reason }
    }

    const buffer = await res.arrayBuffer()
    return { audio: `data:audio/mpeg;base64,${Buffer.from(buffer).toString('base64')}` }
  } catch (e: any) {
    console.warn('ElevenLabs TTS error:', e?.message || e)
    return { audio: null, error: 'network' }
  }
}
