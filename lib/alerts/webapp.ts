import { createHmac, timingSafeEqual } from 'crypto'

// Validates Telegram Mini App launch data (https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app)
// and checks it's Joseph opening it.

export function verifyInitData(initData: string): { ok: boolean; userId?: string; reason?: string } {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token || !initData) return { ok: false, reason: 'missing' }
  const params = new URLSearchParams(initData)
  const hash = params.get('hash') || ''
  params.delete('hash')
  const check = Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join('\n')
  const secret = createHmac('sha256', 'WebAppData').update(token).digest()
  const expected = createHmac('sha256', secret).update(check).digest('hex')
  if (hash.length !== expected.length || !timingSafeEqual(Buffer.from(hash), Buffer.from(expected))) return { ok: false, reason: 'bad-signature' }
  const authDate = Number(params.get('auth_date') || 0) * 1000
  if (!authDate || Date.now() - authDate > 24 * 3600_000) return { ok: false, reason: 'expired' }
  let userId = ''
  try { userId = String(JSON.parse(params.get('user') || '{}').id || '') } catch {}
  const owner = process.env.TELEGRAM_OWNER_ID || (String(process.env.TELEGRAM_CHAT_ID || '').startsWith('-') ? '' : String(process.env.TELEGRAM_CHAT_ID || ''))
  if (!owner || userId !== owner) return { ok: false, reason: 'not-owner' }
  return { ok: true, userId }
}
