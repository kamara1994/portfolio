// lib/pweza-voice.ts
// Shared voice layer for PWEZA. Centralizes voice / prosody resolution and
// synthesis so the chat and tts routes stay in sync.
//
// Engine: Microsoft Edge neural TTS (via msedge-tts) — free, no API key, no
// billing. Voice is "PWEZA deep": Christopher pitched 28Hz down with a light
// slowdown for a confident delivery that stays clear in conversation.
// ElevenLabs was removed after its subscription lockout; if it ever returns,
// this module is the single door to swap engines behind.

import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

// Neural voices for visitors who write in another language (ISO-639-1 → Edge voice).
const VOICES: Record<string, string> = {
  fr: 'fr-FR-HenriNeural', es: 'es-MX-JorgeNeural', pt: 'pt-BR-AntonioNeural', de: 'de-DE-ConradNeural',
  it: 'it-IT-DiegoNeural', nl: 'nl-NL-MaartenNeural', ar: 'ar-SA-HamedNeural', hi: 'hi-IN-MadhurNeural',
  zh: 'zh-CN-YunxiNeural', ja: 'ja-JP-KeitaNeural', ko: 'ko-KR-InJoonNeural', sw: 'sw-KE-RafikiNeural',
  ru: 'ru-RU-DmitryNeural', tr: 'tr-TR-AhmetNeural', pl: 'pl-PL-MarekNeural',
}

function resolveVoice(lang?: string): string {
  const l = (lang || 'en').toLowerCase().slice(0, 2)
  return (l !== 'en' && VOICES[l]) || process.env.PWEZA_TTS_VOICE || 'en-US-ChristopherNeural'
}

// Prosody tunables — overridable from the environment so the voice character
// can be adjusted without a code deploy.
function resolveProsody(lang?: string) {
  const other = !!lang && !lang.startsWith('en') && !!VOICES[lang.slice(0, 2)]
  return {
    // The deep pitch shift is tuned for Christopher; other voices get a lighter touch
    pitch: other ? '-8Hz' : process.env.PWEZA_TTS_PITCH || '-28Hz',
    rate: process.env.PWEZA_TTS_RATE || '-7%',
  }
}

export interface SynthResult {
  audio: string | null
  error?: string
}

// Returns a base64 data URL for the spoken text, or null with a reason. Never
// throws — callers can always fall back to browser speech synthesis.
export async function synthesizeSpeech(text: string, lang?: string): Promise<SynthResult> {
  const tts = new MsEdgeTTS()
  try {
    await tts.setMetadata(resolveVoice(lang), OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3)
    const { audioStream } = tts.toStream(text, resolveProsody(lang))

    const chunks: Buffer[] = []
    for await (const chunk of audioStream) {
      chunks.push(chunk as Buffer)
    }
    const buffer = Buffer.concat(chunks)
    if (buffer.length === 0) {
      console.warn('Edge TTS returned no audio')
      return { audio: null, error: 'edge-tts-empty' }
    }
    return { audio: `data:audio/mpeg;base64,${buffer.toString('base64')}` }
  } catch (e: any) {
    console.warn('Edge TTS error:', e?.message || e)
    return { audio: null, error: 'edge-tts-failed' }
  } finally {
    try { tts.close() } catch {}
  }
}
