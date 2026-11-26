import { projects } from '@/data/projects'
import { ask } from './brief'

// ✍️ Follow-up drafts and 🎓 interview prep packs, written from a visit alert.

const JOSEPH = () => {
  const work = projects
    .filter((p) => p.placement === 'flagship' || p.placement === 'more')
    .slice(0, 8)
    .map((p) => `- ${p.title}: ${p.subtitle}`)
    .join('\n')
  return `Joseph Allan Kamara — senior Cybersecurity student at BYU-Idaho (graduating December 2026), based in Philadelphia.
Certifications: CompTIA Security+, CompTIA PenTest+, Cisco CCNA, TCM Security PSAA (Practical SOC Analyst Associate), AWS Security Specialty.
Targets: SOC analyst, security engineer, cloud security and IT roles. Portfolio: josephkamara.vercel.app
Key projects:
${work}`
}

const DRAFT_RULES = `You write outreach for Joseph to send to someone at an organisation that showed interest in his work.
CRITICAL: never mention or hint that he saw them visit his site, tracked them, or knows what pages they read. Use what they viewed only to choose which of his work to highlight, phrased as his own initiative.
Never invent names, job titles, openings or facts about the organisation. If the organisation is unknown or is just an internet provider, write a general note for a hiring manager in security.
Sound like a real early-career professional: specific, warm, concise, no clichés ("I hope this finds you well", "passionate"), no emojis.`

export async function draftFollowUp(alertText: string) {
  const out = await ask(
    `${DRAFT_RULES}\n\nAbout Joseph:\n${JOSEPH()}`,
    `Visit alert (private, for context only):\n"""${alertText.slice(0, 2500)}"""\n\nWrite exactly two drafts:\n1) LINKEDIN NOTE — a connection request note, max 280 characters.\n2) FOLLOW-UP MESSAGE — a short LinkedIn message or email, max 110 words, ending with a clear, low-pressure ask (e.g. a 15-minute chat).\nLabel them exactly "LinkedIn note:" and "Message:".`,
    450,
  )
  return out || 'Couldn\'t reach the AI right now — try the button again in a minute.'
}

export async function redraft(draft: string, style: 'short' | 'formal' | 'warm') {
  const how = style === 'short' ? 'Make both drafts noticeably shorter and punchier (LinkedIn note under 200 characters).'
    : style === 'formal' ? 'Make both drafts more formal and polished, suitable for a large enterprise or government contractor.'
    : 'Make both drafts warmer and more personable while staying professional.'
  const out = await ask(`${DRAFT_RULES}\n\nAbout Joseph:\n${JOSEPH()}`, `Rewrite these drafts. ${how} Keep the same two labels.\n\n"""${draft.slice(0, 2500)}"""`, 450)
  return out || 'Couldn\'t reach the AI right now — try again in a minute.'
}

export async function prepPack(alertText: string) {
  const out = await ask(
    `You are a sharp career coach preparing Joseph for a possible interview. Be practical and specific.
Only state facts about the organisation that are widely known; otherwise say "check their job posting". Never invent openings or people.
About Joseph:\n${JOSEPH()}`,
    `This organisation showed interest in his portfolio (private context):\n"""${alertText.slice(0, 2500)}"""\n\nWrite a prep pack, max 300 words, plain text with these headings:\nWhat they seem to care about (from what they viewed)\nLead with these projects (2–3, one line each on why)\nLikely interview questions (5)\nSmart questions to ask them (3)`,
    700,
  )
  return out || 'Couldn\'t reach the AI right now — try the button again in a minute.'
}
