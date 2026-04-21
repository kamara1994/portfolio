export interface Cert {
  name: string
  issuer: string
  date?: string
  certNum?: string
  status: 'earned' | 'progress'
  credlyUrl?: string
}

export const certs: Cert[] = [
  {
    name: 'Security+',
    issuer: 'CompTIA',
    status: 'earned',
  },
  {
    name: 'CCNA — Certified Network Associate',
    issuer: 'Cisco',
    status: 'earned',
  },
  {
    name: 'Practical SOC Analyst Associate (PSAA)',
    issuer: 'TCM Security',
    date: 'March 26, 2026',
    certNum: '178154778',
    status: 'earned',
  },
  {
    name: 'PenTest+',
    issuer: 'CompTIA',
    status: 'earned',
  },
  {
    name: 'AWS Security Specialty',
    issuer: 'Amazon Web Services',
    status: 'progress',
  },
]

export interface SkillGroup {
  title: string
  skills: string[]
}

export const skillGroups: SkillGroup[] = [
  {
    title: 'Security Operations',
    skills: [
      'Splunk SIEM',
      'Security Onion',
      'Incident Response',
      'Threat Hunting',
      'Alert Triage',
      'Log Analysis',
      'SIEM Rule Writing',
      'Packet Analysis',
      'Network Forensics',
      'Malware Triage',
      'Threat Intelligence',
    ],
  },
  {
    title: 'Cloud Security',
    skills: [
      'AWS GuardDuty',
      'AWS Security Hub',
      'CloudTrail',
      'WAF',
      'Lambda Auto-Remediation',
      'IAM Policy Design',
      'S3 Security',
      'CloudWatch Alarms',
      'Terraform IaC',
      'CIS Benchmarks',
      'VPC Security',
    ],
  },
  {
    title: 'Penetration Testing',
    skills: [
      'Kali Linux',
      'Metasploit',
      'Burp Suite',
      'Nmap',
      'Nessus',
      'John the Ripper',
      'Hashcat',
      'Wireshark',
      'OSINT Techniques',
      'Vulnerability Assessment',
      'Exploit Development',
    ],
  },
  {
    title: 'Network Security',
    skills: [
      'Palo Alto NGFW',
      'FortiGate Firewall',
      'Zeek',
      'Suricata',
      'Scapy',
      'TCP/IP Protocols',
      'IDS/IPS Systems',
      'VPN Configuration',
      'Cisco IOS',
      'Packet Capture',
      'Traffic Analysis',
    ],
  },
  {
    title: 'Enterprise Networking',
    skills: [
      'Cisco CCNA',
      'OSPF Routing',
      'VRRP',
      'LACP EtherChannel',
      'VLAN Segmentation',
      'VTP',
      'SSH Hardening',
      'ACL Design',
      'DHCP Configuration',
      'NAT/PAT',
      'STP',
    ],
  },
  {
    title: 'AI & Automation',
    skills: [
      'Claude LLM API',
      'n8n Multi-Agent',
      'PyTorch',
      'Prompt Engineering',
      'AI Workflow Design',
      'Pinecone Vector DB',
      'Gemini Flash',
      'AI Security Automation',
      'Autonomous Agents',
      'RAG Pipelines',
    ],
  },
  {
    title: 'Scripting & Dev',
    skills: [
      'Python',
      'Bash / PowerShell',
      'REST APIs',
      'Next.js / React',
      'TypeScript',
      'Linux Admin',
      'Flask',
      'Docker',
      'Git / GitHub',
      'Terraform',
      'AWS CLI',
    ],
  },
  {
    title: 'Frameworks',
    skills: [
      'MITRE ATT&CK',
      'OWASP Top 10',
      'NIST CSF',
      'Kill Chain',
      'Diamond Model',
      'Zero Trust',
      'GRC Fundamentals',
      'CIS Benchmarks',
      'ISO 27001 Basics',
    ],
  },
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
      'Maintained data integrity and cross-team communication across mentoring program workflows',
    ],
  },
]