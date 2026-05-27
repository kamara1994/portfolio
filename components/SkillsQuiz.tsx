'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const questions = [
  {
    id: 1,
    question: 'A Splunk alert fires showing 847 SYN packets in 2.3 seconds from a single source IP. What is the most likely attack?',
    options: ['SQL Injection', 'SYN Flood DDoS', 'ARP Spoofing', 'DNS Tunneling'],
    correct: 1,
    explanation: 'A SYN flood sends large volumes of TCP SYN packets to exhaust server resources. 847 packets in 2.3 seconds is a classic volumetric DDoS pattern.',
    mitre: 'T1498.001',
  },
  {
    id: 2,
    question: 'GuardDuty generates a finding: "UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration". What happened?',
    options: [
      'A user logged in from an unusual location',
      'EC2 instance credentials were used from outside AWS',
      'An IAM policy was modified without authorization',
      'A root account was accessed',
    ],
    correct: 1,
    explanation: 'This finding means EC2 instance metadata credentials were exfiltrated and used from an external IP — a common post-exploitation technique after SSRF attacks.',
    mitre: 'T1552.005',
  },
  {
    id: 3,
    question: 'Network logs show consistent outbound HTTPS traffic to the same IP every 60 seconds with identical packet sizes. What should you investigate first?',
    options: [
      'Check if it\'s a scheduled software update',
      'Investigate for C2 beaconing — consistent intervals suggest malware',
      'Block the IP immediately without investigation',
      'Ignore it — HTTPS traffic is encrypted and safe',
    ],
    correct: 1,
    explanation: 'Consistent beacon intervals are a strong C2 indicator. Malware often uses jittered but regular intervals to maintain persistence. The consistent packet size further supports this.',
    mitre: 'T1071.001',
  },
  {
    id: 4,
    question: 'A phishing email uses the domain "firstnationaI-bank.com" (capital I instead of lowercase L). What technique is this?',
    options: ['Domain Shadowing', 'Typosquatting / Homograph Attack', 'DNS Cache Poisoning', 'Subdomain Takeover'],
    correct: 1,
    explanation: 'Replacing visually similar characters (capital I vs lowercase l) is a homograph/typosquatting attack. In most fonts these look identical, making it an effective phishing technique.',
    mitre: 'T1566.002',
  },
  {
    id: 5,
    question: 'What does the MITRE ATT&CK technique T1078 "Valid Accounts" mean in an incident context?',
    options: [
      'An attacker created a new admin account',
      'An attacker is using legitimate stolen credentials to blend in',
      'An attacker exploited a privilege escalation vulnerability',
      'An attacker bypassed MFA using a token replay attack',
    ],
    correct: 1,
    explanation: 'T1078 means an attacker is using legitimate credentials — stolen via phishing, credential dumping, or purchase. This makes detection harder since the activity looks authorized.',
    mitre: 'T1078',
  },
]

export default function SkillsQuiz() {
  const [started, setStarted]           = useState(false)
  const [currentQ, setCurrentQ]         = useState(0)
  const [selected, setSelected]         = useState<number | null>(null)
  const [answers, setAnswers]           = useState<boolean[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [finished, setFinished]         = useState(false)

  const question = questions[currentQ]
  const score    = answers.filter(Boolean).length

  const handleAnswer = (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    setShowExplanation(true)
    setAnswers(prev => [...prev, idx === question.correct])
  }

  const next = () => {
    setSelected(null)
    setShowExplanation(false)
    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1)
    } else {
      setFinished(true)
    }
  }

  const restart = () => {
    setStarted(false)
    setCurrentQ(0)
    setSelected(null)
    setAnswers([])
    setShowExplanation(false)
    setFinished(false)
  }

  const scoreColor = score >= 4 ? '#00f5d4' : score >= 3 ? '#f59e0b' : '#ef4444'
  const scoreLabel = score === 5 ? 'Perfect — SOC Analyst Level' : score >= 4 ? 'Strong — Security Analyst Level' : score >= 3 ? 'Solid — Keep Sharpening' : 'Keep Studying'

  return (
    <section className="px-6 py-20 border-t border-[rgba(0,212,255,0.08)]">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 font-mono text-[10px] text-neon tracking-[4px] uppercase mb-3">
          <span className="w-8 h-px bg-neon" />
          Interactive
        </div>
        <h2 className="font-orbitron font-black text-3xl text-[#e2eaff] mb-3">
          SOC Analyst <span className="text-cyan">Assessment</span>
        </h2>
        <p className="font-mono text-[12px] text-muted mb-8 leading-relaxed">
          5 questions covering threat detection, cloud security, and incident analysis.
          Joseph scored 5/5 on this assessment.
        </p>

        <AnimatePresence mode="wait">

          {/* START */}
          {!started && !finished && (
            <motion.div key="start" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="border border-[rgba(0,212,255,0.15)] p-8 text-center">
                <div className="font-mono text-[40px] mb-4">🛡️</div>
                <div className="font-orbitron text-lg font-bold text-[#e2eaff] mb-2">SOC Analyst Quiz</div>
                <div className="font-mono text-[11px] text-muted mb-6">5 questions · MITRE ATT&CK · Splunk · Cloud Security</div>
                <button
                  onClick={() => setStarted(true)}
                  className="font-mono text-[11px] tracking-[2px] uppercase px-8 py-3 bg-cyan text-bg hover:bg-neon transition-colors"
                >
                  Start Assessment →
                </button>
              </div>
            </motion.div>
          )}

          {/* QUESTION */}
          {started && !finished && (
            <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>

              {/* Progress */}
              <div className="flex items-center justify-between mb-4">
                <div className="font-mono text-[10px] text-muted">Question {currentQ + 1} of {questions.length}</div>
                <div className="font-mono text-[10px] text-cyan">{answers.filter(Boolean).length} correct</div>
              </div>
              <div className="w-full h-1 bg-[rgba(0,212,255,0.1)] mb-6">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan to-neon"
                  animate={{ width: `${((currentQ) / questions.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* MITRE tag */}
              <div className="flex items-center gap-2 mb-4">
                <span className="font-mono text-[9px] px-2 py-1 border border-[rgba(0,212,255,0.3)] text-cyan">
                  MITRE {question.mitre}
                </span>
              </div>

              {/* Question */}
              <div className="font-orbitron text-[15px] font-bold text-[#e2eaff] mb-6 leading-relaxed">
                {question.question}
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {question.options.map((opt, idx) => {
                  const isSelected = selected === idx
                  const isCorrect  = idx === question.correct
                  const showResult = selected !== null

                  let borderColor = 'rgba(0,212,255,0.12)'
                  let bg = 'transparent'
                  let textColor = '#8899bb'

                  if (showResult && isCorrect) { borderColor = '#00f5d4'; bg = 'rgba(0,245,212,0.08)'; textColor = '#00f5d4' }
                  if (showResult && isSelected && !isCorrect) { borderColor = '#ef4444'; bg = 'rgba(239,68,68,0.08)'; textColor = '#ef4444' }
                  if (!showResult && isSelected) { borderColor = '#00d4ff'; bg = 'rgba(0,212,255,0.06)'; textColor = '#00d4ff' }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={selected !== null}
                      className="w-full text-left p-4 border transition-all duration-200 flex items-center gap-3"
                      style={{ borderColor, background: bg }}
                    >
                      <span className="w-6 h-6 border flex items-center justify-center font-mono text-[10px] shrink-0"
                        style={{ borderColor, color: textColor }}>
                        {showResult && isCorrect ? '✓' : showResult && isSelected && !isCorrect ? '✗' : String.fromCharCode(65 + idx)}
                      </span>
                      <span className="font-mono text-[12px]" style={{ color: textColor }}>{opt}</span>
                    </button>
                  )
                })}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border p-4 mb-4"
                    style={{
                      borderColor: answers[answers.length - 1] ? 'rgba(0,245,212,0.3)' : 'rgba(239,68,68,0.3)',
                      background: answers[answers.length - 1] ? 'rgba(0,245,212,0.04)' : 'rgba(239,68,68,0.04)',
                    }}
                  >
                    <div className="font-mono text-[9px] uppercase tracking-[2px] mb-2"
                      style={{ color: answers[answers.length - 1] ? '#00f5d4' : '#ef4444' }}>
                      {answers[answers.length - 1] ? '✓ Correct' : '✗ Incorrect'} — Explanation
                    </div>
                    <p className="font-mono text-[11px] text-muted leading-relaxed">{question.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {showExplanation && (
                <button
                  onClick={next}
                  className="w-full font-mono text-[11px] tracking-[2px] uppercase px-6 py-3 bg-cyan text-bg hover:bg-neon transition-colors"
                >
                  {currentQ < questions.length - 1 ? 'Next Question →' : 'See Results →'}
                </button>
              )}
            </motion.div>
          )}

          {/* RESULTS */}
          {finished && (
            <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="border p-8 text-center mb-6" style={{ borderColor: `${scoreColor}40`, background: `${scoreColor}06` }}>
                <div className="font-orbitron text-[72px] font-black leading-none mb-2" style={{ color: scoreColor }}>
                  {score}/5
                </div>
                <div className="font-mono text-[12px] mb-2" style={{ color: scoreColor }}>{scoreLabel}</div>
                <div className="font-mono text-[10px] text-muted">
                  Joseph scored 5/5 on this same assessment
                </div>
              </div>

              {/* Per-question review */}
              <div className="space-y-2 mb-6">
                {questions.map((q, i) => (
                  <div key={q.id} className="flex items-center gap-3 p-3 border border-[rgba(0,212,255,0.08)]">
                    <span className="font-mono text-[11px]" style={{ color: answers[i] ? '#00f5d4' : '#ef4444' }}>
                      {answers[i] ? '✓' : '✗'}
                    </span>
                    <span className="font-mono text-[10px] text-muted flex-1 truncate">{q.question.substring(0, 60)}...</span>
                    <span className="font-mono text-[9px] px-2 py-0.5 border border-[rgba(0,212,255,0.2)] text-cyan shrink-0">
                      {q.mitre}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={restart}
                  className="flex-1 font-mono text-[11px] tracking-[2px] uppercase px-6 py-3 border border-[rgba(0,212,255,0.3)] text-cyan hover:bg-[rgba(0,212,255,0.06)] transition-colors">
                  Try Again
                </button>
                <a href="mailto:kamarajosephallan@gmail.com"
                  className="flex-1 font-mono text-[11px] tracking-[2px] uppercase px-6 py-3 bg-cyan text-bg hover:bg-neon transition-colors text-center">
                  Contact Joseph →
                </a>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </section>
  )
}
