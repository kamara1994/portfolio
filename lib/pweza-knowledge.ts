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

const projectLink = (id: string): ProofLink => ({ label: PROJECT_NAMES[id] ?? byId(id)?.title ?? id, href: `/projects/${id}` })
const LINKS = {
  email: { label: 'Email Joseph', href: `mailto:${EMAIL}` },
  resume: { label: 'Résumé (PDF)', href: '/resume/Joseph_Allan_Kamara_Resume_v3.pdf' },
  credentials: { label: 'Credentials', href: '/#credentials' },
  skills: { label: 'Skills with proof', href: '/#skills' },
  story: { label: 'His story', href: '/#story' },
  work: { label: 'All work', href: '/#work' },
}

const clean = (x?: string) => (x || '').replace(/\s+/g, ' ').trim()
const verifiedText = (x?: string) => clean(x).split(/(?<=[.!?])\s+/).filter((sent) => !UNCONFIRMED_FIGURES.test(sent)).join(' ')

export const PWEZA_KNOWLEDGE_CONTEXT = `
IDENTITY (names visitors may use)
- Full name: Joseph Allan Kamara. Allan is his middle name, and he also goes by Allan.
- "Allan", "Allan Kamara", "Joseph Allan", "Joseph", "Joe", "Mr. Kamara" and "Kamara" ALL refer to the same person: him. Never say you don't know who Allan is.
- If someone asks "who is Allan?", explain that Allan is Joseph's middle name and preferred name, then give a one-line intro.

WHAT YOU (PWEZA) CAN DO FOR VISITORS
- Answer questions about him from this knowledge base, with links to proof.
- Connect them to him live: if a visitor wants to talk or chat with him (by any of his names), the site pings him on his phone and he may join this same chat window himself. Tell them to keep the chat open. If he can't join right away, give his email.
- Share his résumé, email, LinkedIn and GitHub.

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
${shown.map((p) => `- ${p.title} [/projects/${p.id}] — ${clean(p.subtitle)}.
  What: ${verifiedText(p.description)}
  Problem: ${verifiedText(p.problem)}
  How he built it: ${verifiedText(p.approach)}
  Result: ${verifiedText(p.outcome || p.impact)}
  Status: ${p.status ?? 'case study'}${p.course ? ` · Course: ${p.course}` : ''} · Stack: ${p.stack.join(', ')}${p.github ? ` · Code: ${p.github}` : ''}${p.demo ? ` · Demo: ${p.demo}` : ''}`).join('\n')}

SKILLS (each with its evidence)
${SKILL_CATEGORIES.map((c) => `- ${c.title}: ${c.skills.map((s) => `${s.name} (${[...(s.projects ?? []).map((id) => PROJECT_NAMES[id] ?? id), ...(s.certs ?? [])].join(', ')})`).join('; ')}`).join('\n')}
`.trim()

function latest(messages: Msg[]) {
  return [...messages].reverse().find((m) => m.role === 'user')?.content || ''
}
/** Every way visitors refer to him becomes "joseph", so matching works whichever name they use. */
export function normalizeNames(t: string) {
  return t
    .replace(/\b(mr\.?\s+)?(joseph\s+)?al{1,2}[ae]n(\s+kamara)?\b/gi, 'joseph')
    .replace(/\bjoseph\s+kamara\b|\bmr\.?\s+kamara\b|\bkamara\b|\bjoe\b/gi, 'joseph')
}
const escRe = (w: string) => w.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
/** Whole-word / whole-phrase match, so "social" no longer matches "soc". */
const has = (t: string, words: string[]) => words.some((w) => new RegExp(`(^|[^a-z0-9+])${escRe(w)}($|[^a-z0-9+])`, 'i').test(t))

/** Visitor wants to talk to Joseph himself (by any name), or to a real person. */
export function wantsJoseph(text: string, previousAssistant = '') {
  const t = normalizeNames(text.toLowerCase())
  if (/\b(talk|chat|speak|connect|meet|call|message|text|reach|contact)\b[^.?!]{0,30}\b(joseph|him|human|real person|a person|someone real|the owner)\b/.test(t)) return true
  if (/\b(is|are) (joseph|he) (online|around|here|available to (chat|talk))\b|\blive (chat|person|agent)\b|\bget joseph\b|\bping joseph\b/.test(t)) return true
  if (/^(yes|yeah|yep|sure|please|ok(ay)?|go ahead|do it|yes please)\b/.test(t.trim()) && /ping (him|joseph)|join this chat|bring him in/i.test(previousAssistant)) return true
  return false
}
const lc = (x: string) => x.charAt(0).toLowerCase() + x.slice(1)
/** Old projects that are not documented on the site (no working repo or evidence yet). */
const UNDOCUMENTED = ['ids', 'intrusion detection', 'cve', 'vulnerability scanner', 'threat intel', 'blue v3', 'blue-v3', 'toolkit', 'visitor intelligence']
const isThanks = (t: string) => /\b(thank|thanks|thank you|thank u|appreciate it)\b/.test(t)
const isGreeting = (t: string) => /^(hello|hi|hey|yo|good (morning|afternoon|evening)|what'?s up|whats up)[!. ]*$/.test(t)
const isMicCheck = (t: string) => /\b(can you hear me|do you hear me|are you (there|listening|hearing me)|testing,? (one|1)|mic check|is this (working|on))\b/.test(t) && t.split(/\s+/).length <= 8
const isAck = (t: string) => /^(okay|ok|alright|got it|i see|understood|cool|nice|great|perfect|sounds good|makes sense)[.! ]*$/.test(t)

const TOPICS: { keys: string[]; reply: () => PwezaReply }[] = [
  {
    keys: ['fit', 'qualified', 'good for', 'suitable', 'right for', 'good match'],
    reply: () => ({ text: '', links: [] }), // resolved in fitReply()
  },
  {
    keys: ['who is joseph', 'who is he', 'his name', 'full name', 'middle name', 'preferred name', 'what do you call him', 'tell me about joseph'],
    reply: () => ({
      text: "Joseph Allan Kamara. Allan is his middle name, and he goes by Allan too. He's a cybersecurity student at BYU-Idaho who builds SOC automation, AWS security labs and AI security tools.",
      links: [LINKS.story, LINKS.work],
    }),
  },
  {
    keys: ['cert', 'certs', 'certification', 'certifications', 'certified', 'security+', 'ccna', 'pentest', 'pentest+', 'psaa', 'credential', 'credentials'],
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
    keys: ['hire', 'hiring', 'available', 'availability', 'job', 'interview', 'contact', 'email', 'reach', 'recruit', 'recruiter'],
    reply: () => ({
      text: `He's available now for full-time SOC Analyst, Security Engineer, Cloud Security, and IT roles, and graduates in December 2026. The fastest way to reach him is ${EMAIL}.`,
      links: [LINKS.email, LINKS.resume],
    }),
  },
  {
    keys: ['fortress', 'fortress v2', 'aws', 'cloud', 'terraform', 'cloudwatch', 'sns'],
    reply: () => {
      const p = byId('fortress-v2')!
      return {
        text: `FORTRESS v2 is a verified AWS security monitoring lab. He ${lc(p.impact)} He's upfront that the broader GuardDuty, WAF and Lambda design isn't deployed yet.`,
        links: [projectLink('fortress-v2'), LINKS.skills],
      }
    },
  },
  {
    keys: ['aegis', 'salone aegis', 'salone-aegis', 'agies', 'network lab', 'packet tracer'],
    reply: () => ({
      text: 'SALONE AEGIS is his open-source CCNA learning and network lab platform, with interactive lessons, practice exams, simulated networking and a development FastAPI backend. Live infrastructure integration is still in development.',
      links: [projectLink('salone-aegis')],
    }),
  },
  {
    keys: ['blue-x', 'blue x', 'pytorch', 'machine learning', 'classifier', 'classification'],
    reply: () => ({
      text: `BLUE-X is his AI threat classifier. ${byId('blue-x')!.impact}`,
      links: [projectLink('blue-x')],
    }),
  },
  {
    keys: ['blue soc', 'soc', 'splunk', 'n8n', 'triage', 'siem', 'security operations'],
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
    keys: ['skill', 'skills', 'stack', 'tools', 'technology', 'technologies', 'tech'],
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
    keys: ['project', 'projects', 'built', 'build', 'portfolio', 'showcase', 'his work'],
    reply: () => ({
      text: `His main projects are ${shown.filter((p) => p.placement === 'flagship').map((p) => p.title).join(', ')}. Want the SOC, cloud, or AI one first?`,
      links: shown.filter((p) => p.placement === 'flagship').map((p) => projectLink(p.id)),
    }),
  },
  {
    keys: ['graduate', 'graduating', 'graduation', 'degree', 'education', 'byu', 'byu-idaho', 'university', 'school', 'college'],
    reply: () => ({ text: "He's finishing a B.S. in Cybersecurity at BYU-Idaho and graduates in December 2026.", links: [LINKS.story] }),
  },
  {
    keys: ['resume', 'résumé', 'cv', 'download'],
    reply: () => ({ text: 'Here is his résumé. If you are hiring, email him and mention the role.', links: [LINKS.resume, LINKS.email] }),
  },
  {
    keys: ['sierra leone', 'freetown', 'story', 'about him', 'why security', 'where is he from', 'background story'],
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
  // Only small talk is scripted. Real questions go to the AI with the full knowledge base,
  // so follow-ups, detail and phrasing are understood; the scripted topics are the offline backup.
  const t = latest(messages).toLowerCase().trim()
  return !t || isThanks(t) || isGreeting(t) || isMicCheck(t) || isAck(t) || has(t, UNDOCUMENTED)
}

export function generateLocalPwezaReply(messages: Msg[]): PwezaReply {
  const t = normalizeNames(latest(messages).toLowerCase().trim())
  if (!t) return { text: 'Ask me about his projects, skills, certifications, or role fit.' }
  if (isThanks(t)) return { text: "You're welcome. Anything else?" }
  if (isGreeting(t)) return { text: "Hey, I'm PWEZA. Ask me anything about Joseph's work, and I'll show you the proof." }
  if (isMicCheck(t)) return { text: "Yes, I can hear you loud and clear. Ask me anything about Joseph's work, skills or fit for a role." }
  if (isAck(t)) return { text: 'What would you like to look at next?' }
  if (has(t, UNDOCUMENTED)) return {
    text: `That project isn't documented on this site, so I can't speak to it. The documented ones are ${shown.filter((p) => p.placement === 'flagship').map((p) => p.title).join(', ')}.`,
    links: [LINKS.work, LINKS.email],
  }
  if (has(t, TOPICS[0].keys)) return fitReply(t)
  for (const topic of TOPICS.slice(1)) if (has(t, topic.keys)) return topic.reply()
  return {
    text: `That's not something the site covers, so I won't guess. Want me to ping Joseph so he can join this chat and answer it himself? You can also email him at ${EMAIL}.`,
    links: [LINKS.email],
  }
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
  if (/r[ée]sum[ée]|\bcv\b/.test(t)) out.push(LINKS.resume)
  if (/\bskills?\b/.test(t)) out.push(LINKS.skills)
  return out.slice(0, 3)
}
