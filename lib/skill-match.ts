/**
 * Job-posting match for the Skills section.
 *
 * A recruiter pastes a job posting; each skill listed on the site is matched by the
 * words a posting would use for it. Matching is keyword-based and only ever returns
 * skills that already appear on the site, so it never adds a claim.
 */
const KEYWORDS: Record<string, string[]> = {
  'Splunk SIEM': ['splunk', 'siem'],
  'Alert Triage': ['triage', 'alert monitoring', 'monitor alerts', 'security alerts', 'alert analysis'],
  'Incident Response': ['incident response', 'incident handling', 'incident management', 'respond to incidents', 'security incidents'],
  'SIEM Detection Rules': ['detection rule', 'detection rules', 'detection engineering', 'correlation rule', 'correlation rules', 'siem rules'],
  'Log Analysis': ['log analysis', 'analyze logs', 'log review', 'log management', 'logs'],
  'Phishing Analysis': ['phishing', 'email security'],
  'Packet Analysis': ['packet analysis', 'packet capture', 'pcap', 'network traffic'],
  'Security Onion': ['security onion'],
  Wireshark: ['wireshark', 'tcpdump'],
  'Threat Intelligence': ['threat intelligence', 'threat intel', 'ioc', 'iocs', 'indicators of compromise', 'threat hunting'],
  'Terraform IaC': ['terraform', 'infrastructure as code', 'iac'],
  'CloudWatch Logs': ['cloudwatch'],
  'Metric Filters': ['metric filter', 'metric filters'],
  'CloudWatch Alarms': ['cloudwatch alarm', 'cloudwatch alarms'],
  'Amazon SNS': ['sns', 'simple notification service'],
  'AWS CLI': ['aws cli', 'aws'],
  'AWS Lambda': ['lambda', 'serverless'],
  Zeek: ['zeek'],
  'Suricata IDS': ['suricata', 'ids', 'ips', 'intrusion detection', 'intrusion prevention'],
  'Palo Alto NGFW': ['palo alto', 'firewall', 'firewalls', 'ngfw'],
  'Traffic Classification': ['traffic analysis', 'traffic classification', 'network monitoring'],
  'TCP/IP': ['tcp/ip', 'tcp', 'osi model', 'networking fundamentals'],
  'Port Security and ACLs': ['acl', 'acls', 'access control list', 'access control lists', 'port security'],
  'OSPF Routing': ['ospf', 'routing'],
  'VRRP Redundancy': ['vrrp', 'hsrp', 'redundancy', 'high availability'],
  'LACP EtherChannel': ['etherchannel', 'lacp', 'link aggregation'],
  'VLANs and VTP': ['vlan', 'vlans', 'switching'],
  'SSH Hardening': ['ssh', 'hardening', 'system hardening'],
  'DHCP and STP': ['dhcp', 'spanning tree', 'stp'],
  'NAT/PAT': ['nat', 'network address translation'],
  'Attack Simulation': ['penetration test', 'penetration testing', 'pen test', 'pentest', 'pentesting', 'red team', 'attack simulation', 'adversary emulation'],
  Nmap: ['nmap', 'port scanning'],
  Metasploit: ['metasploit'],
  'Burp Suite': ['burp', 'burp suite', 'web application testing'],
  'Vulnerability Assessment': ['vulnerability', 'vulnerabilities', 'nessus', 'qualys', 'vulnerability management', 'vulnerability scanning'],
  'Password Attacks': ['password cracking', 'hashcat', 'john the ripper'],
  'Claude LLM API': ['llm', 'llms', 'large language model', 'large language models', 'claude', 'generative ai', 'genai', 'anthropic', 'openai'],
  PyTorch: ['pytorch', 'machine learning', 'deep learning', 'neural network', 'neural networks'],
  'n8n Orchestration': ['n8n', 'soar', 'security automation', 'workflow automation', 'automation'],
  'Multi-Model Routing': ['model routing', 'ai models', 'multiple llms'],
  'Voice AI': ['voice ai', 'speech recognition', 'text to speech', 'voice assistant'],
  Python: ['python', 'scripting'],
  'TypeScript and Next.js': ['typescript', 'javascript', 'next.js', 'nextjs', 'react', 'node.js', 'nodejs'],
  'REST APIs': ['rest api', 'rest apis', 'restful', 'api', 'apis'],
  Flask: ['flask'],
  'Docker and Linux': ['docker', 'linux', 'containers', 'bash', 'unix'],
  'Web Security': ['web security', 'application security', 'appsec', 'xss', 'sql injection'],
  'NIST CSF': ['nist', 'nist csf', 'cybersecurity framework'],
  'Zero Trust': ['zero trust'],
  'GRC Fundamentals': ['grc', 'governance', 'compliance', 'risk management', 'risk assessment'],
  'MITRE ATT&CK': ['mitre', 'att&ck', 'mitre attack'],
  'OWASP Top 10': ['owasp'],
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const PATTERNS = Object.fromEntries(
  Object.entries(KEYWORDS).map(([skill, words]) => [
    skill,
    words.map((w) => ({ w, re: new RegExp(`(?<![a-z0-9])${esc(w)}(?![a-z0-9])`, 'i') })),
  ]),
)

export type SkillMatch = { skill: string; words: string[] }

/** Skills whose words appear in the posting, strongest (most distinct words) first. */
export function matchPosting(text: string): SkillMatch[] {
  const t = text.toLowerCase()
  if (t.trim().length < 20) return []
  const out: SkillMatch[] = []
  for (const [skill, pats] of Object.entries(PATTERNS)) {
    const words = pats.filter((p) => p.re.test(t)).map((p) => p.w)
    if (words.length) out.push({ skill, words })
  }
  return out.sort((a, b) => b.words.length - a.words.length)
}
