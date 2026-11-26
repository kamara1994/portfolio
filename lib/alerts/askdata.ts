import { recentVisits, statsFor, lastDays } from './store'
import { ask } from './brief'
import { dur } from './format'

// "Ask your bot anything": answers plain-English questions from stored visit history.
// The model only sees compact visit facts (no IPs) and must answer from them.

export async function answerFromData(question: string, tz: string) {
  const visits = await recentVisits(Date.now() - 30 * 86_400_000, 400)
  const days = lastDays(30, tz)
  const stats = (await statsFor(days)).filter((d) => d.visits || d.chats || d.security)
  if (!visits.length && !stats.length) return 'No visit history yet. It starts filling as people visit your site.'
  const rows = visits.filter((v) => !v.bot).map((v) => ({
    when: new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(v.start)),
    who: v.who, type: v.companyType, target: v.target, link: v.via, watch: v.watch,
    from: v.ref, place: [v.city, v.region, v.country].filter(Boolean).join(', '), role: v.role,
    time: dur(v.durMs), pages: v.pages.map((p) => `${p.n} (${dur(p.d)}, ${p.s}%)`), actions: v.actions,
    visitNumber: v.visitN, score: v.score, device: v.device,
  }))
  const out = await ask(
    `You answer the portfolio owner's questions about visitors to his site, using ONLY the data provided (last 30 days).
If the data can't answer, say so plainly. Be concise (max ~120 words), concrete, with names/places/numbers from the data. Plain text, no markdown tables.`,
    `Daily stats: ${JSON.stringify(stats)}\n\nVisits (newest first): ${JSON.stringify(rows).slice(0, 60000)}\n\nQuestion: ${question}`,
    450,
  )
  return out || 'Couldn\'t reach the AI right now — try again in a minute.'
}
