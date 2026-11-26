import { createHash } from 'crypto'
import { safe, bump } from '@/lib/alerts/store'

// 🛡 PWEZA guardrails: detect prompt-injection / jailbreak attempts before any model sees them,
// refuse politely, and log an anonymised record for the public /ai-security proof page.

export type AttackKind = 'prompt-injection' | 'prompt-extraction' | 'jailbreak' | 'impersonation' | 'encoded-payload' | 'abuse'

const RULES: [AttackKind, RegExp][] = [
  ['prompt-injection', /\b(ignore|disregard|forget|override)\b[^.?!]{0,40}\b(previous|prior|above|all|your|system)\b[^.?!]{0,20}\b(instructions?|rules?|prompts?|guidelines?|directions?)\b/i],
  ['prompt-injection', /\b(new|updated) (instructions?|rules?)\s*[:\-]|\bfrom now on,? you (will|must|are)\b/i],
  ['prompt-extraction', /\b(reveal|show|print|repeat|output|leak|tell me)\b[^.?!]{0,30}\b(system prompt|your (prompt|instructions|rules|guidelines|configuration)|hidden (prompt|instructions)|initial prompt)\b/i],
  ['jailbreak', /\b(DAN|do anything now|developer mode|jailbreak|unfiltered mode|no restrictions|without (any )?(rules|restrictions|filters))\b/i],
  ['jailbreak', /\b(pretend|act|roleplay|role-play)\b[^.?!]{0,25}\b(you are|as) (an? )?(unrestricted|evil|uncensored|different ai|hacker)\b/i],
  ['impersonation', /\b(i am|i'm|this is) (joseph|allan|the (site )?owner|your (developer|creator|admin))\b[^.?!]{0,40}\b(override|admin|debug|unlock|change (your|the) rules)\b/i],
  ['encoded-payload', /[A-Za-z0-9+/]{120,}={0,2}/],
  ['abuse', /<script\b|javascript:|\bunion\s+select\b|\$\{jndi:/i],
]

/** `isLogData`: a pasted alert/log for triage legitimately carries base64 and script fragments,
 *  so only the instruction-hijacking rules apply to it. */
export function detectAttack(text: string, isLogData = false): AttackKind | null {
  for (const [kind, re] of RULES) {
    if (isLogData && (kind === 'encoded-payload' || kind === 'abuse')) continue
    if (re.test(text)) return kind
  }
  return null
}

export const REFUSAL = "I can't do that. I only answer questions about Joseph's work, using what's verified on this site. Ask me about his projects, skills or fit for a role, and I'm all yours."

const redact = (t: string) => t.replace(/\S+@\S+/g, '[email]').replace(/\b\d{6,}\b/g, '[number]').replace(/\s+/g, ' ').slice(0, 90)

export async function logAttack(kind: AttackKind, text: string, ip: string, tz: string) {
  const who = createHash('sha256').update(`pweza|${ip}`).digest('hex').slice(0, 10)
  await safe(async (r) => {
    const p = r.pipeline()
    p.hincrby('ai:attacks', kind, 1)
    p.hincrby('ai:attacks', 'total', 1)
    p.lpush('ai:attacks:recent', JSON.stringify({ kind, at: Date.now(), who, sample: redact(text) }))
    p.ltrim('ai:attacks:recent', 0, 49)
    await p.exec()
  }, null)
  await bump('security', tz)
}

export async function attackStats() {
  return safe(async (r) => {
    const counts = (await r.hgetall<Record<string, number>>('ai:attacks')) || {}
    const recent = (await r.lrange<string | object>('ai:attacks:recent', 0, 14)).map((x) => (typeof x === 'string' ? JSON.parse(x) : x)) as { kind: AttackKind; at: number; who: string; sample: string }[]
    return { counts, recent }
  }, { counts: {} as Record<string, number>, recent: [] as { kind: AttackKind; at: number; who: string; sample: string }[] })
}
