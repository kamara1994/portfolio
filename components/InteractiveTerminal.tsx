'use client'
import { useState, useRef, useEffect } from 'react'

const COMMANDS: Record<string, string[]> = {
  whoami: ['Joseph Allan Kamara','Cybersecurity Engineer | AI Security Builder','BYU-Idaho · Graduating April 2026','Location: Philadelphia, PA (Remote-first)'],
  'cat skills.txt': ['Security Operations: Splunk, Security Onion, Threat Hunting','Cloud Security: AWS GuardDuty, Terraform, WAF, Lambda','Penetration Testing: Kali, Metasploit, Burp Suite, Nmap','AI Security: PyTorch, Claude LLM, n8n Multi-Agent','Networking: Cisco CCNA, OSPF, VRRP, EtherChannel'],
  'ls projects/': ['drwxr-xr-x  BLUE-SOC-P8/','drwxr-xr-x  FORTRESS-v2/','drwxr-xr-x  BLUE-X/','drwxr-xr-x  CVE-Scanner/','drwxr-xr-x  BLUE-v3/','drwxr-xr-x  Enterprise-Networking/','... and 5 more projects'],
  'cat certs.txt': ['✓ CompTIA Security+','✓ CompTIA PenTest+','✓ Cisco CCNA','✓ TCM Practical SOC Analyst Associate','⟳ AWS Security Specialty (In Progress)'],
  './status.sh': ['OPEN TO WORK ✓','Available: May 2026','Target: SOC Analyst | Security Engineer | AI Security','Remote-first preferred · Open to hybrid','Response time: < 24 hours'],
  'cat contact.txt': ['Email: kamarajosephallan@gmail.com','LinkedIn: linkedin.com/in/joseph-allan-kamara','GitHub: github.com/kamara1994','Portfolio: josephkamara.vercel.app'],
  help: ['Available commands:','  whoami          — Who is Joseph?','  cat skills.txt  — Technical skills','  ls projects/    — View all projects','  cat certs.txt   — Certifications','  ./status.sh     — Availability status','  cat contact.txt — Contact info','  clear           — Clear terminal'],
  clear: [],
}

interface Line { type: 'input' | 'output' | 'error'; text: string }

export default function InteractiveTerminal() {
  const [lines, setLines] = useState<Line[]>([
    { type: 'output', text: 'BLUE Terminal v3.0 — Type "help" for commands' },
    { type: 'output', text: '─────────────────────────────────────────' },
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [lines])

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase()
    const newLines: Line[] = [...lines, { type: 'input', text: cmd }]
    if (trimmed === 'clear') { setLines([{ type: 'output', text: 'BLUE Terminal v3.0 — Type "help" for commands' }]); setInput(''); return }
    if (COMMANDS[trimmed]) { COMMANDS[trimmed].forEach(line => newLines.push({ type: 'output', text: line })) }
    else if (trimmed !== '') { newLines.push({ type: 'error', text: `Command not found: ${cmd}. Type "help" for commands.` }) }
    setLines(newLines); setHistory(h => [cmd, ...h]); setHistIdx(-1); setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { handleCommand(input) }
    else if (e.key === 'ArrowUp') { const idx = Math.min(histIdx + 1, history.length - 1); setHistIdx(idx); setInput(history[idx] || '') }
    else if (e.key === 'ArrowDown') { const idx = Math.max(histIdx - 1, -1); setHistIdx(idx); setInput(idx === -1 ? '' : history[idx]) }
  }

  return (
    <div className="terminal-box overflow-hidden cursor-text" onClick={() => inputRef.current?.focus()}>
      <div className="terminal-bar">
        <div className="terminal-dot bg-red-500" /><div className="terminal-dot bg-yellow-400" /><div className="terminal-dot bg-green-400" />
        <span className="font-mono text-[10px] text-muted ml-2">jak@soc-terminal — ~</span>
      </div>
      <div className="bg-[#000d1a] h-[280px] overflow-y-auto p-4 space-y-1">
        {lines.map((line, i) => (
          <div key={i} className="font-mono text-[11px] leading-relaxed">
            {line.type === 'input' && <span><span className="text-neon">❯ </span><span className="text-cyan">{line.text}</span></span>}
            {line.type === 'output' && <span className="text-[#8899bb]">{line.text}</span>}
            {line.type === 'error' && <span className="text-red-400">{line.text}</span>}
          </div>
        ))}
        <div className="flex items-center gap-1 font-mono text-[11px]">
          <span className="text-neon">❯ </span>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-cyan outline-none caret-cyan" spellCheck={false} autoComplete="off" />
        </div>
        <div ref={bottomRef} />
      </div>
      <div className="px-4 py-2 border-t border-[rgba(0,212,255,0.08)] flex gap-3 flex-wrap">
        {['whoami', 'ls projects/', 'cat certs.txt', './status.sh', 'help'].map(cmd => (
          <button key={cmd} onClick={() => handleCommand(cmd)} className="font-mono text-[9px] text-cyan2 hover:text-cyan transition-colors tracking-wider">{cmd}</button>
        ))}
      </div>
    </div>
  )
}
