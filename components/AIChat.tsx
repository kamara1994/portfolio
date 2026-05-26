'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_QUESTIONS = [
  'What projects has Joseph built?',
  'Is Joseph available to hire?',
  'What are his top skills?',
  'Tell me about BLUE SOC',
  'What certs does he have?',
]

export default function AIChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hey! I'm PWEZA. Ask me anything about Joseph — his projects, skills, or if you're looking to hire him." }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pulse, setPulse] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Trigger attention pulse every 8 seconds when chat is closed
  useEffect(() => {
    if (open) return
    const interval = setInterval(() => {
      setPulse(true)
      setTimeout(() => setPulse(false), 2000)
    }, 8000)
    // Initial pulse after 3s
    const initial = setTimeout(() => {
      setPulse(true)
      setTimeout(() => setPulse(false), 2000)
    }, 3000)
    return () => { clearInterval(interval); clearTimeout(initial) }
  }, [open])

  const send = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    const newMessages: Message[] = [...messages, { role: 'user', content: msg }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) })
      })
      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.content || data.error || 'Sorry, could not process that.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ── Floating button ── */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2">

        {/* Attention label — shows when not open */}
        <AnimatePresence>
          {!open && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2 px-3 py-1.5 border border-[rgba(0,212,255,0.3)] bg-[rgba(2,8,24,0.9)] backdrop-blur-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
              <span className="font-mono text-[9px] text-cyan tracking-[2px] uppercase whitespace-nowrap">
                Ask PWEZA
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main button */}
        <motion.button
          onClick={() => setOpen(o => !o)}
          className="relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #00d4ff, #00f5d4)',
            boxShadow: open
              ? '0 0 40px rgba(0,212,255,0.6), 0 0 80px rgba(0,212,255,0.2)'
              : '0 0 25px rgba(0,212,255,0.4)',
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          animate={pulse && !open ? {
            boxShadow: [
              '0 0 25px rgba(0,212,255,0.4)',
              '0 0 60px rgba(0,245,212,0.8), 0 0 120px rgba(0,212,255,0.4)',
              '0 0 25px rgba(0,212,255,0.4)',
            ],
            scale: [1, 1.12, 1],
          } : {}}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        >
          {/* Outer glow ring */}
          {!open && (
            <motion.div
              className="absolute inset-0 rounded-2xl"
              animate={{
                boxShadow: [
                  '0 0 0 0px rgba(0,212,255,0.4)',
                  '0 0 0 8px rgba(0,212,255,0)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
          {open ? (
            <span className="text-[#020818] font-bold text-xl">✕</span>
          ) : (
            <span className="text-[#020818] text-2xl">🤖</span>
          )}
        </motion.button>
      </div>

      {/* ── Chat panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-28 left-6 z-50 w-80 sm:w-96 overflow-hidden border border-[rgba(0,212,255,0.25)]"
            style={{
              background: 'rgba(3,10,25,0.98)',
              backdropFilter: 'blur(30px)',
              boxShadow: '0 0 60px rgba(0,212,255,0.15), 0 0 120px rgba(0,212,255,0.05)',
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-[rgba(0,212,255,0.1)] flex items-center gap-3"
              style={{ background: 'rgba(0,212,255,0.04)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.3), rgba(0,245,212,0.3))' }}>
                🤖
              </div>
              <div>
                <p className="font-mono text-[11px] font-bold text-cyan tracking-wider">PWEZA</p>
                <p className="font-mono text-[9px] text-muted">Powered by Claude · Ask me anything</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
                <span className="font-mono text-[9px] text-neon">ONLINE</span>
              </div>
            </div>

            {/* Messages */}
            <div className="h-64 overflow-y-auto p-3 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 text-[11px] leading-relaxed font-mono ${
                    m.role === 'user'
                      ? 'bg-[rgba(0,212,255,0.08)] text-cyan border border-[rgba(0,212,255,0.15)]'
                      : 'bg-[rgba(255,255,255,0.02)] text-[#8899aa] border border-[rgba(255,255,255,0.05)]'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="px-3 py-2 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick questions */}
            {messages.length === 1 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {QUICK_QUESTIONS.slice(0, 3).map(q => (
                  <button key={q} onClick={() => send(q)}
                    className="font-mono text-[9px] px-2 py-1 border border-[rgba(0,212,255,0.2)] text-cyan hover:border-[rgba(0,212,255,0.5)] hover:bg-[rgba(0,212,255,0.05)] transition-all">
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-[rgba(0,212,255,0.08)] flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Ask about Joseph..."
                className="flex-1 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] px-3 py-2 text-[11px] text-white placeholder-[#334155] outline-none focus:border-[rgba(0,212,255,0.3)] font-mono transition-colors"
              />
              <button onClick={() => send()}
                disabled={loading || !input.trim()}
                className="px-3 py-2 bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] hover:bg-[rgba(0,212,255,0.2)] transition-all disabled:opacity-40">
                <span className="text-cyan text-sm">→</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
