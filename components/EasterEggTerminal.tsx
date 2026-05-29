'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const EASTER_EGG_COMMANDS: Record<string, { output: string[]; color?: string }> = {
  help: {
    output: [
      '╔══════════════════════════════════════╗',
      '║     BLUE SOC HIDDEN TERMINAL v1.0    ║',
      '╚══════════════════════════════════════╝',
      '',
      'Available commands:',
      '  whoami          — Who is Joseph?',
      '  origin          — Where it all started',
      '  mission         — What drives him',
      '  stack           — His weapon of choice',
      '  fun             — Something you did not expect',
      '  hire            — How to bring Joseph on board',
      '  flag            — Can you find the hidden flag?',
      '  clear           — Clear the terminal',
      '',
      'Hint: Try "flag" if you dare...',
    ],
  },
  whoami: {
    color: '#00d4ff',
    output: [
      '> Scanning identity...',
      '',
      '  Name    : Joseph Allan Kamara',
      '  Origin  : Freetown, Sierra Leone 🌍',
      '  Base    : Philadelphia, PA',
      '  Role    : Cybersecurity Engineer',
      '  Status  : Available NOW',
      '',
      '  "From a country where power cuts were common,',
      '   I learned to build things that never sleep."',
    ],
  },
  origin: {
    color: '#ffaa00',
    output: [
      '> Loading origin story...',
      '',
      '  Growing up in Freetown, Sierra Leone,',
      '  Joseph saw firsthand how critical infrastructure',
      '  shapes lives — and how fragile it can be.',
      '',
      '  No reliable power. Limited internet.',
      '  But a burning curiosity about how systems work.',
      '',
      '  That background gave him something most',
      '  engineers never develop:',
      '',
      '  A mission-driven reason to protect systems.',
      '  Because protecting systems means protecting people.',
    ],
  },
  mission: {
    color: '#00f5d4',
    output: [
      '> Accessing mission.txt...',
      '',
      '  ┌─────────────────────────────────────────┐',
      '  │                                         │',
      '  │  "I do not just study threats.          │',
      '  │   I build the systems that detect,      │',
      '  │   analyze, and respond to them —        │',
      '  │   before attackers even know            │',
      '  │   they have been seen."                 │',
      '  │                                         │',
      '  └─────────────────────────────────────────┘',
      '',
      '  Security is not just a career.',
      '  It is the thing that keeps the lights on.',
    ],
  },
  stack: {
    color: '#818cf8',
    output: [
      '> Enumerating arsenal...',
      '',
      '  DETECTION     │ Splunk · Zeek · Suricata · Scapy',
      '  CLOUD         │ AWS · Terraform · GuardDuty · Lambda',
      '  AI            │ Claude API · PyTorch · n8n · Pinecone',
      '  NETWORK       │ Palo Alto · Cisco IOS · Wireshark',
      '  PENTEST       │ Kali · Metasploit · Burp Suite · Nmap',
      '  CODE          │ Python · TypeScript · Bash · Flask',
      '  FRAMEWORKS    │ MITRE ATT&CK · NIST · OWASP · Kill Chain',
      '',
      '  Favorite tool: A blank terminal and a problem to solve.',
    ],
  },
  fun: {
    color: '#f97316',
    output: [
      '> Loading fun_facts.json...',
      '',
      '  [1] Joseph built BLUE SOC while taking',
      '      18 credits AND working part-time.',
      '',
      '  [2] He named his AI assistant PWEZA.',
      '      (Look it up. It is perfect.)',
      '',
      '  [3] His first computer had no internet.',
      '      He learned to code from PDFs.',
      '',
      '  [4] BLUE-X achieved 99.98% accuracy.',
      '      The 0.02% keeps him humble.',
      '',
      '  [5] He has never missed a deadline.',
      '      Ever. Not once.',
    ],
  },
  hire: {
    color: '#00f5d4',
    output: [
      '> Initiating hire sequence...',
      '',
      '  ╔═══════════════════════════════════╗',
      '  ║   JOSEPH IS AVAILABLE RIGHT NOW   ║',
      '  ╚═══════════════════════════════════╝',
      '',
      '  Target roles:',
      '  → SOC Analyst',
      '  → Security Engineer',
      '  → Cloud Security Engineer',
      '  → AI Security Engineer',
      '',
      '  Contact: kamarajosephallan@gmail.com',
      '  Response time: < 24 hours. Always.',
      '',
      '  Remote-first · Philadelphia PA',
      '  Available: Immediately',
    ],
  },
  flag: {
    color: '#00f5d4',
    output: [
      '> Initiating flag hunt...',
      '> Scanning portfolio architecture...',
      '> Checking hidden directories...',
      '> Analyzing source code...',
      '',
      '  ┌──────────────────────────────────────┐',
      '  │                                      │',
      '  │   FLAG{BLUE_SOC_ANALYST_VERIFIED}    │',
      '  │                                      │',
      '  └──────────────────────────────────────┘',
      '',
      '  You found it. Congratulations.',
      '  This proves you think like a security analyst.',
      '',
      '  Joseph does too. Hire him.',
      '  kamarajosephallan@gmail.com',
    ],
  },
  clear: {
    output: [],
  },
}

const ACTIVATION_SEQUENCE = ['j', 'a', 'k']

export default function EasterEggTerminal() {
  const [open, setOpen]           = useState(false)
  const [input, setInput]         = useState('')
  const [history, setHistory]     = useState<{ cmd: string; output: string[]; color?: string }[]>([])
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const [sequence, setSequence]   = useState<string[]>([])
  const [showHint, setShowHint]   = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Detect secret key sequence: J → A → K
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (open) return
      const key = e.key.toLowerCase()
      setSequence(prev => {
        const next = [...prev, key].slice(-3)
        if (next.join('') === ACTIVATION_SEQUENCE.join('')) {
          setOpen(true)
          return []
        }
        return next
      })
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open])

  // Show hint after 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(true), 30000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setHistory([{
        cmd: '',
        output: [
          '╔════════════════════════════════════════════╗',
          '║     BLUE SOC COMMAND TERMINAL — HIDDEN     ║',
          '║     Type "help" to see available commands  ║',
          '╚════════════════════════════════════════════╝',
          '',
          'Access granted. Welcome, operator.',
        ],
        color: '#00f5d4',
      }])
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase()
    if (!trimmed) return

    setCmdHistory(prev => [trimmed, ...prev])
    setHistoryIdx(-1)

    if (trimmed === 'clear') {
      setHistory([])
      setInput('')
      return
    }

    const result = EASTER_EGG_COMMANDS[trimmed] || {
      output: [
        `Command not found: ${trimmed}`,
        'Type "help" for available commands.',
      ],
      color: '#ef4444',
    }

    setHistory(prev => [...prev, { cmd: trimmed, output: result.output, color: result.color }])
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const idx = Math.min(historyIdx + 1, cmdHistory.length - 1)
      setHistoryIdx(idx)
      setInput(cmdHistory[idx] || '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const idx = Math.max(historyIdx - 1, -1)
      setHistoryIdx(idx)
      setInput(idx === -1 ? '' : cmdHistory[idx])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <>
      {/* Hint tooltip */}
      <AnimatePresence>
        {showHint && !open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-24 right-6 z-40 font-mono text-[9px] text-muted border border-[rgba(0,212,255,0.15)] px-3 py-2 bg-[rgba(2,8,24,0.9)] backdrop-blur-sm"
          >
            <span className="text-cyan">Hint:</span> Press J → A → K to unlock hidden terminal
            <button onClick={() => setShowHint(false)} className="ml-3 text-muted hover:text-cyan">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terminal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[560px] sm:h-[480px] z-[9990] flex flex-col"
            style={{
              background: '#000d1a',
              border: '1px solid rgba(0,212,255,0.3)',
              boxShadow: '0 0 60px rgba(0,212,255,0.2), 0 0 120px rgba(0,212,255,0.05)',
            }}
          >
            {/* Terminal bar */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[rgba(0,212,255,0.15)] shrink-0"
              style={{ background: 'rgba(0,212,255,0.05)' }}>
              <button onClick={() => setOpen(false)}
                className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="font-mono text-[10px] text-muted ml-2">jak@blue-soc — hidden-terminal</span>
              <span className="ml-auto font-mono text-[9px] text-[rgba(0,212,255,0.4)]">ESC to close</span>
            </div>

            {/* Output */}
            <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-6"
              onClick={() => inputRef.current?.focus()}>
              {history.map((entry, i) => (
                <div key={i} className="mb-3">
                  {entry.cmd && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-neon">❯</span>
                      <span className="text-[#e2eaff]">{entry.cmd}</span>
                    </div>
                  )}
                  {entry.output.map((line, j) => (
                    <div key={j} style={{ color: entry.color || '#8899aa' }}>
                      {line || <br />}
                    </div>
                  ))}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-[rgba(0,212,255,0.1)] shrink-0">
              <span className="text-neon font-mono text-[12px]">❯</span>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="type a command..."
                className="flex-1 bg-transparent font-mono text-[11px] text-[#e2eaff] placeholder-[#334155] outline-none"
                autoComplete="off"
                spellCheck={false}
              />
              <span className="font-mono text-[9px] text-muted opacity-50">↑↓ history</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
