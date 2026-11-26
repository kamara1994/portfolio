import { once, safe } from '@/lib/alerts/store'
import { getSettings } from '@/lib/alerts/settings'

// 📱 Twilio SMS for the few alerts worth waking a phone for: a visitor asking for Joseph live,
// a lead leaving their email, a booked interview, a very hot visit. Capped and de-duplicated.

const SID = () => process.env.TWILIO_ACCOUNT_SID
export const smsConfigured = () => !!(SID() && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM && process.env.ALERT_PHONE)
const DAILY_CAP = 12

export async function smsEnabled() {
  if (!smsConfigured()) return false
  return !(await safe((r) => r.get<string>('sms:off'), null))
}
export async function setSms(on: boolean) {
  await safe(async (r) => { if (on) await r.del('sms:off'); else await r.set('sms:off', '1') }, null)
}

/** key de-duplicates (e.g. `lead:{sid}`); returns true if a text was sent. */
export async function sendSms(text: string, key: string, opts: { ignoreMute?: boolean } = {}): Promise<boolean> {
  if (!(await smsEnabled())) return false
  const s = await getSettings()
  if (!opts.ignoreMute && s.mutedUntil && s.mutedUntil > Date.now()) return false
  if (!(await once(`sms:${key}`, 6 * 3600))) return false
  const day = new Date().toISOString().slice(0, 10)
  const n = await safe(async (r) => { const v = await r.incr(`sms:count:${day}`); await r.expire(`sms:count:${day}`, 2 * 86_400); return v }, 0)
  if (n > DAILY_CAP) return false
  const body = new URLSearchParams({ To: process.env.ALERT_PHONE!, From: process.env.TWILIO_FROM!, Body: text.slice(0, 300) })
  try {
    const res = await fetch(`${process.env.TWILIO_API_BASE || 'https://api.twilio.com'}/2010-04-01/Accounts/${SID()}/Messages.json`, {
      method: 'POST',
      headers: { Authorization: 'Basic ' + Buffer.from(`${SID()}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
      body, signal: AbortSignal.timeout(8000),
    })
    return res.ok
  } catch { return false }
}
