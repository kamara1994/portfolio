'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Flagship projects ────────────────────────────────────────────────────────
const flagships = [
  {
    id: 'blue-soc-p8',
    num: '01',
    title: 'BLUE SOC',
    accent: 'P8',
    subtitle: 'AI-Assisted Security Operations Center — Controlled Lab',
    status: ['LAB-VALIDATED', 'LIVE DEMO'],
    color: '#00d4ff',
    screenshot: '/screenshots/blue-soc.png',
    demo: 'https://blue-dashboard-ten.vercel.app',
    github: 'https://github.com/kamara1994/bluesoc',
    description: 'AI-assisted SOC automation prototype connecting Splunk SIEM, n8n orchestration, Claude LLM triage, Palo Alto response workflows, and real-time Telegram notifications. Built in a controlled lab environment with analyst-reviewed containment design.',
    stack: ['Splunk SIEM', 'Palo Alto', 'n8n', 'Claude LLM', 'Python', 'Telegram', 'Docker'],
    archNodes: [
      { id: 'splunk', label: 'Splunk SIEM', sublabel: 'Log Ingestion', color: '#00d4ff', icon: '📊', detail: 'Ingests logs from firewalls, endpoints, and network sensors. Normalizes events and triggers alerts on detection rules.', tools: ['Splunk Enterprise', 'Custom SPL queries', 'Alert thresholds'] },
      { id: 'n8n', label: 'n8n', sublabel: 'Orchestration', color: '#818cf8', icon: '⚡', detail: 'Receives webhook triggers from Splunk. Routes events through the AI classification pipeline and manages the response workflow.', tools: ['n8n workflows', 'Webhook triggers', 'API integrations'] },
      { id: 'claude', label: 'Claude LLM', sublabel: 'AI Triage', color: '#a855f7', icon: '🤖', detail: 'Classifies threat severity, extracts IOCs, and generates response recommendations. Analyst review required for containment.', tools: ['Claude API', 'Structured prompts', 'Threat classification'] },
      { id: 'paloalto', label: 'Palo Alto', sublabel: 'Firewall', color: '#00f5d4', icon: '🛡️', detail: 'Receives analyst-approved containment actions. Block rules executed only after analyst review in the lab design.', tools: ['PAN-OS API', 'Block rules', 'Analyst approval'] },
      { id: 'telegram', label: 'Telegram', sublabel: 'Alerts', color: '#38bdf8', icon: '📱', detail: 'Delivers real-time alert summaries with full context — severity, IOCs, AI classification, and recommended actions.', tools: ['Telegram Bot API', 'Structured alerts', 'Real-time delivery'] },
      { id: 'dashboard', label: 'Dashboard', sublabel: 'Visualization', color: '#f59e0b', icon: '📈', detail: 'Next.js dashboard showing live threat metrics, alert history, pipeline status, and response actions.', tools: ['Next.js', 'Real-time metrics', 'Threat visualization'] },
    ],
    decisions: [
      { decision: 'Splunk for alert aggregation', why: 'Industry-standard SIEM with powerful SPL and flexible alerting thresholds', tradeoff: 'Complex to scale without licensing; requires well-structured log ingestion' },
      { decision: 'n8n for orchestration', why: 'Fast API integration, visual workflow builder, free self-hosted option', tradeoff: 'Production use needs stronger governance, monitoring, and failure handling' },
      { decision: 'Claude LLM for triage', why: 'Strong reasoning for threat classification and structured output for automation', tradeoff: 'API dependency; latency adds time to pipeline; outputs need analyst validation' },
      { decision: 'Analyst-reviewed containment', why: 'Reduces false-positive blocking risk; models responsible automation design', tradeoff: 'Slower than unrestricted auto-block; requires analyst availability' },
    ],
    evidence: [
      { label: 'System Architecture Diagram', status: 'available' },
      { label: 'Dashboard Screenshot', status: 'available' },
      { label: 'Sanitized Splunk Alert Example', status: 'available' },
      { label: 'n8n Workflow Screenshot', status: 'available' },
      { label: 'Palo Alto Response Design', status: 'available' },
      { label: 'Telegram Alert Screenshot', status: 'available' },
      { label: 'Incident Replay Lab', status: 'coming-soon' },
      { label: 'GitHub Repository', status: 'available', link: 'https://github.com/kamara1994/bluesoc' },
    ],
    production: [
      'Role-based access control for analyst actions',
      'Audit logging for every response decision',
      'Firewall allowlists and rollback controls',
      'Human approval thresholds for containment',
      'Secrets management for API credentials',
      'Alert failure handling and dead-letter queues',
      'Data privacy and retention policies',
      'Approved enterprise communication tooling',
    ],
  },
  {
    id: 'fortress-v2',
    num: '09',
    title: 'FORTRESS',
    accent: 'v2',
    subtitle: 'AWS Cloud Security Lab — Terraform Deployed',
    status: ['LAB-VALIDATED'],
    color: '#00f5d4',
    screenshot: '/screenshots/fortress.png',
    demo: null,
    github: 'https://github.com/kamara1994/fortress-v2',
    description: 'A cloud security monitoring and incident response lab built on AWS using Terraform. Deploys GuardDuty, CloudTrail, WAF, Lambda auto-remediation, and Security Hub with CIS benchmark scoring. Validated with 5 simulated attack scenarios.',
    stack: ['AWS', 'Terraform', 'GuardDuty', 'Lambda', 'CloudTrail', 'WAF', 'Security Hub', 'CloudWatch', 'SNS'],
    archNodes: [
      { id: 'terraform', label: 'Terraform', sublabel: 'IaC Deployment', color: '#00f5d4', icon: '🏗️', detail: 'Deploys entire AWS infrastructure as code — VPC, subnets, IGW, route tables, security groups, and all security services.', tools: ['Terraform modules', '6 custom modules', '20+ resources'] },
      { id: 'guardduty', label: 'GuardDuty', sublabel: 'Threat Detection', color: '#00d4ff', icon: '👁️', detail: 'Monitors for malicious activity and unauthorized behavior. Generates findings on threat detection for downstream processing.', tools: ['AWS GuardDuty', 'CloudWatch Events', 'Finding types'] },
      { id: 'cloudtrail', label: 'CloudTrail', sublabel: 'Audit Logging', color: '#818cf8', icon: '📋', detail: 'Logs all API calls and account activity. Stores to S3 with CloudWatch Logs integration for real-time monitoring.', tools: ['CloudTrail', 'S3', 'CloudWatch Logs'] },
      { id: 'lambda', label: 'Lambda', sublabel: 'Auto-Remediation', color: '#f59e0b', icon: '⚡', detail: 'Triggered by GuardDuty findings via CloudWatch Events. Generates EC2 isolation recommendations for analyst review.', tools: ['AWS Lambda', 'Python', 'EC2 isolation'] },
      { id: 'waf', label: 'WAF', sublabel: 'Web Protection', color: '#a855f7', icon: '🛡️', detail: 'Blocks SQL injection, rate limiting, and common web attacks. Managed rule groups with custom rules.', tools: ['AWS WAF', 'Managed rules', 'Rate limiting'] },
      { id: 'sns', label: 'SNS', sublabel: 'Alerting', color: '#38bdf8', icon: '🔔', detail: 'Real-time email alerts on GuardDuty findings and CloudWatch alarms. Integrated with the remediation pipeline.', tools: ['AWS SNS', 'Email alerts', 'Finding notifications'] },
    ],
    decisions: [
      { decision: 'Terraform for all infrastructure', why: 'Demonstrates IaC skills; reproducible, version-controlled deployments; enterprise standard', tradeoff: 'Higher initial complexity; state management requires careful handling' },
      { decision: '5 simulated attack scenarios', why: 'Validates detection works end-to-end; proves understanding of real threat vectors', tradeoff: 'Controlled lab — results may differ in real AWS accounts with different configurations' },
      { decision: 'Lambda for remediation', why: 'Serverless, event-driven, cost-effective; integrates natively with GuardDuty findings', tradeoff: 'Cold start latency; production needs dead-letter queues and retry logic' },
      { decision: 'Security Hub for compliance', why: 'CIS benchmark scoring gives objective security posture measurement', tradeoff: 'Findings require triage; not all findings indicate active threats' },
    ],
    evidence: [
      { label: 'Terraform Module Structure', status: 'available' },
      { label: 'GuardDuty Findings Screenshot', status: 'available' },
      { label: 'Attack Simulation Results', status: 'available' },
      { label: 'Lambda Remediation Code', status: 'available' },
      { label: 'Security Hub CIS Score', status: 'available' },
      { label: 'GitHub Repository', status: 'available', link: 'https://github.com/kamara1994/fortress-v2' },
      { label: 'Full Case Study', status: 'coming-soon' },
    ],
    production: [
      'Multi-account AWS Organizations structure',
      'SCPs to prevent security control bypass',
      'Centralized logging account with immutable logs',
      'Automated finding deduplication and prioritization',
      'Rollback procedures for Lambda remediation',
      'IR runbooks mapped to GuardDuty finding types',
      'Cost monitoring and Lambda timeout controls',
      'Peer review of all Terraform changes',
    ],
  },
  {
    id: 'blue-x',
    num: '10',
    title: 'BLUE-X',
    accent: '',
    subtitle: 'AI-Powered Network Threat Classification Platform',
    status: ['LAB-VALIDATED'],
    color: '#a855f7',
    screenshot: '/screenshots/blue-x.png',
    demo: null,
    github: 'https://github.com/kamara1994/blue-x',
    description: 'An AI-powered security platform combining live network monitoring with AWS cloud automation and a custom PyTorch neural network trained to classify network traffic. 99.98% accuracy on a controlled labeled dataset of 50,000 samples — methodology documented.',
    stack: ['PyTorch', 'AWS', 'Zeek', 'Suricata', 'Lambda', 'DynamoDB', 'Flask', 'n8n', 'Terraform', 'Python'],
    archNodes: [
      { id: 'zeek', label: 'Zeek', sublabel: 'Traffic Capture', color: '#a855f7', icon: '🔍', detail: 'Captures live network traffic and generates structured JSON logs for each connection, DNS query, and protocol event.', tools: ['Zeek', 'Suricata', 'JSON logs'] },
      { id: 's3', label: 'AWS S3', sublabel: 'Log Storage', color: '#f59e0b', icon: '🗄️', detail: 'Stores log files organized by date and hour. Triggers Lambda on new file uploads for real-time processing.', tools: ['AWS S3', 'Event triggers', 'Log organization'] },
      { id: 'pytorch', label: 'PyTorch NN', sublabel: 'Classification', color: '#00d4ff', icon: '🧠', detail: 'Feedforward neural network trained on 50,000 labeled network flows. Classifies DDoS, BruteForce, PortScan, Botnet, and BENIGN traffic. 99.98% accuracy on held-out test split.', tools: ['PyTorch', '50k samples', '5 attack classes'] },
      { id: 'flask', label: 'Flask API', sublabel: 'Inference', color: '#00f5d4', icon: '⚡', detail: 'Wraps the PyTorch model as a REST API endpoint. Accepts raw log features and returns classification with confidence score.', tools: ['Flask', 'REST API', 'Real-time inference'] },
      { id: 'dynamo', label: 'DynamoDB', sublabel: 'Findings Store', color: '#818cf8', icon: '💾', detail: 'Stores classified findings from the model. API Gateway exposes findings to the dashboard and n8n automation.', tools: ['DynamoDB', 'API Gateway', 'Findings table'] },
      { id: 'n8n', label: 'n8n + Telegram', sublabel: 'Alerting', color: '#38bdf8', icon: '📱', detail: 'Polls DynamoDB for new findings. Sends structured Telegram alerts with AI analysis summary and recommended action.', tools: ['n8n', 'Telegram Bot', 'Structured alerts'] },
    ],
    decisions: [
      { decision: 'PyTorch feedforward network', why: 'Full control over architecture; demonstrates ML from scratch vs using AutoML', tradeoff: 'More engineering effort; requires dataset preprocessing and hyperparameter tuning' },
      { decision: '50,000 labeled samples', why: 'Large enough for meaningful model training and evaluation with held-out test split', tradeoff: 'Controlled dataset — real-world traffic distribution may differ significantly' },
      { decision: 'Flask for inference API', why: 'Simple, fast, easy to deploy; wraps PyTorch model cleanly', tradeoff: 'Not production-scale; would need FastAPI, load balancing, and model versioning for enterprise' },
      { decision: 'Zeek over pure PCAP', why: 'Generates structured application-layer logs; much easier to process than raw packets', tradeoff: 'Loses some packet-level detail; Zeek tuning required for accurate protocol parsing' },
    ],
    evidence: [
      { label: 'PyTorch Model Architecture', status: 'available' },
      { label: 'Training Dataset Details', status: 'available' },
      { label: 'Accuracy Evaluation Methodology', status: 'available' },
      { label: 'Confusion Matrix', status: 'available' },
      { label: 'Flask API Endpoint Code', status: 'available' },
      { label: 'Zeek Log Pipeline', status: 'available' },
      { label: 'GitHub Repository', status: 'available', link: 'https://github.com/kamara1994/blue-x' },
      { label: 'Full Case Study', status: 'coming-soon' },
    ],
    production: [
      'Model versioning and A/B testing framework',
      'Retraining pipeline on new traffic samples',
      'Drift detection for model degradation',
      'Low-latency inference with GPU support',
      'False positive review and feedback loop',
      'Explainability layer for analyst trust',
      'Integration with enterprise SIEM',
      'Security controls on model API endpoints',
    ],
  },
]

type ActiveTab = 'architecture' | 'evidence' | 'decisions' | 'production'

export default function BlueSocSpotlight() {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [direction, setDirection]   = useState(1)
  const [activeNode, setActiveNode] = useState<any>(null)
  const [activeTab, setActiveTab]   = useState<ActiveTab>('architecture')

  const project = flagships[currentIdx]

  const navigate = (dir: number) => {
    setDirection(dir)
    setActiveNode(null)
    setActiveTab('architecture')
    setCurrentIdx(i => (i + dir + flagships.length) % flagships.length)
  }

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: 'architecture', label: 'Architecture' },
    { id: 'evidence',     label: 'Evidence Vault' },
    { id: 'decisions',    label: 'Decision Log' },
    { id: 'production',   label: 'Production Readiness' },
  ]

  return (
    <section className="px-6 py-20 border-t border-b border-[rgba(0,212,255,0.08)]"
      style={{ background: 'linear-gradient(180deg, rgba(0,212,255,0.02) 0%, transparent 100%)' }}>
      <div className="max-w-6xl mx-auto">

        {/* Section label */}
        <div className="flex items-center gap-3 font-mono text-[10px] text-neon tracking-[4px] uppercase mb-6">
          <span className="w-8 h-px bg-neon" />
          Flagship Projects
          <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
        </div>

        {/* Project navigation dots */}
        <div className="flex items-center gap-3 mb-8">
          {flagships.map((f, i) => (
            <button
              key={f.id}
              onClick={() => { setDirection(i > currentIdx ? 1 : -1); setActiveNode(null); setActiveTab('architecture'); setCurrentIdx(i) }}
              className="flex items-center gap-2 group"
            >
              <span className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentIdx ? 'scale-125' : 'opacity-40 hover:opacity-70'}`}
                style={{ background: i === currentIdx ? f.color : '#00d4ff' }} />
              <span className={`font-mono text-[9px] tracking-[2px] uppercase transition-all duration-300 ${i === currentIdx ? 'opacity-100' : 'opacity-30 group-hover:opacity-60'}`}
                style={{ color: i === currentIdx ? f.color : '#00d4ff' }}>
                {f.title}{f.accent ? ` ${f.accent}` : ''}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={project.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header row */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
              <div>
                <h2 className="font-orbitron font-black text-[clamp(32px,5vw,56px)] leading-none text-[#e2eaff] mb-2">
                  {project.title}{' '}
                  {project.accent && <span style={{ color: project.color }}>{project.accent}</span>}
                </h2>
                <p className="font-mono text-[12px] text-muted max-w-2xl leading-relaxed">
                  {project.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                {project.status.map(s => (
                  <span key={s} className="font-mono text-[9px] px-3 py-1.5 border flex items-center gap-2"
                    style={{ borderColor: `${project.color}60`, color: project.color }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: project.color }} />
                    {s}
                  </span>
                ))}
                {project.demo && (
                  <a href={project.demo} target="_blank"
                    className="font-mono text-[9px] px-4 py-1.5 transition-colors"
                    style={{ background: project.color, color: '#020818' }}>
                    View Demo →
                  </a>
                )}
                <a href={project.github} target="_blank"
                  className="font-mono text-[9px] px-4 py-1.5 border transition-colors hover:opacity-80"
                  style={{ borderColor: `${project.color}50`, color: project.color }}>
                  GitHub ↗
                </a>
              </div>
            </div>

            {/* Stack pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {project.stack.map(s => (
                <span key={s} className="font-mono text-[9px] px-2.5 py-1 border border-[rgba(0,212,255,0.12)] text-muted">
                  {s}
                </span>
              ))}
            </div>

            {/* Screenshot */}
            <div className="relative mb-8 border border-[rgba(0,212,255,0.15)] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[rgba(0,212,255,0.1)]"
                style={{ background: 'rgba(0,212,255,0.03)' }}>
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="font-mono text-[10px] text-muted ml-2">{project.title} — portfolio.josephkamara.vercel.app</span>
                {project.demo && (
                  <span className="ml-auto flex items-center gap-1.5 font-mono text-[9px] text-neon">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />LIVE
                  </span>
                )}
              </div>
              <div className="relative w-full h-64 bg-[#010c1e] overflow-hidden">
                <img src={project.screenshot} alt={`${project.title} screenshot`}
                  className="w-full h-full object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#010c1e] via-transparent to-transparent opacity-60" />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-0 mb-6 border border-[rgba(0,212,255,0.15)] w-fit">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => { setActiveTab(tab.id); setActiveNode(null) }}
                  className={`font-mono text-[10px] tracking-[2px] uppercase px-5 py-2.5 border-r border-[rgba(0,212,255,0.15)] last:border-r-0 transition-all duration-200 ${
                    activeTab === tab.id ? 'text-cyan bg-[rgba(0,212,255,0.08)]' : 'text-muted hover:text-cyan'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">

              {/* ARCHITECTURE */}
              {activeTab === 'architecture' && (
                <motion.div key="arch" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <p className="font-mono text-[11px] text-muted mb-5">Click any node to inspect its role in the pipeline.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
                    {project.archNodes.map((node, i) => (
                      <motion.button key={node.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        onClick={() => setActiveNode(activeNode?.id === node.id ? null : node)}
                        className="relative p-4 border text-left transition-all duration-200"
                        style={{
                          borderColor: activeNode?.id === node.id ? node.color : 'rgba(0,212,255,0.12)',
                          background: activeNode?.id === node.id ? `${node.color}10` : '#010c1e',
                        }}
                      >
                        {i < project.archNodes.length - 1 && (
                          <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
                            <span className="font-mono text-[10px]" style={{ color: node.color }}>→</span>
                          </div>
                        )}
                        <div className="text-2xl mb-2">{node.icon}</div>
                        <div className="font-orbitron text-[10px] font-bold leading-tight mb-1" style={{ color: node.color }}>{node.label}</div>
                        <div className="font-mono text-[8px] text-muted leading-tight">{node.sublabel}</div>
                      </motion.button>
                    ))}
                  </div>
                  <AnimatePresence>
                    {activeNode && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="border overflow-hidden mb-5" style={{ borderColor: `${activeNode.color}40` }}>
                        <div className="p-6" style={{ background: `${activeNode.color}08` }}>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="font-mono text-[9px] tracking-[3px] uppercase mb-1" style={{ color: activeNode.color }}>Component Detail</div>
                              <div className="font-orbitron font-bold text-lg text-[#e2eaff]">{activeNode.icon} {activeNode.label}</div>
                            </div>
                            <button onClick={() => setActiveNode(null)} className="font-mono text-[10px] text-muted hover:text-cyan border border-[rgba(0,212,255,0.2)] px-2 py-1">✕</button>
                          </div>
                          <p className="text-[13px] text-[#8899aa] leading-relaxed mb-4">{activeNode.detail}</p>
                          <div className="flex flex-wrap gap-2">
                            {activeNode.tools.map((t: string) => (
                              <span key={t} className="font-mono text-[9px] px-2 py-1 border text-muted" style={{ borderColor: `${activeNode.color}30` }}>{t}</span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* EVIDENCE VAULT */}
              {activeTab === 'evidence' && (
                <motion.div key="evidence" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <p className="font-mono text-[11px] text-muted mb-5">Organized proof items for {project.title}.</p>
                  <div className="border border-[rgba(0,212,255,0.12)]">
                    <div className="grid grid-cols-3 px-5 py-2 border-b border-[rgba(0,212,255,0.08)] bg-[rgba(0,212,255,0.03)]">
                      <span className="font-mono text-[9px] text-muted tracking-[2px] uppercase">Evidence Item</span>
                      <span className="font-mono text-[9px] text-muted tracking-[2px] uppercase">Status</span>
                      <span className="font-mono text-[9px] text-muted tracking-[2px] uppercase">Action</span>
                    </div>
                    {project.evidence.map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="grid grid-cols-3 px-5 py-3.5 border-b border-[rgba(0,212,255,0.06)] last:border-b-0 items-center hover:bg-[rgba(0,212,255,0.02)] transition-colors">
                        <span className="font-mono text-[11px] text-[#b0c4d8]">{item.label}</span>
                        <span className={`font-mono text-[9px] flex items-center gap-2 ${item.status === 'available' ? 'text-neon' : 'text-[#ffaa00]'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'available' ? 'bg-neon' : 'bg-[#ffaa00]'}`} />
                          {item.status === 'available' ? 'AVAILABLE' : 'COMING SOON'}
                        </span>
                        <span>
                          {item.status === 'available' && (item as any).link ? (
                            <a href={(item as any).link} target="_blank" className="font-mono text-[9px] text-cyan hover:underline">View →</a>
                          ) : item.status === 'available' ? (
                            <span className="font-mono text-[9px] text-cyan">In Case Study</span>
                          ) : (
                            <span className="font-mono text-[9px] text-muted">In Development</span>
                          )}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* DECISION LOG */}
              {activeTab === 'decisions' && (
                <motion.div key="decisions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <p className="font-mono text-[11px] text-muted mb-5">Engineering decisions — what was chosen, why, and the tradeoffs.</p>
                  <div className="space-y-3">
                    {project.decisions.map((d, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        className="border border-[rgba(0,212,255,0.1)] p-5 hover:border-[rgba(0,212,255,0.25)] transition-colors">
                        <div className="font-orbitron text-[11px] font-bold mb-3" style={{ color: project.color }}>{d.decision}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <div className="font-mono text-[9px] text-neon tracking-[2px] uppercase mb-1">Why</div>
                            <p className="text-[12px] text-[#8899aa] leading-relaxed">{d.why}</p>
                          </div>
                          <div>
                            <div className="font-mono text-[9px] text-[#ffaa00] tracking-[2px] uppercase mb-1">Tradeoff</div>
                            <p className="text-[12px] text-[#8899aa] leading-relaxed">{d.tradeoff}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* PRODUCTION READINESS */}
              {activeTab === 'production' && (
                <motion.div key="production" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <div className="border border-[rgba(255,170,0,0.2)] bg-[rgba(255,170,0,0.03)] p-5 mb-5">
                    <div className="font-mono text-[9px] text-[#ffaa00] tracking-[3px] uppercase mb-2">⚠ Lab Context</div>
                    <p className="text-[13px] text-[#8899aa] leading-relaxed">
                      {project.title} is a controlled-lab project. This section outlines what would be required for real enterprise deployment — showing I understand the gap between a lab and production.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {project.production.map((req, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                        className="flex items-start gap-3 p-4 border border-[rgba(0,212,255,0.08)] hover:border-[rgba(0,212,255,0.2)] transition-colors">
                        <span className="text-neon font-mono text-[12px] mt-0.5 shrink-0">□</span>
                        <span className="text-[13px] text-[#8899aa]">{req}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Prev / Next navigation */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-[rgba(0,212,255,0.08)]">
              <button onClick={() => navigate(-1)}
                className="flex items-center gap-3 font-mono text-[10px] tracking-[2px] uppercase text-muted hover:text-cyan transition-colors group border border-[rgba(0,212,255,0.12)] px-4 py-2.5 hover:border-[rgba(0,212,255,0.3)]">
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                <span>{flagships[(currentIdx - 1 + flagships.length) % flagships.length].title}</span>
              </button>

              <div className="flex gap-2">
                {flagships.map((_, i) => (
                  <button key={i} onClick={() => { setDirection(i > currentIdx ? 1 : -1); setActiveNode(null); setActiveTab('architecture'); setCurrentIdx(i) }}
                    className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{ background: i === currentIdx ? project.color : 'rgba(0,212,255,0.2)' }} />
                ))}
              </div>

              <button onClick={() => navigate(1)}
                className="flex items-center gap-3 font-mono text-[10px] tracking-[2px] uppercase text-muted hover:text-cyan transition-colors group border border-[rgba(0,212,255,0.12)] px-4 py-2.5 hover:border-[rgba(0,212,255,0.3)]">
                <span>{flagships[(currentIdx + 1) % flagships.length].title}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
