// 📅 Cal.com booking: CAL_LINK is "username/event-slug" (e.g. allan-kamara/30min).
export const bookingConfigured = () => /^[a-z0-9._-]+\/[a-z0-9._-]+$/i.test(process.env.CAL_LINK || '')

export function bookingUrl(prefill: { name?: string; email?: string; notes?: string } = {}) {
  if (!bookingConfigured()) return null
  const q = new URLSearchParams()
  if (prefill.name) q.set('name', prefill.name)
  if (prefill.email) q.set('email', prefill.email)
  if (prefill.notes) q.set('notes', prefill.notes.slice(0, 300))
  const qs = q.toString()
  return `https://cal.com/${process.env.CAL_LINK}${qs ? `?${qs}` : ''}`
}

export const wantsBooking = (t: string) =>
  /\b(book|schedule|set up|arrange|grab)\b[^.?!]{0,30}\b(call|meeting|interview|chat|time|slot|zoom|teams)\b|\b(calendar|availability for (a|an) (call|interview)|when (can|could) (we|i) (talk|meet|speak))\b/i.test(t)

export const BOOK_LABEL = '📅 Book a call with Joseph'
