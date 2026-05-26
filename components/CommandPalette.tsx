'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

const commands = [
  { id: 'incident-lab', label: 'Open Incident Replay Lab', icon: '🛡️', action: 'navigate', target: '/incident-replay', tag: 'LAB' },
  { id: 'blue-soc', label: 'View BLUE SOC Project', icon: '🔵', action: 'scroll', target: 'projects', tag: 'PROJECT' },
  { id: 'projects', label: 'Jump to Projects', icon: '📁', action: 'scroll', target: 'projects', tag: 'SECTION' },
  { id: 'skills', label: 'Jump to Skills', icon: '⚡', action: 'scroll', target: 'skills', tag: 'SECTION' },
  { id: 'certs', label: 'Jump to Certifications', icon: '🏆', action: 'scroll', target: 'certs', tag: 'SECTION' },
  { id: 'experience', label: 'Jump to Experience', icon: '💼', action: 'scroll', target: 'experience', tag: 'SECTION' },
  { id: 'contact', label: 'Jump to Contact', icon: '📧', action: 'scroll', target: 'contact', tag: 'SECTION' },
  { id: 'resume', label: 'Download Resume', icon: '📄', action: 'navigate', target: '/resume/Joseph_Allan_Kamara_Resume_v3.pdf', tag: 'FILE' },
  { id: 'github', label: 'Open GitHub', icon: '🐙', action: 'external', target: 'https://github.com/kamara1994', tag: 'EXTERNAL' },
  { id: 'linkedin', label: 'Open LinkedIn', icon: '💼', action: 'external', target: 'https://linkedin.com/in/joseph-allan-kamara', tag: 'EXTERNAL' },
  { id: 'email', label: 'Email Joseph', icon: '✉️', action: 'external', target: 'mailto:kamarajosephallan@gmail.com', tag: 'CONTACT' },
  { id: 'role-recruiter', label: 'Switch to Recruiter View', icon: '📋', action: 'role', target: 'recruiter', tag: 'VIEW' },
  { id: 'role-analyst', label: 'Switch to SOC Analyst View', icon: '🛡️', action: 'role', target: 'analyst', tag: 'VIEW' },
  { id: 'role-engineer', label: 'Switch to Engineer View', icon: '⚙️', action: 'role', target: 'engineer', tag: 'VIEW' },
]

const tagColors: Record<string, string> = {
  LAB: '#00f5d4',
  PROJECT: '#00d4ff',
  SECTION: '#818cf8',
  FILE: '#f59e0b',
  EXTERNAL: '#8899bb',
  CONTACT: '#00f5d4',
  VIEW: '#a855f7',
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.tag.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
        setQuery('')
        setSelectedIdx(0)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    setSelectedIdx(0)
  }, [query])

  const execute = (cmd: typeof commands[0]) => {
    setOpen(false)
    setQuery('')
    if (cmd.action === 'scroll') {
      const el = document.getElementById(cmd.target)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else if (cmd.action === 'navigate') {
      router.push(cmd.target)
    } else if (cmd.action === 'external') {
      window.open(cmd.target, '_blank')
    } else if (cmd.action === 'role') {
      const url = new URL(window.location.href)
      url.searchParams.set('role', cmd.target)
      router.replace(url.pathname + url.search, { scroll: false })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && filtered[selectedIdx]) {
      execute(filtered[selectedIdx])
    }
  }

  return (
    <>
      {/* Keyboard hint — bottom right */}
      <div className="fixed bottom-6 right-6 z-40 hidden lg:flex items-center gap-2 font-mono text-[9px] text-muted border border-[rgba(0,212,255,0.1)] px-3 py-1.5 bg-[rgba(2,8,24,0.8)] backdrop-blur-sm">
        <span className="px-1 py-0.5 border border-[rgba(0,212,255,0.2)] text-[8px]">⌘K</span>
        <span>Command palette</span>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] flex items-start justify-center pt-[15vh] px-4"
            onClick={() => setOpen(false)}
          >
            <div className="absolute inset-0 bg-[rgba(2,8,24,0.85)] backdrop-blur-sm" />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.15 }}
              className="relative z-10 w-full max-w-xl border border-[rgba(0,212,255,0.25)] overflow-hidden"
              style={{ background: 'rgba(3,10,25,0.99)', boxShadow: '0 0 60px rgba(0,212,255,0.15)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(0,212,255,0.1)]">
                <span className="font-mono text-[10px] text-cyan">❯</span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search commands, sections, projects..."
                  className="flex-1 bg-transparent font-mono text-[13px] text-[#e2eaff] placeholder-[#334155] outline-none"
                />
                <span className="font-mono text-[9px] text-muted border border-[rgba(0,212,255,0.15)] px-1.5 py-0.5">ESC</span>
              </div>

              {/* Commands */}
              <div className="max-h-80 overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="px-4 py-8 text-center font-mono text-[11px] text-muted">
                    No commands found for &quot;{query}&quot;
                  </div>
                ) : (
                  filtered.map((cmd, i) => (
                    <button
                      key={cmd.id}
                      onClick={() => execute(cmd)}
                      onMouseEnter={() => setSelectedIdx(i)}
                      className="w-full text-left flex items-center gap-3 px-4 py-3 transition-colors border-b border-[rgba(0,212,255,0.05)] last:border-b-0"
                      style={{ background: selectedIdx === i ? 'rgba(0,212,255,0.06)' : 'transparent' }}
                    >
                      <span className="text-base shrink-0">{cmd.icon}</span>
                      <span className="flex-1 font-mono text-[12px] text-[#b0c4d8]">{cmd.label}</span>
                      <span className="font-mono text-[8px] px-2 py-0.5 shrink-0"
                        style={{ color: tagColors[cmd.tag] || '#8899bb', background: `${tagColors[cmd.tag]}15` }}>
                        {cmd.tag}
                      </span>
                      {selectedIdx === i && (
                        <span className="font-mono text-[9px] text-muted shrink-0 border border-[rgba(0,212,255,0.15)] px-1">↵</span>
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-[rgba(0,212,255,0.08)] flex items-center gap-4 bg-[rgba(0,212,255,0.02)]">
                <span className="font-mono text-[9px] text-muted flex items-center gap-1.5">
                  <span className="border border-[rgba(0,212,255,0.2)] px-1 text-[8px]">↑↓</span> Navigate
                </span>
                <span className="font-mono text-[9px] text-muted flex items-center gap-1.5">
                  <span className="border border-[rgba(0,212,255,0.2)] px-1 text-[8px]">↵</span> Select
                </span>
                <span className="font-mono text-[9px] text-muted flex items-center gap-1.5">
                  <span className="border border-[rgba(0,212,255,0.2)] px-1 text-[8px]">esc</span> Close
                </span>
                <span className="ml-auto font-mono text-[9px] text-muted">{filtered.length} commands</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
