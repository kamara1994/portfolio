import { NextRequest } from 'next/server'
import { safe } from '@/lib/alerts/store'
import { tg } from '@/lib/alerts/telegram'

// Streams a voice note Joseph recorded in Telegram to the visitor's chat window.
// The bot token never leaves the server; ids are random and expire.
export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!/^[a-z0-9]{8,16}$/.test(params.id)) return new Response('Not found', { status: 404 })
  const fileId = await safe((r) => r.get<string>(`voice:${params.id}`), null)
  if (!fileId) return new Response('Not found', { status: 404 })
  const f = await tg<{ file_path: string }>('getFile', { file_id: fileId })
  if (!f.ok || !f.result?.file_path) return new Response('Unavailable', { status: 502 })
  const res = await fetch(`${process.env.TELEGRAM_API_BASE || 'https://api.telegram.org'}/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${f.result.file_path}`)
  if (!res.ok || !res.body) return new Response('Unavailable', { status: 502 })
  return new Response(res.body, { headers: { 'Content-Type': f.result.file_path.endsWith('.mp3') ? 'audio/mpeg' : 'audio/ogg', 'Cache-Control': 'private, max-age=3600' } })
}
