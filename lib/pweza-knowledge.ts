/**
 * PWEZA knowledge: ONLY facts that are shown and verified on the site.
 * - Projects: those with a `placement` (hidden projects are never mentioned)
 * - Skills: data/skills.ts (UNCONFIRMED skills are excluded)
 * - Credentials and experience: data/index.ts, minus figures awaiting confirmation
 * Every local reply carries proof links so visitors can check the claim.
 */
import { certs, experiences } from '@/data'
import { projects } from '@/data/projects'
import { SKILL_CATEGORIES, PROJECT_NAMES } from '@/data/skills'

export type ProofLink = { label: string; href: string }
export type PwezaReply = { text: string; links?: ProofLink[] }
type Msg = { role: string; content: string }

const EMAIL = 'kamarajosephallan@gmail.com'
const shown = projects.filter((p) => p.placement)
const byId = (id: string) => shown.find((p) => p.id === id)

/** Figures still awaiting Joseph's confirmation; kept out of the assistant entirely. */
const UNCONFIRMED_FIGURES = /10,000\+|95%\+/
const verifiedBullets = (bullets: string[]) => bullets.filter((b) => !UNCONFIRMED_FIGURES.test(b))

const projectLink = (id: string): ProofLink => ({ label: PROJECT_NAMES[id] ?? id, href: `/projects/${id}` })
const LINKS = {
  email: { label: 'Email Joseph', href: `mailto:${EMAIL}` },
  resume: { label: 'Résumé (PDF)', href: '/resume/Joseph_Allan_Kamara_Resume_v3.pdf' },
  credentials: { label: 'Credentials', href: '/#credentials' },
  skills: { label: 'Skills with proof', href: '/#skills' },
  story: { label: 'His story', href: '/#story' },
  work: { label: 'All work', href: '/#work' },
}

export const PWEZA_KNOWLEDGE_CONTEXT = `
JOSEPH SNAPSHOT
- Joseph Allan Kamara. Cybersecurity student and builder: SOC automation, AWS cloud security, AI security tools.
- Based in Philadelphia, PA; grew up in Freetown, Sierra Leone.
- B.S. Cybersecurity, BYU-Idaho, graduating December 2026. Available now for full-time roles.
- Target roles: SOC Analyst, Security Engineer, Cloud Security, IT / Systems.
- Contact: ${EMAIL}. GitHub: github.com/kamara1994. LinkedIn: linkedin.com/in/joseph-allan-kamara.

CREDENTIALS
${certs.map((c) => `- ${c.name} (${c.issuer}): ${c.status === 'earned' ? 'earned' : 'in progress, not yet earned'}`).join('\n')}

EXPERIENCE
${experiences.map((e) => `- ${e.role}, ${e.company} (${e.dates}). ${verifiedBullets(e.bullets).join(' ')}`).join('\n')}

PROJECTS (the only projects that exist for you to discuss)
${shown.map((p) => `- ${p.title} [/projects/${p.id}] ${p.subtitle}. ${p.description} Result: ${p.outcome || p.impact} Status: ${p.status ?? 'case study'}. Stack: ${p.stack.join(', ')}.`).join('\n')}

SKILLS (each with its evidence)
${SKILL_CATEGORIES.map((c) => `- ${c.title}: ${c.skills.map((s) => `${s.name} (${[...(s.projects ?? []).map((id) => PROJECT_NAMES[id] ?? id), ...(s.certs ?? [])].join(', ')})`).join('; ')}`).join('\n')}
`.trim()

function latest(messages: Msg[]) {
  return [...messages].reverse().find((m) => m.role === 'user')?.content || ''
}
const has = (t: string, words: string[]) => words.some((w) => t.includes(w))
const lc = (x: string) => x.charAt(0).toLowerCase() + x.slice(1)
/** Old projects that are not documented on the site (no working repo or evidence yet). */
const UNDOCUMENTED = ['ids', 'intrusion detection', 'cve', 'vulnerability scanner', 'threat intel', 'blue v3', 'blue-v3', 'toolkit', 'visitor intelligence']
const isThanks = (t: string) => /\b(thank|thanks|thank you|thank u|appreciate it)\b/.test(t)
const isGreeting = (t: string) => /^(hello|hi|hey|yo|good (morning|afternoon|evening)|what'?s up|whats up)[!. ]*$/.test(t)
const isAck = (t: string) => /^(okay|ok|alright|got it|i see|understood|cool|nice|great|perfect|sounds good|makes sense)[.! ]*$/.test(t)

const TOPICS: { keys: string[]; reply: () => PwezaReply }[] = [
  {
    keys: [' fit', 'fit ', 'qualified', 'good for', 'suitable', 'right for', 'good match'],
    reply: () => ({ text: '', links: [] }), // resolved in fitReply()
  },
  {
    keys: ['cert', 'security+', 'ccna', 'pentest', 'psaa', 'credential'],
    reply: () => {
      const earned = certs.filter((c) => c.status === 'earned').map((c) => c.name.replace(/ —.*$/, ''))
      const pending = certs.filter((c) => c.status !== 'earned').map((c) => c.name)
      return {
        text: `He holds ${earned.join(', ')}.${pending.length ? ` ${pending.join(', ')} is in progress, not earned yet.` : ''} Each earned cert links to the issuer's verification page.`,
        links: [LINKS.credentials],
      }
    },
  },
  {
    keys: ['hire', 'available', 'job', 'interview', 'contact', 'email', 'reach', 'recruit'],
    reply: () => ({
      text: `He's available now for full-time SOC Analyst, Security Engineer, Cloud Security, and IT roles, and graduates in December 2026. The fastest way to reach him is ${EMAIL}.`,
      links: [LINKS.email, LINKS.resume],
    }),
  },
  {
    keys: ['fortress', 'aws', 'cloud', 'terraform', 'cloudwatch', 'sns'],
    reply: () => {
      const p = byId('fortress-v2')!
      return {
        text: `FORTRESS v2 is a verified AWS security monitoring lab. He ${lc(p.impact)} He's upfront that the broader GuardDuty, WAF and Lambda design isn't deployed yet.`,
        links: [projectLink('fortress-v2'), LINKS.skills],
      }
    },
  },
  {
    keys: ['blue-x', 'blue x', 'pytorch', 'machine learning', 'classifier', 'classification'],
    reply: () => ({
      text: `BLUE-X is his AI threat classifier. ${byId('blue-x')!.impact}`,
      links: [projectLink('blue-x')],
    }),
  },
  {
    keys: ['blue soc', 'soc', 'splunk', 'n8n', 'triage', 'siem'],
    reply: () => ({
      text: `BLUE SOC is his AI-assisted SOC pipeline. ${byId('blue-soc-p8')!.impact} It was validated in a controlled lab, with a human approving containment.`,
      links: [projectLink('blue-soc-p8'), LINKS.skills],
    }),
  },
  {
    keys: ['pweza', 'who are you', 'what are you', 'voice agent'],
    reply: () => ({
      text: "I'm PWEZA, Joseph's portfolio assistant. I only answer from what's verified on this site, and I'll link you to the proof.",
      links: byId('pweza-voice-agent') ? [projectLink('pweza-voice-agent')] : undefined,
    }),
  },
  {
    keys: ['skill', 'stack', 'tools', 'technology', 'tech'],
    reply: () => {
      const all = SKILL_CATEGORIES.flatMap((c) => c.skills)
      const built = all.filter((s) => s.projects?.length).length
      return {
        text: `${all.length} skills are listed, and ${built} of them were used in real projects: Splunk and SOC triage in BLUE SOC, Terraform and CloudWatch in FORTRESS, PyTorch and Zeek in BLUE-X. Every skill links to its proof.`,
        links: [LINKS.skills],
      }
    },
  },
  {
    keys: ['experience', 'work history', 'background', 'job history'],
    reply: () => ({
      text: `${experiences.slice(0, 3).map((e) => `${e.role} at ${e.company}`).join('; ')}.`,
      links: [{ label: 'Experience', href: '/#experience' }],
    }),
  },
  {
    keys: ['project', 'built', 'portfolio', 'showcase', 'work'],
    reply: () => ({
      text: `His main projects are ${shown.filter((p) => p.placement === 'flagship').map((p) => p.title).join(', ')}. Want the SOC, cloud, or AI one first?`,
      links: shown.filter((p) => p.placement === 'flagship').map((p) => projectLink(p.id)),
    }),
  },
  {
    keys: ['graduat', 'degree', 'education', 'byu', 'university', 'school'],
    reply: () => ({ text: "He's finishing a B.S. in Cybersecurity at BYU-Idaho and graduates in December 2026.", links: [LINKS.story] }),
  },
  {
    keys: ['resume', 'cv', 'download'],
    reply: () => ({ text: 'Here is his résumé. If you are hiring, email him and mention the role.', links: [LINKS.resume, LINKS.email] }),
  },
  {
    keys: ['sierra leone', 'freetown', 'story', 'about him', 'why security'],
    reply: () => ({
      text: 'He grew up in Freetown, Sierra Leone, and saw how much daily life depends on infrastructure that works. That is why he cares about keeping real systems running.',
      links: [LINKS.story],
    }),
  },
]

function fitReply(t: string): PwezaReply {
  if (has(t, ['cloud', 'aws'])) return {
    text: 'For cloud security, the evidence is FORTRESS v2: a Terraform-deployed AWS lab where he verified log ingestion, a CloudWatch alarm, and SNS alerting end to end. His AWS Security Specialty is in progress, not earned yet.',
    links: [projectLink('fortress-v2'), LINKS.credentials],
  }
  if (has(t, ['soc', 'analyst', 'blue team', 'detection'])) return {
    text: 'For SOC work, he built BLUE SOC, an AI-assisted triage pipeline with Splunk and n8n where a human approves containment, and he holds TCM PSAA and Security+.',
    links: [projectLink('blue-soc-p8'), LINKS.credentials],
  }
  if (has(t, ['network', 'it ', 'help desk', 'system'])) return {
    text: 'For IT and networking, he holds the CCNA, built a Cisco branch network with OSPF, VRRP and VLANs, and works as a teaching assistant at BYU-Idaho.',
    links: [projectLink('enterprise-networking'), { label: 'Experience', href: '/#experience' }],
  }
  return {
    text: 'He fits entry-level SOC, security engineering, cloud security, and IT roles. Tell me which role, and I will show you the matching evidence.',
    links: [LINKS.work, LINKS.skills],
  }
}

/** True when a scripted, fully verified answer exists for the latest message. */
export function shouldUseLocalPwezaReply(messages: Msg[]) {
  const t = latest(messages).toLowerCase().trim()
  return !t || isThanks(t) || isGreeting(t) || isAck(t) || has(` ${t} `, UNDOCUMENTED) || TOPICS.some((x) => has(` ${t} `, x.keys))
}

export function generateLocalPwezaReply(messages: Msg[]): PwezaReply {
  const t = latest(messages).toLowerCase().trim()
  if (!t) return { text: 'Ask me about his projects, skills, certifications, or role fit.' }
  if (isThanks(t)) return { text: "You're welcome. Anything else?" }
  if (isGreeting(t)) return { text: "Hey, I'm PWEZA. Ask me anything about Joseph's work, and I'll show you the proof." }
  if (isAck(t)) return { text: 'What would you like to look at next?' }
  if (has(` ${t} `, UNDOCUMENTED.map((k) => (k.length <= 3 ? ` ${k} ` : k)))) return {
    text: `That project isn't documented on this site, so I can't speak to it. The documented ones are ${shown.filter((p) => p.placement === 'flagship').map((p) => p.title).join(', ')}.`,
    links: [LINKS.work, LINKS.email],
  }
  if (has(` ${t} `, TOPICS[0].keys)) return fitReply(t)
  for (const topic of TOPICS.slice(1)) if (has(t, topic.keys)) return topic.reply()
  return { text: `I don't have a verified answer for that. Joseph can tell you directly at ${EMAIL}.`, links: [LINKS.email] }
}

/** Proof links for an AI-written reply, based on what it mentions. */
export function linksForText(text: string): ProofLink[] {
  const t = text.toLowerCase()
  const out: ProofLink[] = []
  for (const p of shown) {
    const name = (PROJECT_NAMES[p.id] ?? p.title).toLowerCase()
    if (t.includes(name.split(' ')[0].toLowerCase()) && name.length > 3) out.push(projectLink(p.id))
  }
  if (/certif|security\+|ccna|pentest|psaa/.test(t)) out.push(LINKS.credentials)
  if (/email|contact|reach|hire|available/.test(t)) out.push(LINKS.email)
  return out.slice(0, 3)
}
