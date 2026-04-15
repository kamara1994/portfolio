export interface Cert {
  name: string
  issuer: string
  date?: string
  certNum?: string
  status: 'earned' | 'progress'
  credlyUrl?: string
}

export const certs: Cert[] = [
  { name: 'Security+', issuer: 'CompTIA', status: 'earned' },
  { name: 'CCNA — Certified Network Associate', issuer: 'Cisco', status: 'earned' },
  { name: 'Practical SOC Analyst Associate (PSAA)', issuer: 'TCM Security', date: 'March 26, 2026', certNum: '178154778', status: 'earned' },
  { name: 'PenTest+', issuer: 'CompTIA', status: 'progress' },
]

export interface SkillGroup {
  title: string
  skills: string[]
}

export const skillGroups: SkillGroup[] = [
  { title: 'Security Operations', skills: ['Splunk SIEM', 'Security Onion', 'Incident Response', 'Threat Hunting', 'Alert Triage', 'Log Analysis'] },
  { title: 'AI & Automation', skills: ['Claude LLM API', 'n8n Multi-Agent', 'Prompt Engineering', 'AI Workflow Design', 'Pinecone Vector DB', 'Gemini Flash'] },
  { title: 'Network Security', skills: ['Palo Alto Firewall', 'Wireshark', 'Nmap', 'TCP/IP Protocols', 'IDS/IPS Systems', 'Scapy'] },
  { title: 'Scripting & Dev', skills: ['Python', 'Bash / PowerShell', 'REST APIs', 'Next.js / React', 'TypeScript', 'Linux Admin'] },
  { title: 'Frameworks', skills: ['MITRE ATT&CK', 'OWASP Top 10', 'NIST CSF', 'Vulnerability Assessment', 'GRC Fundamentals', 'Zero Trust'] },
  { title: 'Tools', skills: ['Metasploit', 'Active Directory', 'Windows Server 2016', 'Telegram Bot API', 'Git / GitHub', 'Docker (Basics)'] },
]

export interface Experience {
  company: string
  role: string
  dates: string
  bullets: string[]
  current?: boolean
}

export const experiences: Experience[] = [
  {
    company: 'BYU-Idaho IT Help Desk',
    role: 'IT Support Technician',
    dates: '2025 — Present',
    current: true,
    bullets: [
      'Administered endpoint systems across enterprise Windows 10 environment supporting 10,000+ users',
      'Resolved 20+ technical support tickets weekly with 95%+ first-contact resolution rate',
      'Identified and escalated security-adjacent incidents including unauthorized access attempts and endpoint anomalies',
      'Maintained technical documentation and generated incident reports aligned with IT compliance requirements',
    ],
  },
  {
    company: 'ELITECOM Engineers Sierra Leone',
    role: 'Web Security Developer & Technology Lead',
    dates: '2024 — Present',
    current: true,
    bullets: [
      'Designed and developed the full company web platform using Next.js and Tailwind CSS with security-first architecture',
      'Defined cybersecurity guidelines and security controls for the organization\'s digital operations',
      'Managed secure deployment practices and ongoing web infrastructure for a multi-sector engineering firm',
    ],
  },
  {
    company: 'Heber J. Grant Peer Mentoring Program — BYU-Idaho',
    role: 'Project Coordinator',
    dates: '2024 — 2025',
    bullets: [
      'Coordinated program operations, scheduling, and compliance documentation across a campus-wide initiative',
      'Maintained data integrity and cross-team communication across mentoring workflows',
    ],
  },
]
