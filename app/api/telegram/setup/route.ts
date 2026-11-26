import { NextResponse } from 'next/server'
import { tg, tgConfigured, webhookSecret, SITE } from '@/lib/alerts/telegram'

// One-time setup: points the bot's webhook at this site and registers its command menu.
// Safe to call repeatedly — it only ever points the bot at this site's own /api/telegram, and refuses
// to replace a webhook that another service is already using unless ?force=1 is given.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!tgConfigured()) return NextResponse.json({ ok: false, error: 'TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set' })
  // Never silently take over a webhook another tool (e.g. n8n) already uses for this bot.
  const info = await tg<{ url?: string }>('getWebhookInfo', {})
  const current = info.result?.url || ''
  const ours = `${SITE}/api/telegram`
  const force = new URL(req.url).searchParams.get('force') === '1'
  if (current && current !== ours && !force) {
    let host = current
    try { host = new URL(current).host } catch {}
    return NextResponse.json({
      ok: false,
      error: 'bot-already-connected-elsewhere',
      connectedTo: host,
      note: 'This bot already sends its updates to another service. Commands were NOT enabled so that service keeps working. Visitor alerts work either way. Use a separate bot for commands, or add ?force=1 to move it here.',
    })
  }
  const hook = await tg('setWebhook', {
    url: `${SITE}/api/telegram`,
    secret_token: webhookSecret(),
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: true,
  })
  const cmds = await tg('setMyCommands', {
    commands: [
      { command: 'status', description: 'Current alert settings' },
      { command: 'mute', description: 'Silence alerts, e.g. /mute 2h' },
      { command: 'unmute', description: 'Turn alerts back on' },
      { command: 'quiet', description: 'Quiet hours, e.g. /quiet 23-7' },
      { command: 'tz', description: 'Time zone, e.g. /tz America/New_York' },
      { command: 'topics', description: 'Sort alerts into topic tabs' },
      { command: 'test', description: 'Send a sample visitor alert' },
      { command: 'help', description: 'What the bot can do' },
    ],
  })
  return NextResponse.json({ ok: hook.ok && cmds.ok, webhook: hook.ok ? 'connected' : hook.description, commands: cmds.ok ? 'registered' : cmds.description })
}
