'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const pipelineNodes = [
  { id: 'splunk',    label: 'Splunk SIEM',    sublabel: 'Alert Triggered',        color: '#00d4ff', icon: '📊' },
  { id: 'n8n',      label: 'n8n',             sublabel: 'Workflow Fired',          color: '#818cf8', icon: '⚡' },
  { id: 'claude',   label: 'Claude LLM',      sublabel: 'AI Classification',       color: '#a855f7', icon: '🤖' },
  { id: 'paloalto', label: 'Palo Alto',        sublabel: 'Response Recommended',    color: '#00f5d4', icon: '🛡️' },
  { id: 'telegram', label: 'Telegram',         sublabel: 'Analyst Notified',        color: '#38bdf8', icon: '📱' },
]

const demoAlerts = [
  {
    id: 'alert-001',
    type: 'Phishing Attempt',
    severity: 'HIGH' as const,
    source: '192.168.1.45',
    detail: 'Suspicious email with typosquatted domain detected',
    aiVerdict: 'THREAT CONFIRMED — Credential harvesting URL identified',
    action: 'Block domain · Reset user credentials · Notify analyst',
    mitre: 'T1566.002',
    color: '#f97316',
  },
  {
    id: 'alert-002',
    type: 'C2 Beacon Detected',
    severity: 'CRITICAL' as const,
    source: '10.0.0.23',
    detail: 'Regular 60s interval beaconing to external IP',
    aiVerdict: 'THREAT CONFIRMED — C2 communication pattern, high confidence',
    action: 'Isolate host · Block C2 IP · Preserve forensics',
    mitre: 'T1071.001',
    color: '#ef4444',
  },
  {
    id: 'alert-003',
    type: 'S3 Misconfiguration',
    severity: 'HIGH' as const,
    source: 'AWS GuardDuty',
    detail: 'Public access block removed from production S3 bucket',
    aiVerdict: 'MISCONFIGURATION — Sensitive data exposure risk detected',
    action: 'Re-enable public access block · Review IAM · Audit access logs',
    mitre: 'T1530',
    color: '#f59e0b',
  },
]

const severityColors = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#f59e0b',
}

const logLines = [
  { delay: 0,    text: '> BLUE SOC monitoring active...', color: '#00d4ff' },
  { delay: 800,  text: '> Splunk SIEM ingesting log streams...', color: '#8899bb' },
  { delay: 1600, text: '> n8n orchestration engine ready...', color: '#8899bb' },
  { delay: 2400, text: '> Claude LLM classification model loaded...', color: '#818cf8' },
  { delay: 3200, text: '> Palo Alto firewall API connected...', color: '#00f5d4' },
  { delay: 4000, text: '> ALL SYSTEMS NOMINAL — Awaiting alerts...', color: '#00f5d4' },
]

export default function BlueSocDemo() {
  const [running, setRunning]           = useState(false)
  const [currentAlert, setCurrentAlert] = useState<typeof demoAlerts[0] | null>(null)
  const [activeNode, setActiveNode]     = useState(-1)
  const [completed, setCompleted]       = useState(false)
  const [alertIdx, setAlertIdx]         = useState(0)
  const [visibleLogs, setVisibleLogs]   = useState<number[]>([])
  const [liveLogs, setLiveLogs]         = useState<string[]>([])
  const [initialized, setInitialized]   = useState(false)
  const logsEndRef = useRef<HTMLDivElement>(null)

  // Init logs on mount
  useEffect(() => {
    logLines.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLogs(prev => [...prev, i])
        if (i === logLines.length - 1) setInitialized(true)
      }, line.delay)
    })
  }, [])

  useEffect(() => {
    // logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [liveLogs, visibleLogs])

  const addLog = (text: string, color = '#8899bb') => {
    setLiveLogs(prev => [...prev, `${new Date().toLocaleTimeString('en-US', { hour12: false })} ${text}`])
  }

  const runDemo = async () => {
    const alert = demoAlerts[alertIdx % demoAlerts.length]
    setCurrentAlert(alert)
    setRunning(true)
    setCompleted(false)
    setActiveNode(-1)
    setLiveLogs([])

    addLog(`ALERT RECEIVED: ${alert.type} — Severity: ${alert.severity}`)

    // Animate through each pipeline node
    for (let i = 0; i < pipelineNodes.length; i++) {
      await new Promise(r => setTimeout(r, 1200))
      setActiveNode(i)
      const node = pipelineNodes[i]
      if (i === 0) addLog(`Splunk alert fired — Source: ${alert.source}`)
      if (i === 1) addLog(`n8n webhook triggered — routing to AI classification...`)
      if (i === 2) addLog(`Claude LLM verdict: ${alert.aiVerdict}`)
      if (i === 3) addLog(`Palo Alto response generated — ${alert.action}`)
      if (i === 4) addLog(`Analyst notified via Telegram — MITRE: ${alert.mitre}`)
    }

    await new Promise(r => setTimeout(r, 800))
    setCompleted(true)
    setRunning(false)
    setAlertIdx(i => i + 1)
  }

  return (
    <section className="px-6 py-20 border-t border-[rgba(0,212,255,0.08)]"
      style={{ background: 'linear-gradient(180deg, rgba(0,212,255,0.015) 0%, transparent 100%)' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 font-mono text-[10px] text-neon tracking-[4px] uppercase mb-3">
              <span className="w-8 h-px bg-neon" />
              Live Simulation
              <motion.span
                className="w-2 h-2 rounded-full bg-neon"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <h2 className="font-orbitron font-black text-3xl text-[#e2eaff] mb-2">
              BLUE SOC <span className="text-cyan">Demo</span>
            </h2>
            <p className="font-mono text-[12px] text-muted max-w-xl leading-relaxed">
              Watch a simulated security alert flow through the full BLUE SOC pipeline in real time.
              Each node lights up as it processes the threat.
            </p>
          </div>
          <button
            onClick={runDemo}
            disabled={running || !initialized}
            className="shrink-0 font-mono text-[11px] tracking-[2px] uppercase px-8 py-3 transition-all duration-200 flex items-center gap-3 disabled:opacity-50"
            style={{
              background: running ? 'rgba(0,212,255,0.05)' : '#00d4ff',
              color: running ? '#00d4ff' : '#020818',
              border: running ? '1px solid rgba(0,212,255,0.3)' : 'none',
            }}
          >
            {running ? (
              <>
                <motion.span
                  className="w-2 h-2 rounded-full bg-cyan"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
                Processing...
              </>
            ) : completed ? (
              <>↺ Run Another Alert</>
            ) : (
              <>▶ Fire Alert</>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT — Pipeline */}
          <div>
            <div className="font-mono text-[9px] text-muted tracking-[2px] uppercase mb-4">Pipeline</div>

            {/* Alert card */}
            <AnimatePresence mode="wait">
              {currentAlert && (
                <motion.div
                  key={currentAlert.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="border p-4 mb-4"
                  style={{ borderColor: `${currentAlert.color}50`, background: `${currentAlert.color}08` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[9px] px-2 py-0.5"
                      style={{ color: currentAlert.color, background: `${currentAlert.color}20` }}>
                      {currentAlert.severity}
                    </span>
                    <span className="font-mono text-[9px] text-muted">{currentAlert.mitre}</span>
                  </div>
                  <div className="font-orbitron text-sm font-bold text-[#e2eaff] mb-1">{currentAlert.type}</div>
                  <div className="font-mono text-[10px] text-muted">{currentAlert.detail}</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pipeline nodes */}
            <div className="space-y-2">
              {pipelineNodes.map((node, i) => {
                const isActive   = activeNode === i && running
                const isDone     = activeNode > i || completed
                const isPending  = activeNode < i || (!running && !completed)

                return (
                  <motion.div
                    key={node.id}
                    className="flex items-center gap-4 p-4 border transition-all duration-500"
                    style={{
                      borderColor: isActive ? node.color : isDone ? `${node.color}40` : 'rgba(0,212,255,0.08)',
                      background: isActive ? `${node.color}12` : isDone ? `${node.color}06` : '#010c1e',
                      boxShadow: isActive ? `0 0 20px ${node.color}30` : 'none',
                    }}
                  >
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg shrink-0 transition-all duration-500"
                      style={{
                        borderColor: isActive ? node.color : isDone ? `${node.color}60` : 'rgba(0,212,255,0.15)',
                        boxShadow: isActive ? `0 0 15px ${node.color}60` : 'none',
                      }}>
                      {node.icon}
                    </div>

                    {/* Labels */}
                    <div className="flex-1">
                      <div className="font-mono text-[11px] font-bold transition-colors duration-300"
                        style={{ color: isActive ? node.color : isDone ? node.color : '#8899bb' }}>
                        {node.label}
                      </div>
                      <div className="font-mono text-[9px] text-muted">{node.sublabel}</div>
                    </div>

                    {/* Status indicator */}
                    <div className="shrink-0">
                      {isActive && (
                        <motion.div
                          className="w-3 h-3 rounded-full"
                          style={{ background: node.color }}
                          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity }}
                        />
                      )}
                      {isDone && !isActive && (
                        <motion.span
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="font-mono text-[12px]"
                          style={{ color: node.color }}>
                          ✓
                        </motion.span>
                      )}
                      {isPending && !isActive && !isDone && (
                        <div className="w-3 h-3 rounded-full bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)]" />
                      )}
                    </div>

                    {/* Arrow connector */}
                    {i < pipelineNodes.length - 1 && (
                      <div className="absolute left-[33px] mt-[52px] w-px h-2 opacity-30"
                        style={{ background: node.color }} />
                    )}
                  </motion.div>
                )
              })}
            </div>

            {/* Completion */}
            <AnimatePresence>
              {completed && currentAlert && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 p-4 border border-[rgba(0,245,212,0.3)] bg-[rgba(0,245,212,0.04)]"
                >
                  <div className="font-mono text-[9px] text-neon tracking-[2px] uppercase mb-2">
                    ✓ Pipeline Complete
                  </div>
                  <div className="font-mono text-[11px] text-muted leading-relaxed">
                    {currentAlert.action}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT — Live log terminal */}
          <div>
            <div className="font-mono text-[9px] text-muted tracking-[2px] uppercase mb-4">System Log</div>
            <div className="terminal-box h-full min-h-[400px] flex flex-col">
              <div className="terminal-bar shrink-0">
                <div className="terminal-dot bg-red-500" />
                <div className="terminal-dot bg-yellow-400" />
                <div className="terminal-dot bg-green-400" />
                <span className="font-mono text-[10px] text-muted ml-2">blue-soc — live.log</span>
                <span className="ml-auto flex items-center gap-1.5 font-mono text-[9px] text-neon">
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-neon"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  LIVE
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-7 space-y-0.5">
                {/* Init logs */}
                {logLines.map((line, i) => (
                  <motion.div
                    key={`init-${i}`}
                    initial={{ opacity: 0, x: -5 }}
                    animate={visibleLogs.includes(i) ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.3 }}
                    style={{ color: line.color }}
                  >
                    {line.text}
                  </motion.div>
                ))}

                {/* Live alert logs */}
                <AnimatePresence>
                  {liveLogs.map((log, i) => (
                    <motion.div
                      key={`live-${i}`}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[#e2eaff]"
                    >
                      <span className="text-neon">❯ </span>{log}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {running && (
                  <motion.span
                    className="text-cyan"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >_</motion.span>
                )}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom note */}
        <div className="mt-6 font-mono text-[10px] text-muted text-center">
          This is a controlled simulation demonstrating the BLUE SOC pipeline architecture.
          All alerts are synthetic. Analyst approval required for real containment actions.
        </div>
      </div>
    </section>
  )
}
