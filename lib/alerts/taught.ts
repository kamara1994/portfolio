import { teachings, type Teaching } from './store'

// Answers Joseph taught PWEZA from Telegram (/teach). A close match is answered
// directly; all teachings are also given to the AI as verified facts.

const STOP = new Set('a an the is are was were do does did you your joseph he his him i me my to of in on for and or with at by from about can could would will what whats which who how when where why be have has any it this that there'.split(' '))
const words = (s: string) => new Set(s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w)))

function similarity(a: string, b: string) {
  const A = words(a), B = words(b)
  if (!A.size || !B.size) return 0
  let inter = 0
  A.forEach((w) => { if (B.has(w)) inter++ })
  return inter / (A.size + B.size - inter)
}

export async function taughtAnswer(question: string): Promise<Teaching | null> {
  const list = await teachings()
  let best: Teaching | null = null, score = 0
  for (const t of list) { const s = similarity(question, t.q); if (s > score) { score = s; best = t } }
  return score >= 0.6 ? best : null
}

export async function taughtContext(): Promise<string> {
  const list = await teachings()
  if (!list.length) return ''
  return `\n\nVERIFIED ANSWERS FROM JOSEPH (use these exactly when relevant; they override anything else):\n${list.slice(0, 40).map((t) => `Q: ${t.q}\nA: ${t.a}`).join('\n')}`
}
