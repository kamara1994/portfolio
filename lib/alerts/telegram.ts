import { createHmac } from 'crypto'

// Thin Telegram Bot API client used by visitor alerts, PWEZA chat alerts and the bot webhook.

export const SITE = process.env.SITE_URL || 'https://josephkamara.vercel.app'

export const tgConfigured = () => !!process.env.TELEGRAM_BOT_TOKEN && !!process.env.TELEGRAM_CHAT_ID
export const chatId = () => String(process.env.TELEGRAM_CHAT_ID || '')

export type TgResult<T = any> = { ok: boolean; result?: T; description?: string; error_code?: number }

export async function tg<T = any>(method: string, body: Record<string, unknown>, timeoutMs = 6000): Promise<TgResult<T>> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return { ok: false, description: 'telegram-not-configured' }
  try {
    const res = await fetch(`${process.env.TELEGRAM_API_BASE || 'https://api.telegram.org'}/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    })
    return (await res.json()) as TgResult<T>
  } catch (e: any) {
    return { ok: false, description: e?.message || 'telegram-fetch-failed' }
  }
}

export type Button = { text: string; url?: string; callback_data?: string }

export function keyboard(rows: (Button | null | undefined | false)[][]) {
  const clean = rows.map((r) => r.filter(Boolean) as Button[]).filter((r) => r.length)
  return clean.length ? { inline_keyboard: clean } : undefined
}

export async function sendMessage(text: string, opts: { thread?: number | null; silent?: boolean; buttons?: (Button | null | undefined | false)[][]; chat?: string } = {}) {
  const body: Record<string, unknown> = {
    chat_id: opts.chat || chatId(),
    text,
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    disable_notification: !!opts.silent,
  }
  if (opts.thread) body.message_thread_id = opts.thread
  const kb = opts.buttons ? keyboard(opts.buttons) : undefined
  if (kb) body.reply_markup = kb
  let r = await tg<{ message_id: number }>('sendMessage', body)
  // A deleted/closed topic shouldn't swallow the alert: retry in the main chat.
  if (!r.ok && opts.thread && /thread|topic/i.test(r.description || '')) {
    delete body.message_thread_id
    r = await tg<{ message_id: number }>('sendMessage', body)
  }
  return r
}

export async function editMessage(messageId: number, text: string, buttons?: (Button | null | undefined | false)[][]) {
  const body: Record<string, unknown> = {
    chat_id: chatId(),
    message_id: messageId,
    text,
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
  }
  const kb = buttons ? keyboard(buttons) : undefined
  if (kb) body.reply_markup = kb
  const r = await tg('editMessageText', body)
  if (!r.ok && /not modified/i.test(r.description || '')) return { ok: true }
  return r
}

export function esc(s: unknown): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** HMAC with the bot token as key: signs visitor context and derives the webhook secret. */
export function hmac(data: string): string {
  return createHmac('sha256', process.env.TELEGRAM_BOT_TOKEN || 'unset').update(data).digest('hex')
}

export const webhookSecret = () => hmac('pweza-telegram-webhook').slice(0, 48)
