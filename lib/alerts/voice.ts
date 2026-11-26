import { sendFile } from './telegram'

/** Speaks `text` in PWEZA's voice and sends it as a Telegram voice note (falls back to audio). */
export async function sendVoiceNote(text: string, caption: string, opts: { thread?: number | null; silent?: boolean } = {}) {
  const { synthesizeSpeech } = await import('@/lib/pweza-voice')
  const r: any = await synthesizeSpeech(text)
  if (!r?.audio) return { ok: false, description: r?.error || 'tts-failed' }
  const bytes = new Uint8Array(Buffer.from(String(r.audio).split(',')[1] || '', 'base64'))
  const v = await sendFile('sendVoice', 'voice', bytes, 'briefing.mp3', 'audio/mpeg', caption, opts)
  if (v.ok) return v
  return sendFile('sendAudio', 'audio', bytes, 'PWEZA briefing.mp3', 'audio/mpeg', caption, { ...opts, extra: { title: 'PWEZA evening briefing', performer: 'PWEZA' } })
}
