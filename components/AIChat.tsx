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
    { role: 'assistant', content: "Hey! I'm JAK-AI. Ask me anything about Joseph — his projects, skills, or if you're looking to hire him." }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      })

      const data = await response.json()
      const reply = data.content || data.error || 'Sorry, I could not process that request.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <motion.button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
        style={{ background: 'linear-gradient(135deg, #00d4ff, #00f5d4)', boxShadow: '0 0 25px rgba(0,212,255,0.3)' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {open ? (
          <span className="text-[#020818] font-bold text-lg">✕</span>
        ) : (
          <span className="text-[#020818] text-xl">🤖</span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-6 z-50 w-80 sm:w-96 rounded-2xl overflow-hidden border border-cyan-500/20"
            style={{ background: 'rgba(3,10,25,0.97)', backdropFilter: 'blur(30px)', boxShadow: '0 0 40px rgba(0,212,255,0.1)' }}
          >
            <div className="px-4 py-3 border-b border-[rgba(0,212,255,0.08)] flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/60 to-blue-600/60 flex items-center justify-center text-sm">🤖</div>
              <div>
                <p className="font-mono text-[11px] font-bold text-cyan tracking-wider">JAK-AI</p>
                <p className="font-mono text-[9px] text-muted">Powered by Claude · Ask me anything</p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="font-mono text-[9px] text-green-400">ONLINE</span>
              </div>
            </div>

            <div className="h-64 overflow-y-auto p-3 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-[11px] leading-relaxed font-mono ${
                    m.role === 'user'
                      ? 'bg-cyan-500/10 text-cyan-200 border border-cyan-500/15'
                      : 'bg-white/[0.03] text-gray-400 border border-white/[0.05]'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {messages.length === 1 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {QUICK_QUESTIONS.slice(0, 3).map(q => (
                  <button key={q} onClick={() => send(q)}
                    className="font-mono text-[9px] px-2 py-1 border border-cyan-500/20 text-cyan-400/70 rounded-lg hover:border-cyan-500/40 hover:text-cyan-400 transition-all">
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div className="p-3 border-t border-[rgba(0,212,255,0.08)] flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Ask about Joseph..."
                className="flex-1 bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2 text-[11px] text-white placeholder-gray-700 outline-none focus:border-cyan-500/20 font-mono"
              />
              <button onClick={() => send()}
                disabled={loading || !input.trim()}
                className="px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/15 hover:bg-cyan-500/20 transition-all disabled:opacity-40">
                <span className="text-cyan text-sm">→</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}