import { NextRequest, NextResponse } from 'next/server'
import { safe, dayKey } from '@/lib/alerts/store'
import { getSettings } from '@/lib/alerts/settings'
import { tgConfigured, sendMessage, esc } from '@/lib/alerts/telegram'
import { stashQuestion } from '@/lib/pweza/extras'

// 👍/👎 on PWEZA answers. 👎 goes to Joseph with a one-tap "teach a better answer".
export const runtime = 'nodejs'
const str = (v: unknown, n: number) => (typeof v === 'string' ? v.slice(0, n) : '')

export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => ({}))
  const vote = b.vote === 1 || b.vote === 'up' ? 1 : b.vote === -1 || b.vote === 'down' ? -1 : 0
  const q = str(b.q, 500), a = str(b.a, 1200)
  if (!vote || !q) return NextResponse.json({ ok: false }, { status: 400 })
  const s = await getSettings()
  const d = dayKey(Date.now(), s.tz)
  await safe(async (r) => {
    await r.hincrby(`feedback:${d}`, vote === 1 ? 'up' : 'down', 1)
    await r.expire(`feedback:${d}`, 120 * 86_400)
    if (vote === -1) { await r.lpush('feedback:down', JSON.stringify({ q, a, at: Date.now() })); await r.ltrim('feedback:down', 0, 99) }
  }, null)
  if (vote === -1 && tgConfigured()) {
    const id = await stashQuestion(q)
    await sendMessage(`👎 <b>A visitor found an answer unhelpful</b>\n❓ ${esc(q)}\n🤖 <i>${esc(a.replace(/\s*\[\d+\]/g, '').slice(0, 400))}</i>`, {
      thread: s.topics?.chats, silent: true, buttons: [[{ text: '🧠 Teach a better answer', callback_data: `teachq:${id}` }]],
    })
  }
  return NextResponse.json({ ok: true })
}
