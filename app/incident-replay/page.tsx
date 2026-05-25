'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import GlowOrbs from '@/components/ui/GlowOrbs'
import Link from 'next/link'
import { incidents, type Incident, type TimelineEvent } from '@/data/incidents'

// ── Severity config ──────────────────────────────────────────────────────────
const severityConfig = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  label: 'CRITICAL' },
  high:     { color: '#f97316', bg: 'rgba(249,115,22,0.1)', label: 'HIGH'     },
  medium:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'MEDIUM'   },
  low:      { color: '#84cc16', bg: 'rgba(132,204,22,0.1)', label: 'LOW'      },
  info:     { color: '#00d4ff', bg: 'rgba(0,212,255,0.1)',  label: 'INFO'     },
}

const modeConfig = {
  'automated':        { color: '#00f5d4', label: 'AUTOMATED'        },
  'analyst-required': { color: '#f59e0b', label: 'ANALYST REQUIRED' },
  'recommended':      { color: '#818cf8', label: 'RECOMMENDED'      },
}

const evidenceTypeIcon: Record<string, string> = {
  email: '✉️', log: '📋', query: '🔍', ioc: '⚠️', note: '📝', mitre: '🗺️',
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy}
      className="font-mono text-[9px] tracking-[1px] uppercase px-2 py-1 border border-[rgba(0,212,255,0.2)] text-muted hover:text-cyan hover:border-cyan transition-colors">
      {copied ? '✓ COPIED' : 'COPY SPL'}
    </button>
  )
}

// ── Guided replay component ──────────────────────────────────────────────────
function GuidedReplay({ incident, onExit }: { incident: Incident; onExit: () => void }) {
  const [step, setStep] = useState(0)
  const [running, setRunning] = useState(false)
  const [completed, setCompleted] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const events = incident.timeline

  const startReplay = () => {
    setStep(0)
    setRunning(true)
    setCompleted(false)
  }

  useEffect(() => {
    if (!running) return
    if (step >= events.length - 1) {
      setRunning(false)
      setCompleted(true)
      return
    }
    timerRef.current = setTimeout(() => setStep(s => s + 1), 1800)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [running, step, events.length])

  return (
    <div className="fixed inset-0 z-[9999] bg-[#020818] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.03)] shrink-0">
        <div className="flex items-center gap-4">
          <div className="font-mono text-[9px] text-neon tracking-[3px] uppercase">Guided Replay Mode</div>
          <div className="font-orbitron text-sm font-bold text-[#e2eaff]">{incident.title}</div>
        </div>
        <div className="flex items-center gap-3">
          {!running && !completed && (
            <button onClick={startReplay}
              className="font-mono text-[10px] tracking-[2px] uppercase px-4 py-2 bg-cyan text-bg hover:bg-neon transition-colors">
              ▶ Start Replay
            </button>
          )}
          {running && (
            <button onClick={() => setRunning(false)}
              className="font-mono text-[10px] tracking-[2px] uppercase px-4 py-2 border border-[rgba(255,170,0,0.4)] text-[#ffaa00] hover:bg-[rgba(255,170,0,0.08)] transition-colors">
              ⏸ Pause
            </button>
          )}
          {!running && completed && (
            <button onClick={startReplay}
              className="font-mono text-[10px] tracking-[2px] uppercase px-4 py-2 border border-cyan text-cyan hover:bg-[rgba(0,212,255,0.08)] transition-colors">
              ↺ Replay
            </button>
          )}
          <button onClick={onExit}
            className="font-mono text-[10px] text-muted hover:text-cyan border border-[rgba(0,212,255,0.2)] px-3 py-2 hover:border-cyan transition-colors">
            EXIT
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-4">
          {!running && !completed && (
            <div className="text-center py-20">
              <div className="font-orbitron text-4xl font-black text-[rgba(0,212,255,0.2)] mb-4">▶</div>
              <div className="font-mono text-muted text-[13px]">Press Start Replay to walk through the incident timeline</div>
            </div>
          )}
          <AnimatePresence>
            {(running || completed) && events.slice(0, step + 1).map((event, i) => {
              const sev = severityConfig[event.severity]
              return (
                <motion.div key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex gap-4"
                >
                  {/* Timeline line */}
                  <div className="flex flex-col items-center shrink-0">
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="w-3 h-3 rounded-full border-2 mt-1"
                      style={{ borderColor: sev.color, background: `${sev.color}30` }}
                    />
                    {i < step && <div className="w-px flex-1 mt-1" style={{ background: `${sev.color}30` }} />}
                  </div>

                  {/* Event card */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-[10px] text-muted">{event.time}</span>
                      <span className="font-mono text-[9px] px-2 py-0.5" style={{ color: sev.color, background: sev.bg }}>
                        {sev.label}
                      </span>
                    </div>
                    <div className="font-orbitron text-[13px] font-bold text-[#e2eaff] mb-1">{event.title}</div>
                    <p className="font-mono text-[11px] text-muted leading-relaxed">{event.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {completed && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="border border-[rgba(0,245,212,0.3)] bg-[rgba(0,245,212,0.04)] p-6 mt-6">
              <div className="font-mono text-[9px] text-neon tracking-[3px] uppercase mb-3">Analyst Conclusion</div>
              <p className="text-[13px] text-[#8899aa] leading-relaxed">{incident.analystConclusion}</p>
              <div className="mt-4 pt-4 border-t border-[rgba(0,212,255,0.1)]">
                <div className="font-mono text-[9px] text-cyan tracking-[3px] uppercase mb-2">Lessons Learned</div>
                <p className="text-[13px] text-[#8899aa] leading-relaxed">{incident.lessonsLearned}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="shrink-0 px-6 py-3 border-t border-[rgba(0,212,255,0.08)] bg-[rgba(0,212,255,0.02)]">
        <div className="flex justify-between font-mono text-[9px] text-muted mb-1">
          <span>REPLAY PROGRESS</span>
          <span>{running || completed ? Math.round(((step + 1) / events.length) * 100) : 0}%</span>
        </div>
        <div className="w-full h-1 bg-[rgba(0,212,255,0.1)]">
          <motion.div className="h-full bg-gradient-to-r from-cyan to-neon"
            animate={{ width: `${running || completed ? ((step + 1) / events.length) * 100 : 0}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
type ActiveTab = 'timeline' | 'evidence' | 'response' | 'mitre'

export default function IncidentReplayPage() {
  const [selectedIncident, setSelectedIncident] = useState<Incident>(incidents[0])
  const [activeTab, setActiveTab]               = useState<ActiveTab>('timeline')
  const [selectedEvent, setSelectedEvent]       = useState<TimelineEvent | null>(null)
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null)
  const [guidedMode, setGuidedMode]             = useState(false)

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: 'timeline', label: 'Timeline'      },
    { id: 'evidence', label: 'Evidence'      },
    { id: 'response', label: 'Response'      },
    { id: 'mitre',    label: 'MITRE ATT&CK'  },
  ]

  return (
    <>
      {guidedMode && (
        <GuidedReplay incident={selectedIncident} onExit={() => setGuidedMode(false)} />
      )}

      <main className="relative min-h-screen bg-[#020818]">
        <GlowOrbs />
        <Nav />

        {/* Hero */}
        <section className="relative pt-32 pb-12 px-6 overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="max-w-6xl mx-auto relative z-10">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 font-mono text-[10px] text-muted tracking-[2px] uppercase mb-8">
              <Link href="/" className="hover:text-cyan transition-colors">Home</Link>
              <span className="text-[rgba(0,212,255,0.3)]">/</span>
              <Link href="/projects/blue-soc-p8" className="hover:text-cyan transition-colors">BLUE SOC</Link>
              <span className="text-[rgba(0,212,255,0.3)]">/</span>
              <span className="text-cyan">Incident Replay Lab</span>
            </motion.div>

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 font-mono text-[10px] text-neon tracking-[4px] uppercase mb-3">
                  <span className="w-8 h-px bg-neon" />
                  Interactive Lab
                  <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
                </div>
                <h1 className="font-orbitron font-black text-[clamp(28px,4vw,48px)] text-[#e2eaff] mb-3">
                  Incident <span className="text-cyan">Replay Lab</span>
                </h1>
                <p className="font-mono text-[12px] text-muted max-w-2xl leading-relaxed">
                  Walk through real SOC investigations step by step. Each incident shows the full analyst workflow —
                  timeline reconstruction, evidence analysis, IOC extraction, MITRE ATT&CK mapping, and response decisions.
                  Built to demonstrate investigative thinking, not just technical tooling.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <button onClick={() => setGuidedMode(true)}
                  className="font-mono text-[10px] tracking-[2px] uppercase px-5 py-2.5 bg-cyan text-bg hover:bg-neon transition-colors flex items-center gap-2">
                  <span>▶</span> Guided Replay
                </button>
                <Link href="/projects/blue-soc-p8"
                  className="font-mono text-[10px] tracking-[2px] uppercase px-5 py-2.5 border border-[rgba(0,212,255,0.3)] text-cyan hover:border-cyan transition-colors">
                  ← BLUE SOC
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Incident selector */}
        <section className="px-6 pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="font-mono text-[10px] text-muted tracking-[3px] uppercase mb-4">Select Incident</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {incidents.map(inc => {
                const sev = severityConfig[inc.severity]
                const isActive = selectedIncident.id === inc.id
                return (
                  <button key={inc.id}
                    onClick={() => { setSelectedIncident(inc); setActiveTab('timeline'); setSelectedEvent(null); setSelectedEvidence(null) }}
                    className={`text-left p-5 border transition-all duration-200 relative overflow-hidden ${
                      isActive ? 'border-opacity-60' : 'border-[rgba(0,212,255,0.12)] hover:border-[rgba(0,212,255,0.3)]'
                    }`}
                    style={{
                      borderColor: isActive ? inc.color : undefined,
                      background: isActive ? `${inc.color}08` : '#010c1e',
                    }}
                  >
                    {isActive && (
                      <div className="absolute top-0 left-0 right-0 h-[2px]"
                        style={{ background: `linear-gradient(90deg, transparent, ${inc.color}, transparent)` }} />
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[9px] tracking-[2px] uppercase" style={{ color: inc.color }}>
                        INC-{inc.num}
                      </span>
                      <span className="font-mono text-[9px] px-2 py-0.5" style={{ color: sev.color, background: sev.bg }}>
                        {sev.label}
                      </span>
                    </div>
                    <div className="font-orbitron text-[12px] font-bold text-[#e2eaff] mb-1 leading-tight">{inc.title}</div>
                    <div className="font-mono text-[10px] text-muted">{inc.category}</div>
                    <div className="font-mono text-[9px] text-muted mt-2 opacity-60">{inc.timeline.length} events · {inc.mitre.length} techniques</div>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Main content */}
        <section className="px-6 pb-20">
          <div className="max-w-6xl mx-auto">

            {/* Incident summary */}
            <div className="border border-[rgba(0,212,255,0.12)] bg-[rgba(0,212,255,0.02)] p-6 mb-6 relative">
              <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-cyan opacity-60" />
              <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-cyan opacity-60" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-mono text-[9px] tracking-[3px] uppercase mb-1" style={{ color: selectedIncident.color }}>
                    INC-{selectedIncident.num} · {selectedIncident.category}
                  </div>
                  <div className="font-orbitron text-xl font-black text-[#e2eaff] mb-2">{selectedIncident.title}</div>
                  <p className="font-mono text-[11px] text-muted leading-relaxed max-w-3xl">{selectedIncident.summary}</p>
                </div>
                <button onClick={() => setGuidedMode(true)}
                  className="shrink-0 font-mono text-[9px] tracking-[2px] uppercase px-4 py-2 border flex items-center gap-2 hover:bg-[rgba(0,212,255,0.05)] transition-colors"
                  style={{ borderColor: `${selectedIncident.color}50`, color: selectedIncident.color }}>
                  ▶ Guided Mode
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-0 mb-6 border border-[rgba(0,212,255,0.15)] w-fit">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`font-mono text-[10px] tracking-[2px] uppercase px-5 py-2.5 border-r border-[rgba(0,212,255,0.15)] last:border-r-0 transition-all duration-200 ${
                    activeTab === tab.id ? 'bg-[rgba(0,212,255,0.1)] text-cyan' : 'text-muted hover:text-cyan'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">

              {/* ── TIMELINE TAB ── */}
              {activeTab === 'timeline' && (
                <motion.div key="timeline"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                  {/* Left: Timeline */}
                  <div className="lg:col-span-1">
                    <div className="font-mono text-[9px] text-muted tracking-[2px] uppercase mb-4">Event Timeline</div>
                    <div className="space-y-1">
                      {selectedIncident.timeline.map((event, i) => {
                        const sev = severityConfig[event.severity]
                        const isSelected = selectedEvent?.id === event.id
                        return (
                          <motion.button key={event.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => setSelectedEvent(isSelected ? null : event)}
                            className="w-full text-left flex gap-3 p-3 transition-all duration-200 border"
                            style={{
                              borderColor: isSelected ? sev.color : 'rgba(0,212,255,0.08)',
                              background: isSelected ? `${sev.color}08` : 'transparent',
                            }}
                          >
                            <div className="flex flex-col items-center shrink-0">
                              <div className="w-2.5 h-2.5 rounded-full mt-1"
                                style={{ background: sev.color, boxShadow: `0 0 6px ${sev.color}` }} />
                              {i < selectedIncident.timeline.length - 1 && (
                                <div className="w-px flex-1 mt-1 opacity-30" style={{ background: sev.color }} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 pb-2">
                              <div className="font-mono text-[9px] text-muted mb-0.5">{event.time}</div>
                              <div className="font-mono text-[10px] font-bold leading-tight"
                                style={{ color: isSelected ? sev.color : '#b0c4d8' }}>
                                {event.title}
                              </div>
                              <span className="font-mono text-[8px] px-1.5 py-0.5 mt-1 inline-block"
                                style={{ color: sev.color, background: sev.bg }}>
                                {sev.label}
                              </span>
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Right: Event detail */}
                  <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                      {selectedEvent ? (
                        <motion.div key={selectedEvent.id}
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        >
                          <div className="font-mono text-[9px] text-muted tracking-[2px] uppercase mb-4">Event Detail</div>
                          <div className="border p-6" style={{ borderColor: `${severityConfig[selectedEvent.severity].color}40` }}>
                            <div className="flex items-center gap-3 mb-4">
                              <span className="font-mono text-[9px] px-2 py-1"
                                style={{ color: severityConfig[selectedEvent.severity].color, background: severityConfig[selectedEvent.severity].bg }}>
                                {severityConfig[selectedEvent.severity].label}
                              </span>
                              <span className="font-mono text-[10px] text-muted">{selectedEvent.time}</span>
                            </div>
                            <div className="font-orbitron text-lg font-bold text-[#e2eaff] mb-4">{selectedEvent.title}</div>
                            <p className="text-[14px] text-[#8899aa] leading-relaxed">{selectedEvent.description}</p>
                          </div>

                          {/* Analyst conclusion at bottom */}
                          <div className="mt-4 p-4 border border-[rgba(0,245,212,0.15)] bg-[rgba(0,245,212,0.03)]">
                            <div className="font-mono text-[9px] text-neon tracking-[2px] uppercase mb-2">Final Analyst Conclusion</div>
                            <p className="font-mono text-[11px] text-muted leading-relaxed">{selectedIncident.analystConclusion}</p>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div key="empty"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center h-64 border border-[rgba(0,212,255,0.08)]"
                        >
                          <div className="font-mono text-[10px] text-muted text-center">
                            Select an event from the timeline to see details
                          </div>
                          <div className="font-mono text-[9px] text-muted opacity-50 mt-2">
                            or use Guided Mode for auto-replay
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* ── EVIDENCE TAB ── */}
              {activeTab === 'evidence' && (
                <motion.div key="evidence"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                  {/* Evidence list */}
                  <div className="lg:col-span-1 space-y-2">
                    <div className="font-mono text-[9px] text-muted tracking-[2px] uppercase mb-4">Evidence Items</div>
                    {selectedIncident.evidence.map((ev, i) => (
                      <motion.button key={ev.id}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                        onClick={() => setSelectedEvidence(selectedEvidence === ev.id ? null : ev.id)}
                        className="w-full text-left p-4 border transition-all duration-200"
                        style={{
                          borderColor: selectedEvidence === ev.id ? '#00d4ff' : 'rgba(0,212,255,0.1)',
                          background: selectedEvidence === ev.id ? 'rgba(0,212,255,0.06)' : '#010c1e',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span>{evidenceTypeIcon[ev.type]}</span>
                          <span className="font-mono text-[9px] text-cyan tracking-[1px] uppercase">{ev.type}</span>
                        </div>
                        <div className="font-mono text-[11px] text-[#b0c4d8] leading-tight">{ev.title}</div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Evidence detail */}
                  <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                      {selectedEvidence ? (() => {
                        const ev = selectedIncident.evidence.find(e => e.id === selectedEvidence)!
                        return (
                          <motion.div key={selectedEvidence}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="font-mono text-[9px] text-muted tracking-[2px] uppercase">Evidence Detail</div>
                              {ev.type === 'query' && <CopyButton text={ev.content} />}
                            </div>
                            <div className="border border-[rgba(0,212,255,0.15)] overflow-hidden">
                              <div className="flex items-center gap-2 px-4 py-2 border-b border-[rgba(0,212,255,0.1)] bg-[rgba(0,212,255,0.03)]">
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                                <span className="w-2 h-2 rounded-full bg-green-400" />
                                <span className="font-mono text-[9px] text-muted ml-1">{ev.title}</span>
                              </div>
                              <pre className="p-5 font-mono text-[11px] text-[#8899aa] leading-relaxed overflow-x-auto whitespace-pre-wrap bg-[#010c1e]">
                                {ev.content}
                              </pre>
                            </div>
                            {ev.highlight && (
                              <div className="mt-3 p-3 border border-[rgba(0,245,212,0.2)] bg-[rgba(0,245,212,0.04)]">
                                <span className="font-mono text-[9px] text-neon tracking-[2px] uppercase mr-2">Key Finding:</span>
                                <span className="font-mono text-[11px] text-neon">{ev.highlight}</span>
                              </div>
                            )}
                          </motion.div>
                        )
                      })() : (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="flex items-center justify-center h-64 border border-[rgba(0,212,255,0.08)]">
                          <div className="font-mono text-[10px] text-muted">Select evidence item to inspect</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* ── RESPONSE TAB ── */}
              {activeTab === 'response' && (
                <motion.div key="response"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Response steps */}
                    <div>
                      <div className="font-mono text-[9px] text-muted tracking-[2px] uppercase mb-4">Response Workflow</div>
                      <div className="space-y-3">
                        {selectedIncident.response.map((step, i) => {
                          const mode = modeConfig[step.mode]
                          return (
                            <motion.div key={step.id}
                              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                              className="flex gap-4 p-4 border border-[rgba(0,212,255,0.08)] hover:border-[rgba(0,212,255,0.2)] transition-colors"
                            >
                              <div className="flex flex-col items-center shrink-0">
                                <div className="w-6 h-6 border flex items-center justify-center"
                                  style={{ borderColor: `${mode.color}50` }}>
                                  <span className="font-mono text-[9px]" style={{ color: mode.color }}>{i + 1}</span>
                                </div>
                                {i < selectedIncident.response.length - 1 && (
                                  <div className="w-px flex-1 mt-1 opacity-20" style={{ background: mode.color }} />
                                )}
                              </div>
                              <div className="flex-1 pb-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-mono text-[12px] text-[#e2eaff] font-bold">{step.action}</span>
                                </div>
                                <span className="font-mono text-[8px] px-2 py-0.5 mb-2 inline-block"
                                  style={{ color: mode.color, background: `${mode.color}15` }}>
                                  {mode.label}
                                </span>
                                <p className="font-mono text-[10px] text-muted leading-relaxed mt-1">{step.detail}</p>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>

                    {/* SPL Query */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="font-mono text-[9px] text-muted tracking-[2px] uppercase">Splunk Hunt Query</div>
                        <CopyButton text={selectedIncident.splunkQuery} />
                      </div>
                      <div className="border border-[rgba(0,212,255,0.15)] overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2 border-b border-[rgba(0,212,255,0.1)] bg-[rgba(0,212,255,0.03)]">
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          <span className="w-2 h-2 rounded-full bg-yellow-400" />
                          <span className="w-2 h-2 rounded-full bg-green-400" />
                          <span className="font-mono text-[9px] text-muted ml-1">splunk-query.spl</span>
                        </div>
                        <pre className="p-5 font-mono text-[11px] text-[#8899aa] leading-relaxed overflow-x-auto bg-[#010c1e]">
                          {selectedIncident.splunkQuery}
                        </pre>
                      </div>

                      {/* Conclusion */}
                      <div className="mt-4 p-5 border border-[rgba(0,245,212,0.2)] bg-[rgba(0,245,212,0.03)]">
                        <div className="font-mono text-[9px] text-neon tracking-[2px] uppercase mb-3">Analyst Conclusion</div>
                        <p className="text-[13px] text-[#8899aa] leading-relaxed mb-4">{selectedIncident.analystConclusion}</p>
                        <div className="pt-3 border-t border-[rgba(0,212,255,0.08)]">
                          <div className="font-mono text-[9px] text-cyan tracking-[2px] uppercase mb-2">Lessons Learned</div>
                          <p className="text-[13px] text-[#8899aa] leading-relaxed">{selectedIncident.lessonsLearned}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── MITRE TAB ── */}
              {activeTab === 'mitre' && (
                <motion.div key="mitre"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                >
                  <div className="font-mono text-[9px] text-muted tracking-[2px] uppercase mb-4">MITRE ATT&CK Mapping</div>
                  <div className="space-y-3 mb-8">
                    {selectedIncident.mitre.map((m, i) => (
                      <motion.div key={m.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className="border border-[rgba(0,212,255,0.1)] p-5 hover:border-[rgba(0,212,255,0.25)] transition-colors"
                      >
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span className="font-mono text-[10px] px-3 py-1 border border-[rgba(0,212,255,0.3)] text-cyan bg-[rgba(0,212,255,0.06)]">
                            {m.id}
                          </span>
                          <span className="font-mono text-[9px] px-2 py-1 border border-[rgba(168,85,247,0.3)] text-purple-400 bg-[rgba(168,85,247,0.06)]">
                            {m.tactic}
                          </span>
                        </div>
                        <div className="font-orbitron text-[13px] font-bold text-[#e2eaff] mb-2">{m.technique}</div>
                        <p className="text-[13px] text-[#8899aa] leading-relaxed">{m.description}</p>
                        <a href={`https://attack.mitre.org/techniques/${m.id.replace('.', '/')}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 font-mono text-[9px] text-cyan hover:underline mt-3">
                          View on MITRE ATT&CK ↗
                        </a>
                      </motion.div>
                    ))}
                  </div>

                  <div className="p-4 border border-[rgba(0,212,255,0.08)] bg-[rgba(0,0,0,0.3)]">
                    <div className="font-mono text-[9px] text-muted tracking-[2px] uppercase mb-2">About MITRE ATT&CK</div>
                    <p className="font-mono text-[11px] text-muted leading-relaxed">
                      MITRE ATT&CK is a globally-accessible knowledge base of adversary tactics and techniques based on real-world observations.
                      Mapping incidents to ATT&CK helps analysts understand attacker behavior, improve detection coverage, and communicate findings clearly.
                    </p>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </section>

        {/* Back to BLUE SOC */}
        <section className="px-6 py-10 border-t border-[rgba(0,212,255,0.08)]">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link href="/projects/blue-soc-p8"
              className="glass-card px-6 py-4 hover:border-[rgba(0,212,255,0.3)] transition-colors group">
              <div className="font-mono text-[9px] text-muted tracking-[2px] uppercase mb-1">← Back to</div>
              <div className="font-orbitron text-sm font-bold text-[#e2eaff] group-hover:text-cyan transition-colors">BLUE SOC P8</div>
            </Link>
            <Link href="/#projects"
              className="font-mono text-[10px] tracking-[2px] uppercase text-muted hover:text-cyan transition-colors hidden md:block">
              All Projects
            </Link>
          </div>
        </section>

        <Footer />
      </main>
    </>
  )
}
