import { certs, experiences, skillGroups } from '@/data'
import { projects } from '@/data/projects'

const featuredProjects = projects.filter((project) => project.featured)

export const PWEZA_KNOWLEDGE_CONTEXT = `
JOSEPH SNAPSHOT
- Name: Joseph Allan Kamara.
- Positioning: cybersecurity engineer, security automation builder, AI security builder, and cloud security practitioner.
- Location: Philadelphia, PA; from Sierra Leone.
- Education: BYU-Idaho, graduating April 2026.
- Availability: available now for SOC Analyst, Security Engineer, Cloud Security Engineer, AI Security Engineer, and related roles.
- Contact: kamarajosephallan@gmail.com.
- GitHub: https://github.com/kamara1994.
- LinkedIn: https://linkedin.com/in/joseph-allan-kamara.

CERTIFICATIONS
${certs.map((cert) => `- ${cert.name} (${cert.issuer}) - ${cert.status}${cert.date ? `, ${cert.date}` : ''}`).join('\n')}

CURRENT EXPERIENCE
${experiences.map((experience) => `- ${experience.role}, ${experience.company}, ${experience.dates}: ${experience.bullets.join(' ')}`).join('\n')}

FEATURED PROJECTS
${featuredProjects.map((project) => `- ${project.title}: ${project.subtitle}. Impact: ${project.impact} Stack: ${project.stack.slice(0, 8).join(', ')}.`).join('\n')}

ALL PROJECTS
${projects.map((project) => `- ${project.title} [${project.category}, ${project.status || 'case-study'}]: ${project.description} Outcome: ${project.outcome || project.impact}`).join('\n')}

SKILL GROUPS
${skillGroups.map((group) => `- ${group.title}: ${group.skills.join(', ')}`).join('\n')}

SITE ROUTES PWEZA CAN MENTION
- /projects/blue-soc-p8 for BLUE SOC details.
- /projects/fortress-v2 for the AWS cloud security lab.
- /projects/blue-x for the AI threat classification platform.
- /incident-replay for the Incident Replay Lab.
- /blue-soc-brief for the BLUE SOC briefing page.
- /threat-intel for threat intelligence content.
`.trim()

function latestUserMessage(messages: { role: string; content: string }[]) {
  return [...messages].reverse().find((message) => message.role === 'user')?.content || ''
}

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word))
}

function projectLine(projectId: string) {
  const project = projects.find((item) => item.id === projectId)
  if (!project) return ''
  return `${project.title} is ${project.subtitle}: ${project.impact}`
}

function previousAssistantMessage(messages: { role: string; content: string }[]) {
  return [...messages].reverse().find((message) => message.role === 'assistant')?.content || ''
}

function isShortAcknowledgement(text: string) {
  return /^(okay|ok|alright|got it|i see|understood|cool|nice|great|perfect|sounds good|makes sense)[.! ]*$/.test(text)
}

function isThanks(text: string) {
  return /\b(thank|thanks|thank you|thank u|appreciate it)\b/.test(text)
}

function isWellbeingAnswer(text: string) {
  return /^(i'?m|im|i am)?\s*(doing|feeling)?\s*(good|well|fine|great|okay|ok|alright|not bad)( thanks| thank you)?[.! ]*$/.test(text)
}

function isCasualGreeting(text: string) {
  return /^(hello|hi|hey|yo|good morning|good afternoon|good evening|what'?s up|whats up)[!. ]*$/.test(text)
}

function soundsLikeUnclearVoiceTranscript(text: string) {
  const words = text.replace(/[^a-z0-9' ]/g, ' ').split(/\s+/).filter(Boolean)
  const repeatedPhrase = /\b(for my|for me|do you|i mean)\s+\1\b/.test(text)
  const repeatedWord = words.some((word, index) => index > 0 && word.length > 2 && word === words[index - 1])
  return repeatedPhrase || repeatedWord || (text.includes('fit') && text.includes('girl'))
}

export function shouldUseLocalPwezaReply(messages: { role: string; content: string }[]) {
  const text = latestUserMessage(messages).toLowerCase()
  if (isThanks(text) || isWellbeingAnswer(text) || isCasualGreeting(text) || soundsLikeUnclearVoiceTranscript(text)) return true
  return includesAny(text, [
    'thank',
    'thanks',
    'how are you',
    'who are you',
    'what are you',
    'tell me more',
    'what else',
    'go on',
    'hire',
    'available',
    'recruit',
    'job',
    'role',
    'interview',
    'contact',
    'email',
    'blue soc',
    'soc',
    'splunk',
    'n8n',
    'telegram',
    'fortress',
    'aws',
    'cloud',
    'terraform',
    'guardduty',
    'lambda',
    'blue-x',
    'blue x',
    'machine learning',
    'pytorch',
    'ai threat',
    'classification',
    'project',
    'built',
    'portfolio',
    'showcase',
    'skill',
    'stack',
    'tools',
    'technology',
    'tech',
    'cert',
    'certification',
    'security+',
    'ccna',
    'pentest',
    'psaa',
    'experience',
    'work history',
    'background',
    'resume',
    'download',
    'cv',
  ]) || isShortAcknowledgement(text.trim())
}

export function generateLocalPwezaReply(messages: { role: string; content: string }[]) {
  const raw = latestUserMessage(messages)
  const text = raw.toLowerCase()

  if (!raw.trim()) {
    return 'Ask me about Joseph\'s projects, skills, certifications, or hiring fit, and I\'ll give you the useful version fast.'
  }

  if (isThanks(text)) {
    return 'You\'re welcome.'
  }

  if (isShortAcknowledgement(text.trim())) {
    return 'Got you. What\'s on your mind?'
  }

  if (includesAny(text, ['how are you', 'how\'s it going', 'how is it going'])) {
    return 'I\'m doing well, thanks for asking. How are you?'
  }

  if (isWellbeingAnswer(text.trim())) {
    return 'Glad to hear it. What\'s on your mind?'
  }

  if (soundsLikeUnclearVoiceTranscript(text)) {
    if (text.includes('girl')) {
      return 'I may have caught that wrong. Did you mean whether Joseph would be a good fit for someone personally, or whether he\'d fit a job or project?'
    }
    return 'I may have caught that wrong. Could you say it one more time?'
  }

  if (includesAny(text, ['who are you', 'what are you'])) {
    return 'I\'m PWEZA, Joseph\'s AI portfolio assistant. I can talk with you naturally and help you explore his work, experience, and career fit.'
  }

  if (includesAny(text, ['tell me more', 'what else', 'go on'])) {
    const previous = previousAssistantMessage(messages).toLowerCase()
    if (previous.includes('blue soc')) {
      return 'BLUE SOC connects Splunk detections to n8n automation, AI-assisted triage, analyst review, and alert delivery. The useful part is the full workflow: it shows how Joseph thinks about reducing repetitive SOC work while keeping a human in control.'
    }
    if (previous.includes('fortress')) {
      return 'FORTRESS v2 goes deeper into AWS defense: Terraform builds the environment, GuardDuty and CloudTrail provide visibility, and Lambda workflows automate response. It shows Joseph can connect cloud architecture, detection, and action instead of treating them as separate pieces.'
    }
    if (previous.includes('blue-x') || previous.includes('blue x')) {
      return 'BLUE-X is Joseph\'s AI-security project. It takes network data through a trained PyTorch model, serves predictions through Flask, and connects the result to AWS and automated alerts, reaching 99.98% accuracy in its controlled dataset.'
    }
    return 'Absolutely. Which part should I go deeper on: Joseph\'s projects, skills, certifications, experience, or the kind of role he fits best?'
  }

  if (isCasualGreeting(text.trim())) {
    return 'Hey, I\'m PWEZA. How\'s it going?'
  }

  if (includesAny(text, ['cloud security', 'cloud role', 'cloud engineer', 'aws role'])) {
    return 'Joseph is ready for cloud security roles now, especially where AWS, Terraform, detection, and response automation matter. FORTRESS v2 is the proof point: GuardDuty, CloudTrail, WAF, Lambda response workflows, Security Hub, and 20+ AWS resources deployed as code.'
  }

  if (includesAny(text, ['recruit', 'hiring manager', 'should know'])) {
    return 'Recruiters should know Joseph is a builder, not just a certification collector: BLUE SOC proves SOC automation, FORTRESS v2 proves AWS cloud defense, and BLUE-X proves AI threat classification at 99.98% accuracy in a controlled dataset. He is available now, and the fastest contact is kamarajosephallan@gmail.com.'
  }

  if (includesAny(text, ['hire', 'available', 'job', 'role', 'interview', 'contact', 'email'])) {
    return 'Joseph is available now for SOC Analyst, Security Engineer, Cloud Security Engineer, and AI Security Engineer roles. The fastest way to reach him is kamarajosephallan@gmail.com.'
  }

  if (includesAny(text, ['blue soc', 'soc', 'splunk', 'n8n', 'telegram'])) {
    return `${projectLine('blue-soc-p8')} It shows Joseph can connect SIEM alerts, AI triage, analyst review, and notification workflows into one practical SOC automation pipeline.`
  }

  if (includesAny(text, ['fortress', 'aws', 'cloud', 'terraform', 'guardduty', 'lambda'])) {
    return `${projectLine('fortress-v2')} It is one of his clearest cloud security signals because the work is infrastructure-as-code, detection, and response in the same lab.`
  }

  if (includesAny(text, ['blue-x', 'blue x', 'machine learning', 'pytorch', 'ai threat', 'classification'])) {
    return `${projectLine('blue-x')} That project is the best proof of his AI-security direction because it connects packet data, AWS services, a Flask inference API, and automated alerting.`
  }

  if (includesAny(text, ['project', 'built', 'portfolio', 'showcase'])) {
    return `Joseph's strongest projects are BLUE SOC P8, FORTRESS v2, and BLUE-X. Together they show SOC automation, AWS cloud defense, Terraform, GuardDuty, Lambda response workflows, and AI-powered threat classification.`
  }

  if (includesAny(text, ['skill', 'stack', 'tools', 'technology', 'tech'])) {
    return 'His strongest stack is Splunk, Security Onion, AWS GuardDuty, Terraform, Lambda, Python, n8n, Claude/Gemini workflows, Zeek, Suricata, and Cisco networking. He is strongest where security operations, cloud security, automation, and AI meet.'
  }

  if (includesAny(text, ['cert', 'certification', 'security+', 'ccna', 'pentest', 'psaa'])) {
    return 'Joseph has Security+, PenTest+, CCNA, and Practical SOC Analyst Associate, with AWS Security Specialty in progress. That gives him a strong blend of SOC, networking, offensive security, and cloud-security direction.'
  }

  if (includesAny(text, ['experience', 'work history', 'background'])) {
    return 'Joseph currently works in IT support at BYU-Idaho supporting a large Windows environment, and he also leads web security development for ELITECOM Engineers in Sierra Leone. That mix gives him real user-support discipline plus builder-level security experience.'
  }

  if (includesAny(text, ['resume', 'download', 'cv'])) {
    return 'The resume link is in the contact section as Download Resume. If you are hiring, email Joseph directly at kamarajosephallan@gmail.com and mention the role you have in mind.'
  }

  return 'I may have missed what you meant. Say it another way and I\'ll follow you.'
}
