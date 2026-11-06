'use client'
// @ts-nocheck
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message { role: 'user' | 'assistant'; content: string }

const QUICK_QUESTIONS = [
  'Give me Joseph\'s strongest project.',
  'Is Joseph a fit for SOC roles?',
  'Explain BLUE-X in plain English.',
  'What should recruiters know?',
]

const GREETING = "I'm PWEZA, Joseph's portfolio assistant. I can brief you on his projects, skills, certifications, hiring fit, or walk you straight to the strongest proof on this site."

// How long (ms) to keep the mic OFF after PWEZA stops talking, so the dying
// echo of its own voice on speakers can't get captured and answered.
const SPEECH_COOLDOWN = 800
const VOICE_PAUSE_TO_SEND = 1100
const TRANSCRIPT_MIN_CONFIDENCE = 0.35

export default function AIChat() {
  const [open, setOpen]                     = useState(false)
  const [scrolled, setScrolled]             = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.5)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const [messages, setMessages]             = useState<Message[]>([{ role: 'assistant', content: GREETING }])
  const [input, setInput]                   = useState('')
  const [loading, setLoading]               = useState(false)
  const [listening, setListening]           = useState(false)
  const [speaking, setSpeaking]             = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [voiceMode, setVoiceMode]           = useState<'voice' | 'text'>('text')
  const [greeted, setGreeted]               = useState(false)

  const bottomRef        = useRef<HTMLDivElement>(null)
  const messagesRef      = useRef<Message[]>([{ role: 'assistant', content: GREETING }])
  const recognitionRef   = useRef<any>(null)
  const listenTimerRef    = useRef<any>(null)
  const transcriptTimerRef = useRef<any>(null)
  const transcriptRef     = useRef('')
  const voiceModeRef     = useRef<'voice' | 'text'>('text')
  const audioRef         = useRef<HTMLAudioElement | null>(null)
  const speakingRef      = useRef(false)
  const loadingRef       = useRef(false)
  const listeningRef     = useRef(false)
  const lastSpeechEndRef = useRef(0)      // timestamp of when PWEZA last stopped talking
  const openRef          = useRef(false)  // is the chat panel open? gates the whole voice loop

  useEffect(() => { voiceModeRef.current = voiceMode }, [voiceMode])
  useEffect(() => { speakingRef.current  = speaking },  [speaking])
  useEffect(() => { loadingRef.current   = loading },   [loading])
  useEffect(() => { listeningRef.current = listening }, [listening])
  useEffect(() => { openRef.current      = open },      [open])
  useEffect(() => { messagesRef.current   = messages }, [messages])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => {
    const supported = typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
    setVoiceSupported(supported)
  }, [])


  const clearListenTimer = () => {
    if (listenTimerRef.current) clearTimeout(listenTimerRef.current)
    listenTimerRef.current = null
  }

  const clearTranscriptTimer = () => {
    if (transcriptTimerRef.current) clearTimeout(transcriptTimerRef.current)
    transcriptTimerRef.current = null
  }

  const stopSpeaking = () => {
    if (audioRef.current) { try { audioRef.current.pause() } catch {} ; audioRef.current = null }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
    speakingRef.current = false
    setSpeaking(false)
    lastSpeechEndRef.current = Date.now()   // start the cooldown so the mic doesn't grab the cut-off tail
  }

  const speak = (text: string, audioDataUrl?: string | null, onEnd?: () => void) => {
    stopSpeaking()

    // Mic is OFF the whole time PWEZA talks - it literally cannot hear itself.
    const begin  = () => { speakingRef.current = true;  setSpeaking(true);  stopListening() }
    const finish = () => {
      speakingRef.current = false; setSpeaking(false)
      lastSpeechEndRef.current = Date.now()
      onEnd?.()
    }

    if (audioDataUrl) {
      try {
        const audio = new Audio(audioDataUrl)
        audio.playbackRate = 1.04
        audio.preservesPitch = true
        audio.onplay  = begin
        audio.onended = finish
        audio.onerror = finish
        audio.play().catch(finish)
        audioRef.current = audio
        return
      } catch { /* fall through to browser TTS */ }
    }
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) { onEnd?.(); return }
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 1.08; u.pitch = 1.03; u.volume = 0.96
    const voices = window.speechSynthesis.getVoices()
    const v = voices.find(x => x.name.includes('Samantha') || x.name.includes('Karen') || x.name.includes('Google US') || x.lang === 'en-US')
    if (v) u.voice = v
    u.onstart = begin
    u.onend   = finish
    u.onerror = finish
    window.speechSynthesis.speak(u)
  }

  const fetchTTS = async (text: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
      if (!res.ok) return null
      const data = await res.json()
      return data.audio || null
    } catch { return null }
  }

  /* -- listening: ONLY runs when PWEZA is silent and past the cooldown -- */
  const startListening = () => {
    if (typeof window === 'undefined') return
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (!SR) return
    if (!openRef.current) return             // panel closed - never listen
    if (voiceModeRef.current !== 'voice') return
    if (speakingRef.current) return          // never listen while audio is playing
    if (loadingRef.current) return           // never listen while waiting on a reply
    if (listeningRef.current) return         // already running

    // If PWEZA only just finished, wait out the cooldown before opening the mic.
    const since = Date.now() - lastSpeechEndRef.current
    if (since < SPEECH_COOLDOWN) {
      clearListenTimer()
      listenTimerRef.current = setTimeout(() => startListening(), SPEECH_COOLDOWN - since + 50)
      return
    }

    clearListenTimer()
    try { recognitionRef.current?.stop() } catch {}

    const r = new SR()
    r.continuous     = true
    r.interimResults = false
    r.lang           = 'en-US'

    r.onstart  = () => {
      listeningRef.current = true
      setListening(true)
      clearListenTimer()
    }
    r.onresult = (e: any) => {
      const accepted: string[] = []
      for (let i = e.resultIndex || 0; i < (e.results?.length || 0); i++) {
        const item = e.results[i]
        if (!item?.isFinal) continue
        const result = item[0]
        const transcript = (result?.transcript || '').trim()
        const confidence = typeof result?.confidence === 'number' ? result.confidence : 1
        if (transcript && (confidence === 0 || confidence >= TRANSCRIPT_MIN_CONFIDENCE)) accepted.push(transcript)
      }
      if (!accepted.length || Date.now() - lastSpeechEndRef.current < SPEECH_COOLDOWN) return

      transcriptRef.current = `${transcriptRef.current} ${accepted.join(' ')}`.trim()
      clearTranscriptTimer()
      transcriptTimerRef.current = setTimeout(() => {
        const fullThought = transcriptRef.current.trim()
        transcriptRef.current = ''
        if (fullThought && voiceModeRef.current === 'voice') send(fullThought, 'voice')
      }, VOICE_PAUSE_TO_SEND)
    }
    r.onerror  = (event: any) => {
      clearListenTimer()
      if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
        setVoiceMode('text'); voiceModeRef.current = 'text'
        listeningRef.current = false; setListening(false)
      }
    }
    r.onend    = () => {
      if (recognitionRef.current === r) recognitionRef.current = null
      const manuallyStopped = r.__pwezaManualStop === true
      if (manuallyStopped || voiceModeRef.current !== 'voice' || !openRef.current || speakingRef.current || loadingRef.current) {
        listeningRef.current = false; setListening(false)
        return
      }

      // Browsers occasionally end long-running recognition sessions. Keep the
      // voice session visually active and reconnect without another user tap.
      listeningRef.current = false
      setListening(true)
      clearListenTimer()
      listenTimerRef.current = setTimeout(() => startListening(), 250)
    }

    try { r.start(); recognitionRef.current = r } catch {}
  }

  const stopListening = () => {
    clearListenTimer()
    clearTranscriptTimer()
    transcriptRef.current = ''
    const recognition = recognitionRef.current
    if (recognition) recognition.__pwezaManualStop = true
    try { recognition?.stop() } catch {}
    recognitionRef.current = null
    listeningRef.current = false
    setListening(false)
  }

  const send = async (text?: string, mode: 'voice' | 'text' = voiceModeRef.current) => {
    const msg = (text ?? input).trim()
    if (!msg || loadingRef.current) return

    setVoiceMode(mode); voiceModeRef.current = mode
    stopSpeaking()
    stopListening()
    loadingRef.current = true

    const newMessages: Message[] = [...messagesRef.current, { role: 'user', content: msg }]
    setMessages(newMessages); setInput(''); setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          wantsAudio: mode === 'voice',
        })
      })
      const data = await res.json()
      const reply = (data.content || data.error || "I couldn't reach the full brain for a second, but I'm still here. Try that again and I'll tighten it up.").trim()
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])

      if (mode === 'voice') {
        speak(reply, data.audio, () => {
          if (voiceModeRef.current === 'voice') setTimeout(() => startListening(), 350)
        })
      }
    } catch {
      const fallback = 'Connection hiccup on my side. Ask again in a second, or try one of the quick prompts below.'
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }])
      if (mode === 'voice') speak(fallback, null, () => {
        if (voiceModeRef.current === 'voice') setTimeout(() => startListening(), 350)
      })
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!open || greeted) return
    setGreeted(true)
    ;(async () => {
      const audioUrl = '/pweza-greeting.mp3'
      speak(GREETING, audioUrl, () => {
        if (voiceModeRef.current === 'voice') setTimeout(() => startListening(), 350)
      })
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleInputChange = (e: any) => {
    const v = e.target.value
    setInput(v)
    if (v.length > 0 && voiceModeRef.current === 'voice') {
      setVoiceMode('text'); voiceModeRef.current = 'text'
      stopSpeaking(); stopListening()
    }
  }

  const toggleOpen = () => {
    if (open) { openRef.current = false; stopSpeaking(); stopListening() }
    else { openRef.current = true }
    setOpen(o => !o)
  }

  const handleMicClick = () => {
    if (!voiceSupported) return
    if (speakingRef.current) { cutIn(); return }
    if (voiceModeRef.current === 'voice') return
    setVoiceMode('voice'); voiceModeRef.current = 'voice'
    startListening()
  }

  // "Cut in" - interrupt PWEZA mid-reply, then reopen the mic after the cooldown.
  const cutIn = () => {
    stopSpeaking()
    setVoiceMode('voice'); voiceModeRef.current = 'voice'
    setTimeout(() => startListening(), SPEECH_COOLDOWN + 50)
  }

  const replayMessage = async (text: string) => {
    const audioUrl = await fetchTTS(text)
    speak(text, audioUrl)
  }

  return (
    <>
      <button
        type="button"
        onClick={toggleOpen}
        aria-label={open ? 'Close PWEZA chat' : 'Open PWEZA chat'}
        tabIndex={scrolled || open ? 0 : -1}
        className={`fixed bottom-5 right-5 z-[999999] flex h-12 items-center gap-3 border border-line bg-panel/95 px-5 text-[15px] font-semibold text-snow backdrop-blur transition-[opacity,transform,background-color] duration-300 hover:bg-raised ${scrolled || open ? 'opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}
      >
        <span aria-hidden className="h-2 w-2 rounded-full bg-signal" />
        {open ? 'Close' : <><span className="md:hidden">Ask AI</span><span className="hidden md:inline">Ask my AI assistant</span></>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            style={{
              position: 'fixed', bottom: 84, right: 20, width: 360, maxWidth: 'calc(100vw - 48px)',
              zIndex: 999998,
              background: 'rgba(11,17,29,0.98)',
              backdropFilter: 'blur(30px) saturate(180%)',
              WebkitBackdropFilter: 'blur(30px) saturate(180%)',
              border: '1px solid rgba(150,170,210,0.16)', borderRadius: 0,
              boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
              overflow: 'hidden',
            }}>
            <motion.div
              animate={{ backgroundPositionX: ['0%', '200%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute', top: 0, left: '8%', right: '8%', height: 1.4,
                background: 'linear-gradient(90deg, transparent, #EEF2F8, #fff, #7FA6FF, #EEF2F8, transparent)',
                backgroundSize: '200% 100%',
                boxShadow: '0 0 6px #EEF2F8, 0 0 14px rgba(150,170,210,0.4)',
                pointerEvents: 'none', borderRadius: 1,
              }}
            />

            <div className="flex items-center gap-3" style={{ padding: '12px 14px', borderBottom: '1px solid rgba(150,170,210,0.1)', background: 'rgba(150,170,210,0.04)' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(150,170,210,0.4), rgba(127,166,255,0.4))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>🤖</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="font-sans font-bold tracking-wider" style={{ fontSize: 11, color: '#EEF2F8', margin: 0 }}>PWEZA</p>
                <p className="font-sans" style={{ fontSize: 9, color: '#8D97AA', margin: 0 }}>
                  {speaking ? 'Speaking - tap Cut in to talk' : listening ? 'Listening now - ask naturally' : loading ? 'Thinking through Joseph\'s portfolio' : voiceMode === 'voice' && voiceSupported ? 'Voice-ready portfolio guide' : 'Text mode portfolio guide'}
                </p>
              </div>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7FA6FF', boxShadow: '0 0 8px #7FA6FF', animation: 'pwezaPulse 2s ease-in-out infinite' }} />
              <span className="font-sans font-bold" style={{ fontSize: 9, color: '#7FA6FF', letterSpacing: 1 }}>ONLINE</span>
            </div>

            <div className="overflow-y-auto" style={{ height: 268, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map((m, i) => {
                const isUser = m.role === 'user'
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                    <div className="font-sans" style={{
                      maxWidth: '86%', padding: '9px 12px', fontSize: 11, lineHeight: 1.55,
                      color: isUser ? '#EEF2F8' : '#B9C2D3',
                      background: isUser ? 'rgba(150,170,210,0.10)' : 'rgba(255,255,255,0.03)',
                      border: '1px solid ' + (isUser ? 'rgba(150,170,210,0.25)' : 'rgba(255,255,255,0.06)'),
                      borderRadius: isUser ? '11px 11px 3px 11px' : '11px 11px 11px 3px',
                    }}>
                      {m.content}
                      {m.role === 'assistant' && i === messages.length - 1 && !loading && (
                        <button type="button" onClick={() => replayMessage(m.content)} title="Replay"
                          style={{ marginLeft: 6, color: '#8D97AA', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 11 }}>
                          🔊
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
              {loading && (
                <div style={{ display: 'flex' }}>
                  <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 11 }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[0, 1, 2].map(i => (
                        <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#EEF2F8', boxShadow: '0 0 6px #EEF2F8', animation: 'pwezaBounce 0.9s ease-in-out ' + (i * 0.15) + 's infinite' }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {messages.length === 1 && !loading && (
              <div style={{ padding: '0 12px 8px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {QUICK_QUESTIONS.map(q => (
                  <button key={q} type="button" onClick={() => send(q, 'text')}
                    className="font-sans"
                    style={{
                      fontSize: 9, padding: '4px 9px', color: '#EEF2F8',
                      background: 'rgba(150,170,210,0.05)',
                      border: '1px solid rgba(150,170,210,0.2)', borderRadius: 5, cursor: 'pointer',
                    }}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div style={{ padding: 11, borderTop: '1px solid rgba(150,170,210,0.08)', display: 'flex', gap: 7, alignItems: 'center', background: 'rgba(150,170,210,0.02)' }}>
              <input
                value={input}
                onChange={handleInputChange}
                onKeyDown={e => e.key === 'Enter' && send(undefined, 'text')}
                placeholder={listening ? 'Listening...' : 'Ask about projects, fit, skills...'}
                className="font-sans"
                aria-label="Ask PWEZA"
                style={{ flex: 1, fontSize: 11, color: '#fff', padding: '8px 11px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, outline: 'none' }}
              />
              <button type="button" onClick={handleMicClick}
                disabled={loading || !voiceSupported}
                title={voiceSupported ? (speaking ? 'Interrupt PWEZA and speak' : voiceMode === 'voice' ? 'Voice mode stays on until you type' : 'Start voice listening') : 'Voice input is not supported in this browser'}
                aria-label={speaking ? 'Interrupt PWEZA and speak' : voiceMode === 'voice' ? 'Voice mode active; start typing to switch off' : 'Start voice listening'}
                style={{
                  position: 'relative',
                  width: 34, height: 34, borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                  color: speaking ? '#f59e0b' : voiceMode === 'voice' ? '#7FA6FF' : voiceSupported ? '#7FA6FF' : '#3A4458',
                  background: speaking ? 'rgba(245,158,11,0.15)' : voiceMode === 'voice' ? 'rgba(127,166,255,0.18)' : voiceSupported ? 'rgba(127,166,255,0.1)' : 'transparent',
                  border: '1px solid ' + (speaking ? 'rgba(245,158,11,0.55)' : voiceMode === 'voice' ? 'rgba(127,166,255,0.7)' : voiceSupported ? 'rgba(127,166,255,0.4)' : 'rgba(255,255,255,0.08)'),
                  cursor: voiceSupported ? 'pointer' : 'not-allowed',
                  opacity: voiceSupported ? 1 : 0.4,
                  animation: (listening || speaking) ? 'pwezaListen 0.7s ease-in-out infinite' : 'none',
                }}>
                🎤
                {listening && <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px #ef4444', animation: 'pwezaPulse 1s ease-in-out infinite' }} />}
              </button>
              <button type="button" onClick={() => send(undefined, 'text')}
                disabled={loading || !input.trim()}
                title="Send message"
                aria-label="Send message"
                style={{
                  width: 34, height: 34, borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                  color: '#EEF2F8',
                  background: 'rgba(150,170,210,0.1)',
                  border: '1px solid rgba(150,170,210,0.3)',
                  cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (loading || !input.trim()) ? 0.4 : 1,
                }}>→</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pwezaPulse  { 0%, 100% { opacity: 0.55 } 50% { opacity: 1 } }
        @keyframes pwezaBounce { 0%, 100% { transform: translateY(0); opacity: 0.5 } 50% { transform: translateY(-6px); opacity: 1 } }
        @keyframes pwezaListen { 0%, 100% { transform: scale(1) } 50% { transform: scale(1.1) } }
      `}</style>
    </>
  )
}
