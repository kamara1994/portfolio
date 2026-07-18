'use client'
// @ts-nocheck
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

const commands = [
  { id: 'incident-lab',   label: 'Open Incident Replay Lab',  icon: '🛡️', action: 'navigate', target: '/incident-replay', tag: 'LAB' },
  { id: 'blue-soc',       label: 'View BLUE SOC Project',     icon: '🔵', action: 'scroll',   target: 'projects',          tag: 'PROJECT' },
  { id: 'pweza-project',  label: 'View PWEZA AI Agent',       icon: '🤖', action: 'navigate', target: '/projects/pweza-voice-agent', tag: 'PROJECT' },
  { id: 'projects',       label: 'Jump to Projects',          icon: '📁', action: 'scroll',   target: 'projects',          tag: 'SECTION' },
  { id: 'skills',         label: 'Jump to Skills',            icon: '⚡', action: 'scroll',   target: 'skills',            tag: 'SECTION' },
  { id: 'certs',          label: 'Jump to Certifications',    icon: '🏆', action: 'scroll',   target: 'certs',             tag: 'SECTION' },
  { id: 'experience',     label: 'Jump to Experience',        icon: '💼', action: 'scroll',   target: 'experience',        tag: 'SECTION' },
  { id: 'contact',        label: 'Jump to Contact',           icon: '📧', action: 'scroll',   target: 'contact',           tag: 'SECTION' },
  { id: 'resume',         label: 'Download Resume',           icon: '📄', action: 'navigate', target: '/resume/Joseph_Allan_Kamara_Resume_v3.pdf', tag: 'FILE' },
  { id: 'github',         label: 'Open GitHub',               icon: '🐙', action: 'external', target: 'https://github.com/kamara1994', tag: 'EXTERNAL' },
  { id: 'linkedin',       label: 'Open LinkedIn',             icon: '💼', action: 'external', target: 'https://linkedin.com/in/joseph-allan-kamara', tag: 'EXTERNAL' },
  { id: 'email',          label: 'Email Joseph',              icon: '✉️', action: 'external', target: 'mailto:kamarajosephallan@gmail.com', tag: 'CONTACT' },
  { id: 'role-recruiter', label: 'Switch to Recruiter View',  icon: '📋', action: 'role',     target: 'recruiter',         tag: 'VIEW' },
  { id: 'role-analyst',   label: 'Switch to SOC Analyst View',icon: '🛡️', action: 'role',     target: 'analyst',           tag: 'VIEW' },
  { id: 'role-engineer',  label: 'Switch to Engineer View',   icon: '⚙️', action: 'role',     target: 'engineer',          tag: 'VIEW' },
]

const tagColors: Record<string, string> = {
  LAB: '#00f5d4', PROJECT: '#00d4ff', SECTION: '#818cf8', FILE: '#f59e0b',
  EXTERNAL: '#8899bb', CONTACT: '#00f5d4', VIEW: '#a855f7',
}

/* ── LED edge ── */
function LedEdge({ position = 'top', colors = ['#00d4ff', '#00f5d4', '#818cf8'], width = 88, speed = 6, blur = 3 }) {
  const isTop = position === 'top'
  const inset = `${(100 - width) / 2}%`
  return (
    <>
      <div style={{
        position: 'absolute', [isTop ? 'top' : 'bottom']: -3, left: inset, right: inset, height: 6,
        background: `linear-gradient(90deg, transparent 0%, ${colors[0]} 25%, ${colors[1]} 50%, ${colors[2]} 75%, transparent 100%)`,
        filter: `blur(${blur}px)`, opacity: 0.6, pointerEvents: 'none', zIndex: 1,
      }} />
      <motion.div
        animate={{ backgroundPositionX: ['0%', '200%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute', [isTop ? 'top' : 'bottom']: 0, left: inset, right: inset, height: 1.3,
          background: `linear-gradient(90deg, transparent, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[0]}, ${colors[1]}, transparent)`,
          backgroundSize: '200% 100%',
          boxShadow: `0 0 6px ${colors[0]}, 0 0 14px ${colors[0]}55`,
          pointerEvents: 'none', borderRadius: 1, zIndex: 2,
        }}
      />
    </>
  )
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
        setOpen(o => !o); setQuery(''); setSelectedIdx(0)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50) }, [open])
  useEffect(() => { setSelectedIdx(0) }, [query])

  const execute = (cmd: typeof commands[0]) => {
    setOpen(false); setQuery('')
    if (cmd.action === 'scroll') {
      const el = document.getElementById(cmd.target); if (el) el.scrollIntoView({ behavior: 'smooth' })
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
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && filtered[selectedIdx]) { execute(filtered[selectedIdx]) }
  }

  return (
    <>
      {/* Bottom-right floating glass hint */}
      <motion.button
        onClick={() => { setOpen(true); setQuery(''); setSelectedIdx(0) }}
        whileHover={{ rotateY: 0, scale: 1.06, y: -3 }}
        initial={{ rotateY: 3, rotateX: 2 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        className="fixed bottom-6 right-6 hidden lg:flex items-center gap-2 font-mono relative overflow-hidden cursor-pointer"
        style={{
          zIndex: 40, transformStyle: 'preserve-3d',
          fontSize: 9, padding: '7px 12px', letterSpacing: 1, color: 'rgba(255,255,255,0.6)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.01) 60%, rgba(0,0,0,0.3))',
          backdropFilter: 'blur(16px) saturate(180%)', WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(0,212,255,0.22)', borderRadius: 8,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 6px 16px rgba(0,0,0,0.35), 0 0 14px rgba(0,212,255,0.2)',
          outline: 'none',
        }}
      >
        <LedEdge position="top" colors={['#00d4ff', '#00f5d4', '#818cf8']} width={75} speed={6} blur={2} />
        <span className="relative" style={{
          zIndex: 3, padding: '2px 6px', fontSize: 8.5, color: '#00d4ff',
          border: '1px solid rgba(0,212,255,0.35)', borderRadius: 4,
          background: 'rgba(0,212,255,0.08)',
        }}>⌘K</span>
        <span className="relative" style={{ zIndex: 3 }}>Command palette</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-start justify-center pt-[15vh] px-4"
            style={{ zIndex: 9998 }}
            onClick={() => setOpen(false)}
          >
            <div className="absolute inset-0" style={{ background: 'rgba(2,8,24,0.85)', backdropFilter: 'blur(8px)' }} />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.18 }}
              className="relative w-full max-w-xl overflow-hidden"
              style={{
                zIndex: 10,
                background: 'linear-gradient(160deg, rgba(8,14,32,0.94) 0%, rgba(3,8,22,0.97) 100%)',
                backdropFilter: 'blur(28px) saturate(200%)',
                WebkitBackdropFilter: 'blur(28px) saturate(200%)',
                border: '1.4px solid rgba(0,212,255,0.35)', borderRadius: 14,
                boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.35), 0 30px 60px rgba(0,0,0,0.6), 0 0 50px rgba(0,212,255,0.2)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <LedEdge position="top"    colors={['#00d4ff', '#fff',    '#00f5d4']} width={92} speed={5} blur={3} />
              <LedEdge position="bottom" colors={['#818cf8', '#a855f7', '#00d4ff']} width={92} speed={6} blur={3} />

              {/* Input header */}
              <div className="flex items-center gap-3 px-4 py-3 relative" style={{ borderBottom: '1px solid rgba(0,212,255,0.12)', background: 'linear-gradient(180deg, rgba(0,212,255,0.05), transparent)' }}>
                <span className="font-mono relative" style={{ zIndex: 3, fontSize: 11, color: '#00d4ff', textShadow: '0 0 6px #00d4ff' }}>❯</span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search commands, sections, projects..."
                  className="flex-1 font-mono relative bg-transparent outline-none"
                  style={{ zIndex: 3, fontSize: 13, color: '#e2eaff' }}
                />
                <span className="font-mono relative" style={{ zIndex: 3, fontSize: 9, color: 'rgba(255,255,255,0.5)', padding: '2px 7px', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 5, background: 'rgba(0,212,255,0.06)' }}>
                  ESC
                </span>
              </div>

              {/* Commands */}
              <div className="max-h-80 overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="px-4 py-10 text-center font-mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                    No commands found for &quot;{query}&quot;
                  </div>
                ) : (
                  filtered.map((cmd, i) => {
                    const selected = selectedIdx === i
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => execute(cmd)}
                        onMouseEnter={() => setSelectedIdx(i)}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 relative"
                        style={{
                          background: selected ? 'linear-gradient(90deg, rgba(0,212,255,0.10), rgba(0,212,255,0.02))' : 'transparent',
                          borderBottom: '1px solid rgba(0,212,255,0.05)',
                          borderLeft: selected ? '2px solid #00d4ff' : '2px solid transparent',
                          transition: 'background 0.15s, border-color 0.15s',
                          outline: 'none', cursor: 'pointer',
                        }}
                      >
                        <span className="text-base shrink-0" style={{ filter: selected ? `drop-shadow(0 0 6px ${tagColors[cmd.tag] || '#00d4ff'}55)` : 'none' }}>{cmd.icon}</span>
                        <span className="flex-1 font-mono" style={{ fontSize: 12, color: selected ? '#e2eaff' : 'rgba(255,255,255,0.7)' }}>{cmd.label}</span>
                        <span className="font-mono shrink-0 font-bold" style={{
                          fontSize: 8, padding: '3px 7px', letterSpacing: 1, borderRadius: 4,
                          color: tagColors[cmd.tag] || '#8899bb',
                          background: `${tagColors[cmd.tag] || '#8899bb'}18`,
                          border: `1px solid ${tagColors[cmd.tag] || '#8899bb'}40`,
                          boxShadow: selected ? `inset 0 1px 0 rgba(255,255,255,0.18), 0 0 8px ${tagColors[cmd.tag]}33` : 'inset 0 1px 0 rgba(255,255,255,0.12)',
                        }}>
                          {cmd.tag}
                        </span>
                        {selected && (
                          <span className="font-mono shrink-0" style={{
                            fontSize: 10, color: '#00d4ff',
                            padding: '2px 6px', border: '1px solid rgba(0,212,255,0.4)', borderRadius: 4,
                            background: 'rgba(0,212,255,0.08)',
                          }}>↵</span>
                        )}
                      </button>
                    )
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 flex items-center gap-4 relative" style={{
                borderTop: '1px solid rgba(0,212,255,0.1)',
                background: 'linear-gradient(0deg, rgba(0,212,255,0.04), transparent)',
              }}>
                {[
                  { k: '↑↓',  label: 'Navigate' },
                  { k: '↵',   label: 'Select' },
                  { k: 'esc', label: 'Close' },
                ].map(item => (
                  <span key={item.k} className="font-mono flex items-center gap-1.5" style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>
                    <span style={{
                      padding: '2px 6px', fontSize: 8, color: '#00d4ff',
                      border: '1px solid rgba(0,212,255,0.25)', borderRadius: 4,
                      background: 'rgba(0,212,255,0.06)',
                    }}>{item.k}</span>
                    {item.label}
                  </span>
                ))}
                <span className="ml-auto font-mono font-bold" style={{ fontSize: 9, color: '#00d4ff', letterSpacing: 1 }}>{filtered.length} commands</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
