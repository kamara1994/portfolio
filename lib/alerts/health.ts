import { tgConfigured, sendMessage, esc, SITE } from './telegram'
import { getSettings, isHushed } from './settings'

// Site health: automatic alerts when PWEZA's AI or voice fail for real visitors,
// and an on-demand /health check of every dependency.

const lastAlert = new Map<string, number>()

/** Throttled (30 min per component). `critical` buzzes the phone unless muted. */
export async function reportIssue(component: string, detail: string, critical = false) {
  if (!tgConfigured()) return
  const now = Date.now()
  if (now - (lastAlert.get(component) || 0) < 30 * 60_000) return
  lastAlert.set(component, now)
  try {
    const s = await getSettings()
    await sendMessage(
      `${critical ? '🚨' : '⚠️'} <b>Site health · ${esc(component)}</b>\n${esc(detail.slice(0, 300))}\n\n<i>Visitors are still served${critical ? ' a built-in fallback answer' : ''}. Send /health for a full check.</i>`,
      { thread: s.topics?.priority, silent: !critical || isHushed(s) },
    )
  } catch { /* never break the site for an alert */ }
}

type Check = { name: string; ok: boolean | null; ms: number; note?: string }

async function timed(name: string, fn: () => Promise<{ ok: boolean | null; note?: string }>): Promise<Check> {
  const t = Date.now()
  try { const r = await fn(); return { name, ...r, ms: Date.now() - t } }
  catch (e: any) { return { name, ok: false, ms: Date.now() - t, note: (e?.message || 'failed').slice(0, 80) } }
}

const status = async (url: string, init?: RequestInit) => {
  const r = await fetch(url, { ...init, signal: AbortSignal.timeout(8000) })
  return { ok: r.ok, note: r.ok ? undefined : `HTTP ${r.status}` }
}

export async function healthReport(): Promise<string> {
  const checks = await Promise.all([
    timed('Website', () => status(SITE)),
    timed('Project page', () => status(`${SITE}/projects/blue-soc-p8`)),
    timed('Groq (PWEZA AI #1)', async () => process.env.GROQ_API_KEY
      ? status('https://api.groq.com/openai/v1/models', { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` } })
      : { ok: null, note: 'not configured' }),
    timed('Gemini (PWEZA AI #2)', async () => process.env.GOOGLE_AI_API_KEY
      ? status(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_AI_API_KEY}`)
      : { ok: null, note: 'not configured' }),
    timed('Claude (PWEZA AI #3)', async () => process.env.ANTHROPIC_API_KEY
      ? status('https://api.anthropic.com/v1/models', { headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' } })
      : { ok: null, note: 'not configured' }),
    timed('Voice (Edge TTS)', async () => {
      const { synthesizeSpeech } = await import('@/lib/pweza-voice')
      const r: any = await synthesizeSpeech('Health check.')
      return { ok: !!r?.audio, note: r?.audio ? undefined : r?.error || 'no audio' }
    }),
    timed('Location lookup (IPinfo)', async () => {
      const token = process.env.IPINFO_TOKEN ? `?token=${process.env.IPINFO_TOKEN}` : ''
      const r = await fetch(`https://ipinfo.io/8.8.8.8/json${token}`, { signal: AbortSignal.timeout(6000) })
      if (!r.ok) return { ok: false, note: `HTTP ${r.status}` }
      const d = await r.json()
      return { ok: true, note: d.company ? 'company data ✓' : 'no company data on this plan' }
    }),
  ])
  const icon = (c: Check) => (c.ok === null ? '⚪' : c.ok ? '✅' : '❌')
  const bad = checks.filter((c) => c.ok === false).length
  return [
    `🩺 <b>Site health</b> · ${bad ? `${bad} problem${bad > 1 ? 's' : ''}` : 'all good'}`,
    '',
    ...checks.map((c) => `${icon(c)} ${esc(c.name)} · ${c.ms}ms${c.note ? ` · <i>${esc(c.note)}</i>` : ''}`),
    '',
    '✅ Telegram bot (you\'re reading this)',
  ].join('\n')
}
