/**
 * Skills shown on the site, each backed by evidence: a project it was built in, a
 * certification that covers it, or both. Skills with no evidence yet are listed in
 * UNCONFIRMED and are not shown until Joseph confirms them.
 */
export type Skill = { name: string; what: string; projects?: string[]; certs?: string[] }
export type SkillCategory = { id: string; title: string; summary: string; icon: string; skills: Skill[] }

export const PROJECT_NAMES: Record<string, string> = {
  'blue-soc-p8': 'BLUE SOC',
  'fortress-v2': 'FORTRESS v2',
  'blue-x': 'BLUE-X',
  'pweza-voice-agent': 'PWEZA',
  'enterprise-networking': 'Enterprise Network',
  elitecom: 'ELITECOM',
  'pandie-foundation': 'Pandie Foundation',
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'secops', title: 'Security Operations', icon: 'shield',
    summary: 'Detecting, triaging, and responding to alerts with a human in the loop.',
    skills: [
      { name: 'Splunk SIEM', what: 'Alert ingestion and webhooks that feed the AI triage pipeline.', projects: ['blue-soc-p8'], certs: ['TCM PSAA'] },
      { name: 'Alert Triage', what: 'AI-assisted severity classification, reviewed by an analyst.', projects: ['blue-soc-p8'], certs: ['TCM PSAA'] },
      { name: 'Incident Response', what: 'Response recommendations with analyst-approved containment.', projects: ['blue-soc-p8'], certs: ['TCM PSAA'] },
      { name: 'SIEM Detection Rules', what: 'Detection rules that trigger alerts into the automation pipeline.', projects: ['blue-soc-p8'] },
      { name: 'Log Analysis', what: 'Normalizing SIEM events and shipping network logs to S3.', projects: ['blue-soc-p8', 'blue-x'], certs: ['TCM PSAA'] },
      { name: 'Phishing Analysis', what: 'NLP-assisted phishing detection on email metadata.', projects: ['blue-soc-p8'], certs: ['TCM PSAA'] },
      { name: 'Packet Analysis', what: 'Network traffic analysis for SOC investigations.', certs: ['TCM PSAA'] },
      { name: 'Threat Intelligence', what: 'Enriching investigations with threat intel sources.', certs: ['TCM PSAA'] },
    ],
  },
  {
    id: 'cloud', title: 'Cloud Security', icon: 'cloud',
    summary: 'AWS security monitoring, deployed as code and verified with evidence.',
    skills: [
      { name: 'Terraform IaC', what: 'Deployed an isolated five-resource AWS lab as code.', projects: ['fortress-v2', 'blue-x'] },
      { name: 'CloudWatch Logs', what: 'Ingested six synthetic JSON security events into a log group.', projects: ['fortress-v2'] },
      { name: 'Metric Filters', what: 'JSON metric filter turning matching events into a security metric.', projects: ['fortress-v2'] },
      { name: 'CloudWatch Alarms', what: 'Threshold alarm with an observed OK-to-ALARM transition.', projects: ['fortress-v2'] },
      { name: 'Amazon SNS', what: 'Alarm action to an SNS topic with confirmed email delivery.', projects: ['fortress-v2'] },
      { name: 'AWS CLI', what: 'Queried logs, metric statistics, and alarm history.', projects: ['fortress-v2'] },
      { name: 'AWS Lambda', what: 'Serverless functions in the threat classification pipeline.', projects: ['blue-x'] },
    ],
  },
  {
    id: 'network', title: 'Network Security', icon: 'radar',
    summary: 'Watching the wire and controlling what crosses it.',
    skills: [
      { name: 'Zeek', what: 'Live network monitoring feeding the threat classifier.', projects: ['blue-x'] },
      { name: 'Suricata IDS', what: 'Intrusion detection alongside Zeek for traffic capture.', projects: ['blue-x'] },
      { name: 'Palo Alto NGFW', what: 'Response workflow for analyst-approved block rules.', projects: ['blue-soc-p8'] },
      { name: 'Traffic Classification', what: 'Labeling network flows into five attack categories.', projects: ['blue-x'] },
      { name: 'TCP/IP', what: 'Protocol fundamentals behind every investigation.', certs: ['CCNA', 'Security+'] },
      { name: 'Port Security and ACLs', what: 'Sticky MAC port security and access control lists.', projects: ['enterprise-networking'], certs: ['CCNA'] },
    ],
  },
  {
    id: 'networking', title: 'Enterprise Networking', icon: 'network',
    summary: 'A full Cisco branch network: routing, redundancy, and switching.',
    skills: [
      { name: 'OSPF Routing', what: 'Dynamic routing between branch and HQ across two areas.', projects: ['enterprise-networking'], certs: ['CCNA'] },
      { name: 'VRRP Redundancy', what: 'Gateway failover across six VLANs.', projects: ['enterprise-networking'], certs: ['CCNA'] },
      { name: 'LACP EtherChannel', what: 'Link aggregation between multilayer switches.', projects: ['enterprise-networking'], certs: ['CCNA'] },
      { name: 'VLANs and VTP', what: '802.1Q trunking with VTP for VLAN consistency.', projects: ['enterprise-networking'], certs: ['CCNA'] },
      { name: 'SSH Hardening', what: 'SSH v2 management access on every device.', projects: ['enterprise-networking'], certs: ['CCNA'] },
      { name: 'DHCP and STP', what: 'Address assignment and loop prevention.', projects: ['enterprise-networking'], certs: ['CCNA'] },
      { name: 'NAT/PAT', what: 'Address translation for internet access.', certs: ['CCNA'] },
    ],
  },
  {
    id: 'offense', title: 'Offensive Security', icon: 'target',
    summary: 'Thinking like the attacker to test defenses.',
    skills: [
      { name: 'Attack Simulation', what: 'Planning and running attack scenarios to test defenses.', certs: ['PenTest+'] },
      { name: 'Nmap', what: 'Discovery and port scanning.', certs: ['PenTest+'] },
      { name: 'Metasploit', what: 'Exploitation framework.', certs: ['PenTest+'] },
      { name: 'Burp Suite', what: 'Web application testing.', certs: ['PenTest+'] },
      { name: 'Vulnerability Assessment', what: 'Scanning, prioritizing, and reporting findings.', certs: ['PenTest+'] },
      { name: 'Password Attacks', what: 'Cracking with Hashcat and John the Ripper.', certs: ['PenTest+'] },
    ],
  },
  {
    id: 'ai', title: 'AI and Automation', icon: 'spark',
    summary: 'Using AI where it removes analyst toil.',
    skills: [
      { name: 'Claude LLM API', what: 'Threat classification and fallback reasoning.', projects: ['blue-soc-p8', 'pweza-voice-agent'] },
      { name: 'PyTorch', what: 'Neural network trained on 50,000 labeled network flows.', projects: ['blue-x'] },
      { name: 'n8n Orchestration', what: 'Workflows that route alerts and send Telegram summaries.', projects: ['blue-soc-p8', 'blue-x'] },
      { name: 'Multi-Model Routing', what: 'Groq, Gemini, and Claude with fallbacks and rate limits.', projects: ['pweza-voice-agent'] },
      { name: 'Voice AI', what: 'Speech recognition, turn detection, and neural text-to-speech.', projects: ['pweza-voice-agent'] },
    ],
  },
  {
    id: 'dev', title: 'Development', icon: 'code',
    summary: 'Building the tools, not just using them.',
    skills: [
      { name: 'Python', what: 'Automation, model training, and APIs.', projects: ['blue-soc-p8', 'blue-x'] },
      { name: 'TypeScript and Next.js', what: 'Production sites and this portfolio.', projects: ['pweza-voice-agent', 'elitecom', 'pandie-foundation'] },
      { name: 'REST APIs', what: 'Integrations between SIEM, AI, and alerting.', projects: ['blue-soc-p8', 'pweza-voice-agent'] },
      { name: 'Flask', what: 'Serving the PyTorch model as an API.', projects: ['blue-x'] },
      { name: 'Docker and Linux', what: 'Running the lab services.', projects: ['blue-soc-p8'] },
      { name: 'Web Security', what: 'Security headers, HTTPS enforcement, and XSS protection.', projects: ['elitecom'] },
    ],
  },
  {
    id: 'frameworks', title: 'Frameworks', icon: 'book',
    summary: 'The shared language of security teams.',
    skills: [
      { name: 'NIST CSF', what: 'Security program structure and controls.', certs: ['Security+'] },
      { name: 'Zero Trust', what: 'Never trust, always verify architecture.', certs: ['Security+'] },
      { name: 'GRC Fundamentals', what: 'Governance, risk, and compliance.', certs: ['Security+'] },
      { name: 'MITRE ATT&CK', what: 'Mapping adversary techniques during triage.', certs: ['TCM PSAA'] },
            { name: 'OWASP Top 10', what: 'Common web application risks.', certs: ['PenTest+'] },
    ],
  },
]

/** Listed on the old site but not yet tied to a project or certification. Hidden until confirmed. */
export const UNCONFIRMED = [
  'Security Onion', 'Threat Hunting', 'Malware Triage', 'Network Forensics', 'FortiGate Firewall', 'Scapy',
  'VPN Configuration', 'Exploit Development', 'OSINT Techniques', 'Pinecone Vector DB', 'RAG Pipelines',
  'Autonomous Agents', 'Bash', 'AWS GuardDuty', 'AWS WAF', 'AWS Security Hub', 'CloudTrail', 'Kill Chain', 'Diamond Model', 'ISO 27001 Basics',
]
