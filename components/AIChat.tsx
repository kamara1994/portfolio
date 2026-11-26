'use client'
import { useEffect, useRef, useState } from 'react'
import PwezaMark from './PwezaMark'
import Link from 'next/link'
import { useRole } from './roles'

type ProofLink = { label: string; href: string }
type Msg = { role: 'user' | 'assistant' | 'joseph' | 'system'; content: string; links?: ProofLink[] }

/** Same visit ID the tracker uses, so Joseph can take over this chat from Telegram. */
function chatSid(): string {
  try {
    const v = JSON.parse(sessionStorage.getItem('pa-visit') || 'null')
    if (v?.sid) return v.sid
    let own = sessionStorage.getItem('pz-sid')
    if (!own) { own = Math.random().toString(36).slice(2, 12) + Date.now().toString(36); sessionStorage.setItem('pz-sid', own) }
    return own
  } catch { return '' }
}

const GREETING: Msg = {
  role: 'assistant',
  content: "Hi, I'm PWEZA, Joseph's portfolio assistant. I only answer from what's verified on this site, and I'll link you to the proof.",
}

const SUGGESTIONS: Record<string, string[]> = {
  default: ['Is he a fit for SOC roles?', 'What did he build on AWS?', 'What certifications does he have?', 'How do I contact him?'],
  recruiter: ['Is he available now?', 'What certifications does he have?', 'What are his main projects?', 'How do I contact him?'],
  soc: ['Is he a fit for SOC roles?', 'Tell me about BLUE SOC', 'What SOC skills has he used?', 'Does he have PSAA?'],
  engineer: ['What did he build on AWS?', 'Tell me about BLUE-X', 'Is he qualified for cloud security?', 'What are his skills?'],
}

/** PWEZA: verified-facts portfolio assistant. Text chat, optional voice in/out, proof links. */
export default function AIChat() {
  const role = useRole()
  const [hidden, setHidden] = useState(false)
  useEffect(() => { setHidden(window.location.pathname.startsWith('/tg/')) }, [])
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([GREETING])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [voiceOut, setVoiceOut] = useState(false)
  const [listening, setListening] = useState(false)
  const [canListen, setCanListen] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recRef = useRef<any>(null)
  const [live, setLive] = useState(false)
  const liveAfter = useRef(0)
  const wasLive = useRef(false)

  // Joseph can take over from Telegram: poll for his messages while the chat is open (or he's live).
  useEffect(() => {
    if (!open && !live) return
    let stop = false
    const tick = async () => {
      const sid = chatSid()
      if (!sid || stop) return
      try {
        const r = await fetch(`/api/chat/live?sid=${encodeURIComponent(sid)}&after=${liveAfter.current}`, { cache: 'no-store' })
        const d = await r.json()
        liveAfter.current = d.next ?? liveAfter.current
        const incoming: Msg[] = []
        for (const m of d.messages || []) {
          if (m.t === '__joined__') incoming.push({ role: 'system', content: 'Joseph joined the chat 👋' })
          else if (m.t === '__handback__') incoming.push({ role: 'system', content: 'Joseph handed you back to PWEZA.' })
          else incoming.push({ role: 'joseph', content: m.t })
        }
        if (incoming.length) { setMessages((cur) => [...cur, ...incoming]); setOpen(true) }
        if (!!d.live !== wasLive.current) { wasLive.current = !!d.live; setLive(!!d.live) }
      } catch { /* try again next tick */ }
    }
    tick()
    const t = setInterval(tick, live ? 2500 : 5000)
    return () => { stop = true; clearInterval(t) }
  }, [open, live])

  // Show the launcher after the hero, hide it over the footer
  useEffect(() => {
    const onScroll = () => {
      const f = document.getElementById('contact')
      const nearFooter = !!f && f.getBoundingClientRect().top < window.innerHeight
      setVisible(window.scrollY > window.innerHeight * 0.5 && !nearFooter)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    setCanListen('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }) }, [messages, loading])
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 150) }, [open])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  useEffect(() => {
    const toggle = () => setOpen((o) => !o)
    window.addEventListener('pweza:toggle', toggle)
    return () => window.removeEventListener('pweza:toggle', toggle)
  }, [])
  useEffect(() => { if (!open) { audioRef.current?.pause(); recRef.current?.stop?.() } }, [open])

  const send = async (text: string) => {
    const q = text.trim()
    if (!q || loading) return
    const next: Msg[] = [...messages, { role: 'user', content: q }]
    setMessages(next)
    setInput('')
    setLoading(true)
    window.dispatchEvent(new Event('pweza-asked'))
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.slice(1).filter((m) => m.role === 'user' || m.role === 'assistant' || m.role === 'joseph').map(({ role, content }) => ({ role: role === 'joseph' ? 'assistant' : role, content })),
          wantsAudio: voiceOut,
          sid: chatSid(),
        }),
      })
      const data = await res.json()
      if (data.live) { setLive(true); wasLive.current = true; return } // Joseph will answer himself
      const reply = data.content || data.error || "I couldn't answer that right now. You can email Joseph at kamarajosephallan@gmail.com."
      setMessages((m) => [...m, { role: 'assistant', content: reply, links: data.links }])
      if (voiceOut && data.audio) {
        audioRef.current?.pause()
        audioRef.current = new Audio(data.audio)
        audioRef.current.play().catch(() => {})
      }
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: "Connection problem. Try again, or email kamarajosephallan@gmail.com." }])
    } finally {
      setLoading(false)
    }
  }

  const listen = () => {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (!SR) return
    if (listening) { recRef.current?.stop(); return }
    const r = new SR()
    r.lang = 'en-US'
    r.interimResults = false
    r.onstart = () => setListening(true)
    r.onend = () => setListening(false)
    r.onerror = () => setListening(false)
    r.onresult = (e: any) => {
      const said = e.results?.[0]?.[0]?.transcript ?? ''
      if (said) { setVoiceOut(true); send(said) }
    }
    recRef.current = r
    r.start()
  }

  const suggestions = SUGGESTIONS[role ?? 'default'] ?? SUGGESTIONS.default
  const asked = new Set(messages.filter((m) => m.role === 'user').map((m) => m.content))

  if (hidden) return null
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="pweza-panel"
        tabIndex={visible || open ? 0 : -1}
        className={`pz-launch ${visible || open ? 'is-on' : ''}`}
      >
        <PwezaMark size={28} />
        {open ? 'Close' : 'Ask my AI assistant'}
      </button>

      <section id="pweza-panel" aria-label="PWEZA assistant" className={`pz-panel ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <PwezaMark size={36} />
            <div>
              <p className="text-[15px] font-semibold text-snow">PWEZA</p>
              <p className="text-[12px] text-smoke">Answers only from verified facts</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => { setVoiceOut((v) => !v); audioRef.current?.pause() }} aria-pressed={voiceOut} className="pz-icon" title={voiceOut ? 'Voice replies on' : 'Voice replies off'}>
              <svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 9v6h4l5 4V5L8 9z" />
                {voiceOut ? <path d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11" /> : <path d="M17 9l4 6M21 9l-4 6" />}
              </svg>
              <span className="sr-only">{voiceOut ? 'Turn voice replies off' : 'Turn voice replies on'}</span>
            </button>
            <button type="button" onClick={() => setOpen(false)} className="pz-icon" aria-label="Close assistant">
              <svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
        </header>

        <div ref={listRef} className="pz-list" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'pz-msg pz-user' : m.role === 'joseph' ? 'pz-msg pz-bot pz-joseph' : m.role === 'system' ? 'pz-system' : 'pz-msg pz-bot'}>
              {m.role === 'joseph' && <span className="pz-joseph-name">Joseph</span>}
              <p>{m.content}</p>
              {!!m.links?.length && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {m.links.map((l) =>
                    l.href.startsWith('/') && !l.href.endsWith('.pdf') ? (
                      <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="pz-proof">{l.label}</Link>
                    ) : (
                      <a key={l.href} href={l.href} target={l.href.startsWith('mailto') ? undefined : '_blank'} rel="noopener" className="pz-proof">{l.label}</a>
                    ),
                  )}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="pz-msg pz-bot" aria-label="PWEZA is typing">
              <span className="pz-typing"><i /><i /><i /></span>
            </div>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto px-4 pb-2 pt-1">
          {suggestions.filter((s) => !asked.has(s)).map((s) => (
            <button key={s} type="button" onClick={() => send(s)} className="pz-chip">{s}</button>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(input) }} className="flex items-center gap-2 border-t border-line p-3">
          <label htmlFor="pz-input" className="sr-only">Ask about Joseph</label>
          <input id="pz-input" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about his work, skills, or fit" className="pz-input" maxLength={500} autoComplete="off" />
          {canListen && (
            <button type="button" onClick={listen} className={`pz-icon ${listening ? 'is-live' : ''}`} aria-pressed={listening} aria-label={listening ? 'Stop listening' : 'Ask by voice'}>
              <svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0014 0M12 18v3" />
              </svg>
            </button>
          )}
          <button type="submit" disabled={!input.trim() || loading} className="pz-send" aria-label="Send">
            <svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </form>
      </section>
    </>
  )
}
