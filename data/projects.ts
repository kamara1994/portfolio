export interface Project {
  id: string
  num: string
  title: string
  subtitle: string
  description: string
  impact: string
  stack: string[]
  github: string
  demo?: string
  featured?: boolean
  screenshot?: string // place in /public/screenshots/
}

export const projects: Project[] = [
  {
    id: 'blue-soc-p8',
    num: '01',
    title: 'BLUE SOC P8',
    subtitle: 'AI-Powered Autonomous Security Operations Center',
    description: 'A fully autonomous AI SOC that ingests security events from Splunk SIEM and Palo Alto firewall, routes them through a Claude LLM pipeline for intelligent threat classification, and auto-fires n8n containment workflows — without human intervention. Built as a production-grade capstone system with real-time dashboarding, phishing detection POC, and insider risk anomaly detection.',
    impact: 'Automated full alert triage → classification → response pipeline. Built AI-driven phishing detection using NLP on email metadata. Reduced simulated tier-1 analyst workload to near-zero for automated event categories.',
    stack: ['Splunk SIEM', 'Palo Alto Firewall', 'n8n Orchestration', 'Claude LLM API', 'Python', 'REST APIs', 'Telegram Bot', 'Linux'],
    github: 'https://github.com/joseph-allan-kamara',
    featured: true,
    screenshot: '/screenshots/blue-soc.png',
  },
  {
    id: 'python-ids',
    num: '02',
    title: 'Python IDS',
    subtitle: 'Intrusion Detection System',
    description: 'Scapy-based IDS that monitors live network traffic in real-time, detecting anomalous patterns including SYN floods, port scanning, ARP spoofing, and protocol anomalies. Generates structured alert logs with automated containment triggers.',
    impact: 'Detects 6+ threat categories. Structured alert output compatible with SIEM ingestion.',
    stack: ['Python', 'Scapy', 'TCP/IP', 'Linux', 'Bash'],
    github: 'https://github.com/joseph-allan-kamara',
    screenshot: '/screenshots/ids.png',
  },
  {
    id: 'vuln-scanner',
    num: '03',
    title: 'CVE Vulnerability Scanner',
    subtitle: 'Port Scanner & Vulnerability Assessment Tool',
    description: 'Python scanner that identifies open ports, enumerates running services, and maps findings to CVEs. Produces structured remediation reports aligned to OWASP standards with MITRE ATT&CK technique mapping.',
    impact: 'Maps discoveries to CVE database. MITRE ATT&CK technique alignment. Automated PDF report generation.',
    stack: ['Python', 'Nmap', 'CVE API', 'MITRE ATT&CK', 'OWASP', 'Bash'],
    github: 'https://github.com/joseph-allan-kamara',
    screenshot: '/screenshots/vuln-scanner.png',
  },
  {
    id: 'blue-v3',
    num: '04',
    title: 'BLUE v3.0',
    subtitle: 'Autonomous AI Career Operating System',
    description: 'Production-scale multi-agent AI system built on n8n, Claude Sonnet, Gemini Flash, and Pinecone vector memory. 6 autonomous workflows covering job hunting, auto-application, recruiter comms, interview prep, and real-time dashboard metrics. Demonstrates applied LLM orchestration at scale.',
    impact: 'Fully autonomous 24/7 operation. Multi-agent LLM orchestration across Claude + Gemini. Pinecone vector memory for context persistence.',
    stack: ['n8n', 'Claude Sonnet API', 'Gemini Flash', 'Pinecone', 'JSONBin', 'Telegram Bot', 'REST APIs'],
    github: 'https://github.com/joseph-allan-kamara',
    screenshot: '/screenshots/blue-v3.png',
  },
  {
    id: 'elitecom',
    num: '05',
    title: 'ELITECOM Web Platform',
    subtitle: 'Secure Web Architecture for Engineering Firm',
    description: 'Designed and developed the full web presence for ELITECOM Engineers Sierra Leone — a multi-sector firm spanning telecom, IT, and civil engineering. Built with Next.js and Tailwind CSS, security-first architecture, and a cinematic dark futuristic aesthetic.',
    impact: 'Full client deliverable shipped to production. Security-first architecture. Serves as live company web presence.',
    stack: ['Next.js', 'Tailwind CSS', 'TypeScript', 'Vercel', 'Security Architecture'],
    github: 'https://github.com/joseph-allan-kamara',
    demo: 'https://elitecomengineers.com',
    screenshot: '/screenshots/elitecom.png',
  },
]
