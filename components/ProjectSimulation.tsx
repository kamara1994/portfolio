'use client'
// @ts-nocheck
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ──────────────────────────────────────────────────────────
   Shared step-runner. Plays an array of steps in sequence,
   lighting nodes + appending console logs as it goes.
─────────────────────────────────────────────────────────── */
function useSequence() {
  const [step, setStep]       = useState(-1)
  const [running, setRunning] = useState(false)
  const [done, setDone]       = useState(false)
  const [logs, setLogs]       = useState([])
  const timers = useRef([])

  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  const reset = useCallback(() => {
    clear(); setStep(-1); setRunning(false); setDone(false); setLogs([])
  }, [clear])

  const run = useCallback((steps) => {
    clear(); setLogs([]); setStep(-1); setDone(false); setRunning(true)
    let t = 0
    steps.forEach((s, i) => {
      t += (s.delay ?? 700)
      timers.current.push(setTimeout(() => {
        setStep(i)
        if (s.log) setLogs(prev => [...prev, s.log])
      }, t))
    })
    timers.current.push(setTimeout(() => { setRunning(false); setDone(true) }, t + 650))
  }, [clear])

  useEffect(() => () => clear(), [clear])
  return { step, running, done, logs, run, reset }
}

/* ── Live console ── */
function Console({ logs, running, idleText }) {
  const ref = useRef(null)
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight }, [logs])
  return (
    <div ref={ref} className="font-mono overflow-y-auto"
      style={{ height: 142, fontSize: 11, lineHeight: 1.7, background: '#00060f',
        border: '1px solid rgba(0,212,255,0.12)', borderRadius: 6, padding: '10px 13px' }}>
      {logs.length === 0 && (
        <span style={{ color: '#3d566e' }}>{idleText || '// console idle — press the trigger to start'}</span>
      )}
      {logs.map((l, i) => (
        <div key={i} style={{ color: i === logs.length - 1 ? '#00d4ff' : '#7f97ad' }}>{l}</div>
      ))}
      {running && <span style={{ color: '#00f5d4', animation: 'simBlink 1s steps(2) infinite' }}>▍</span>}
    </div>
  )
}

/* ── Pipeline node + connector ── */
function FlowNode({ icon, label, sub, color, state }) {
  const active = state === 'active', done = state === 'done'
  return (
    <div style={{
      position: 'relative', width: 116, minWidth: 116, height: 100,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
      background: active ? `linear-gradient(160deg, ${color}22, rgba(0,0,0,0.5))` : 'linear-gradient(160deg, rgba(255,255,255,0.03), rgba(0,0,0,0.45))',
      border: `1.4px solid ${active ? color : done ? color + '77' : 'rgba(255,255,255,0.1)'}`,
      borderRadius: 8, opacity: state === 'idle' ? 0.45 : 1,
      boxShadow: active ? `0 0 26px ${color}55, inset 0 0 18px ${color}1f` : done ? `0 0 9px ${color}22` : 'none',
      transition: 'all .35s cubic-bezier(0.34,1.3,0.64,1)',
      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    }}>
      {active && <span style={{ position: 'absolute', inset: -3, borderRadius: 10, border: `1.4px solid ${color}`, animation: 'simRing 1.1s ease-out infinite' }} />}
      <div style={{ fontSize: 20, color, lineHeight: 1, animation: active ? 'simFire .9s ease-in-out infinite' : 'none' }}>{icon}</div>
      <div className="font-orbitron" style={{ fontSize: 10.5, fontWeight: 700, color: '#e2eaff', textAlign: 'center', lineHeight: 1.1 }}>{label}</div>
      <div className="font-mono" style={{ fontSize: 7.5, color: '#62788f', textAlign: 'center' }}>{sub}</div>
      <div className="font-mono" style={{ fontSize: 7, letterSpacing: 1, marginTop: 1,
        color: active ? color : done ? color : '#3d566e' }}>
        {active ? '● RUNNING' : done ? '✓ DONE' : '○ IDLE'}
      </div>
    </div>
  )
}
function Connector({ active, color }) {
  return (
    <div style={{ position: 'relative', width: 30, minWidth: 30, height: 2, background: 'rgba(255,255,255,0.08)', alignSelf: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, width: active ? '100%' : '0%',
        background: `linear-gradient(90deg, ${color}, ${color}22)`, transition: 'width .45s ease',
        boxShadow: active ? `0 0 7px ${color}` : 'none' }} />
      {active && <span style={{ position: 'absolute', top: -2.5, left: 0, width: 7, height: 7, borderRadius: '50%', background: color, boxShadow: `0 0 9px ${color}`, animation: 'simFlow 1s linear infinite' }} />}
    </div>
  )
}
function Pipeline({ nodes, stepFn }) {
  return (
    <div className="flex items-stretch overflow-x-auto pb-3" style={{ scrollbarWidth: 'thin' }}>
      {nodes.map((n, i) => (
        <div key={n.id} className="flex items-center shrink-0">
          <FlowNode {...n} state={stepFn(i)} />
          {i < nodes.length - 1 && <Connector active={stepFn(i) === 'done'} color={n.color} />}
        </div>
      ))}
    </div>
  )
}

/* ── Trigger button ── */
function TriggerBtn({ running, done, onRun, onReset, label, color }) {
  if (running) return (
    <button disabled className="font-mono font-black tracking-[2px] uppercase px-6 py-3"
      style={{ fontSize: 11, background: 'rgba(255,255,255,0.04)', border: `1.4px solid ${color}55`, color: color + '99', borderRadius: 5, cursor: 'wait' }}>
      ◌ running pipeline…
    </button>
  )
  if (done) return (
    <button onClick={onRun} className="font-mono font-black tracking-[2px] uppercase px-6 py-3"
      style={{ fontSize: 11, background: `${color}14`, border: `1.5px solid ${color}`, color, borderRadius: 5 }}>
      ↻ run again
    </button>
  )
  return (
    <button onClick={onRun} className="font-mono font-black tracking-[2px] uppercase px-6 py-3"
      style={{ fontSize: 11, background: `${color}18`, border: `1.5px solid ${color}`, color, borderRadius: 5, boxShadow: `0 0 22px ${color}33` }}>
      ⚡ {label}
    </button>
  )
}

/* ══════════════════ BLUE SOC — n8n workflow ══════════════════ */
function BlueSocSim() {
  const { step, running, done, logs, run, reset } = useSequence()
  const nodes = [
    { id: 'splunk',    icon: '◎', label: 'Splunk SIEM', sub: 'alert ingest',  color: '#00d4ff' },
    { id: 'webhook',   icon: '⇄', label: 'n8n Webhook', sub: 'normalize',     color: '#00f5d4' },
    { id: 'claude',    icon: '◇', label: 'Claude LLM',  sub: 'AI triage',     color: '#818cf8' },
    { id: 'risk',      icon: '▲', label: 'Risk Engine', sub: 'score 94/100',  color: '#ffaa00' },
    { id: 'paloalto',  icon: '⛨', label: 'Palo Alto',   sub: 'block (review)',color: '#ef4444' },
    { id: 'telegram',  icon: '➤', label: 'Telegram',    sub: 'notify analyst',color: '#00d4ff' },
    { id: 'dashboard', icon: '▦', label: 'Dashboard',   sub: 'live update',   color: '#00f5d4' },
  ]
  const start = () => run([
    { delay: 250, log: '[+0.0s] Splunk SIEM ingested alert — anomalous sign-in from 185.220.101.47' },
    { delay: 650, log: '[+0.6s] n8n webhook fired — event payload normalized' },
    { delay: 750, log: '[+1.3s] Claude LLM triaging… matched MITRE T1078 (Valid Accounts)' },
    { delay: 750, log: '[+2.1s] Risk score computed: 94/100 → CREDENTIAL COMPROMISE' },
    { delay: 700, log: '[+2.8s] Palo Alto — block rule staged (analyst approval required)' },
    { delay: 600, log: '[+3.4s] Telegram — analyst notified with full IOC context' },
    { delay: 600, log: '[+4.0s] Dashboard updated — incident #001 now live' },
  ])
  const stepFn = i => done ? 'done' : i < step ? 'done' : i === step ? 'active' : 'idle'
  return (
    <div className="flex flex-col gap-4">
      <Pipeline nodes={nodes} stepFn={stepFn} />
      <div className="flex items-center gap-4 flex-wrap">
        <TriggerBtn running={running} done={done} onRun={start} onReset={reset} label="trigger pipeline" color="#00d4ff" />
        <span className="font-mono" style={{ fontSize: 9.5, color: '#62788f' }}>
          Watch a real alert flow end-to-end. Containment stays analyst-gated by design.
        </span>
      </div>
      <Console logs={logs} running={running} idleText="// SOC pipeline idle — press TRIGGER to inject a phishing-compromise alert" />
    </div>
  )
}

/* ══════════════════ FORTRESS v2 — AWS attack / defense ══════════════════ */
function FortressSim() {
  const { step, running, done, logs, run, reset } = useSequence()
  const attacks = [
    { id: 'ssh',  label: 'SSH Brute Force', ioc: '203.0.113.66',              det: 'UnauthorizedAccess:EC2/SSHBruteForce' },
    { id: 's3',   label: 'S3 Exposure',     ioc: 'company-data-backup-prod',  det: 'Policy:S3/BucketBlockPublicAccessDisabled' },
    { id: 'scan', label: 'Port Scan',       ioc: '198.51.100.23',             det: 'Recon:EC2/Portscan' },
    { id: 'iam',  label: 'IAM Backdoor',    ioc: 'dev-deploy-user',           det: 'PrivilegeEscalation:IAMUser/AdminAccess' },
  ]
  const [atk, setAtk] = useState(attacks[0])
  const nodes = [
    { id: 'attack',    icon: '⚠', label: 'Attack',      sub: atk.label,    color: '#ef4444' },
    { id: 'guardduty', icon: '◉', label: 'GuardDuty',   sub: 'detection',  color: '#ffaa00' },
    { id: 'event',     icon: '⚡', label: 'CloudWatch',  sub: 'event rule', color: '#00d4ff' },
    { id: 'lambda',    icon: 'λ', label: 'Lambda',      sub: 'remediation',color: '#818cf8' },
    { id: 'contain',   icon: '⛨', label: 'Containment', sub: 'isolate',    color: '#00f5d4' },
    { id: 'sns',       icon: '✉', label: 'SNS Alert',   sub: 'notify team',color: '#00d4ff' },
  ]
  const start = () => run([
    { delay: 250, log: `[+0.0s] ⚠ Attack launched — ${atk.label} (${atk.ioc})` },
    { delay: 700, log: `[+0.7s] GuardDuty finding: ${atk.det}` },
    { delay: 650, log: '[+1.3s] CloudWatch Events rule matched → invoking Lambda' },
    { delay: 700, log: '[+2.0s] Lambda remediation building containment action…' },
    { delay: 700, log: atk.id === 's3' ? '[+2.7s] S3 public-access block re-enabled — bucket locked' : '[+2.7s] Source isolated via Palo Alto / SG quarantine' },
    { delay: 600, log: '[+3.3s] SNS — security team alerted. Threat CONTAINED.' },
  ])
  const stepFn = i => done ? 'done' : i < step ? 'done' : i === step ? 'active' : 'idle'
  const threat = step < 0 ? 0 : step < 1 ? 45 : step < 4 ? 92 : step < 5 ? 60 : done ? 6 : 18
  const contained = done
  return (
    <div className="flex flex-col gap-4">
      {/* attack selector */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="font-mono uppercase tracking-[2px]" style={{ fontSize: 8.5, color: '#62788f' }}>scenario:</span>
        {attacks.map(a => (
          <button key={a.id} disabled={running} onClick={() => { setAtk(a); reset() }}
            className="font-mono uppercase tracking-[1.5px] px-3 py-1.5"
            style={{ fontSize: 8.5, borderRadius: 4,
              border: `1px solid ${atk.id === a.id ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.1)'}`,
              background: atk.id === a.id ? 'rgba(239,68,68,0.14)' : 'rgba(255,255,255,0.03)',
              color: atk.id === a.id ? '#ef4444' : 'rgba(255,255,255,0.45)' }}>
            {a.label}
          </button>
        ))}
      </div>
      <Pipeline nodes={nodes} stepFn={stepFn} />
      {/* threat meter */}
      <div>
        <div className="flex justify-between font-mono mb-1" style={{ fontSize: 8.5 }}>
          <span style={{ color: '#62788f', letterSpacing: 1 }}>THREAT LEVEL</span>
          <span style={{ color: contained ? '#00f5d4' : '#ef4444' }}>{contained ? 'CONTAINED' : `${threat}%`}</span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${threat}%`, borderRadius: 3, transition: 'all .55s ease',
            background: contained ? '#00f5d4' : threat > 70 ? '#ef4444' : '#ffaa00',
            boxShadow: `0 0 8px ${contained ? '#00f5d4' : '#ef4444'}` }} />
        </div>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <TriggerBtn running={running} done={done} onRun={start} onReset={reset} label="launch attack" color="#ffaa00" />
        <span className="font-mono" style={{ fontSize: 9.5, color: '#62788f' }}>Pick a scenario, launch it, watch the IaC defense respond.</span>
      </div>
      <Console logs={logs} running={running} idleText="// AWS lab armed — choose a scenario and LAUNCH ATTACK" />
    </div>
  )
}

/* ══════════════════ BLUE-X — neural traffic classifier ══════════════════ */
function BlueXSim() {
  const { step, running, done, logs, run, reset } = useSequence()
  const samples = [
    { id: 'ddos',   label: 'DDoS',       conf: 99.98, color: '#ef4444' },
    { id: 'scan',   label: 'PortScan',   conf: 99.21, color: '#ffaa00' },
    { id: 'botnet', label: 'Botnet',     conf: 98.74, color: '#a855f7' },
    { id: 'brute',  label: 'BruteForce', conf: 99.55, color: '#818cf8' },
    { id: 'benign', label: 'BENIGN',     conf: 99.90, color: '#00f5d4' },
  ]
  const [sample, setSample] = useState(samples[0])
  const [conf, setConf] = useState(0)

  useEffect(() => {
    if (step >= 4) {
      let v = 0; const target = sample.conf
      const id = setInterval(() => { v += target / 22; if (v >= target) { v = target; clearInterval(id) } setConf(+v.toFixed(2)) }, 26)
      return () => clearInterval(id)
    } else setConf(0)
  }, [step, sample])

  const start = () => { setConf(0); run([
    { delay: 250, log: `[+0.0s] Capturing live flow — profile: ${sample.label}` },
    { delay: 650, log: '[+0.5s] Extracted 12 flow features (pkt size · IAT · flags · entropy…)' },
    { delay: 600, log: '[+1.1s] Forward pass → hidden layer 1 (ReLU)' },
    { delay: 600, log: '[+1.7s] Forward pass → hidden layer 2 (ReLU)' },
    { delay: 600, log: `[+2.3s] Softmax → ${sample.label} @ ${sample.conf}% confidence` },
  ]) }

  const layers = [
    { n: 6, key: 'in',  label: 'INPUT',    fire: 1 },
    { n: 9, key: 'h1',  label: 'HIDDEN-1', fire: 2 },
    { n: 9, key: 'h2',  label: 'HIDDEN-2', fire: 3 },
  ]
  return (
    <div className="flex flex-col gap-4">
      {/* sample selector */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="font-mono uppercase tracking-[2px]" style={{ fontSize: 8.5, color: '#62788f' }}>traffic:</span>
        {samples.map(s => (
          <button key={s.id} disabled={running} onClick={() => { setSample(s); reset() }}
            className="font-mono uppercase tracking-[1.5px] px-3 py-1.5"
            style={{ fontSize: 8.5, borderRadius: 4,
              border: `1px solid ${sample.id === s.id ? s.color + '99' : 'rgba(255,255,255,0.1)'}`,
              background: sample.id === s.id ? s.color + '1f' : 'rgba(255,255,255,0.03)',
              color: sample.id === s.id ? s.color : 'rgba(255,255,255,0.45)' }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* network */}
      <div className="flex items-stretch justify-between gap-2 px-2 py-5"
        style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.02), rgba(0,0,0,0.4))', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, minHeight: 190 }}>
        {layers.map(L => {
          const lit = step >= L.fire, firing = step === L.fire
          return (
            <div key={L.key} className="flex flex-col items-center justify-center gap-2 flex-1">
              <div className="flex flex-col items-center justify-center gap-1.5" style={{ flex: 1 }}>
                {Array.from({ length: L.n }).map((_, i) => (
                  <span key={i} style={{ width: 9, height: 9, borderRadius: '50%',
                    background: lit ? '#a855f7' : 'rgba(255,255,255,0.1)',
                    boxShadow: lit ? '0 0 8px #a855f7' : 'none',
                    transition: 'all .3s', animation: firing ? `simFire .8s ease-in-out ${i * 0.04}s infinite` : 'none' }} />
                ))}
              </div>
              <span className="font-mono tracking-[1px]" style={{ fontSize: 7, color: lit ? '#a855f7' : '#3d566e' }}>{L.label}</span>
            </div>
          )
        })}
        {/* output layer = classes */}
        <div className="flex flex-col items-center justify-center gap-2 flex-1">
          <div className="flex flex-col items-center justify-center gap-1.5" style={{ flex: 1 }}>
            {samples.map(s => {
              const hit = step >= 4 && s.id === sample.id
              return (
                <div key={s.id} className="flex items-center gap-1.5">
                  <span style={{ width: 9, height: 9, borderRadius: '50%',
                    background: hit ? s.color : 'rgba(255,255,255,0.1)',
                    boxShadow: hit ? `0 0 10px ${s.color}` : 'none', transition: 'all .35s',
                    animation: hit ? 'simFire .9s ease-in-out infinite' : 'none' }} />
                  <span className="font-mono" style={{ fontSize: 6.5, color: hit ? s.color : '#3d566e', width: 42 }}>{s.label}</span>
                </div>
              )
            })}
          </div>
          <span className="font-mono tracking-[1px]" style={{ fontSize: 7, color: step >= 4 ? sample.color : '#3d566e' }}>OUTPUT</span>
        </div>
      </div>

      {/* verdict */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-baseline gap-3">
          <span className="font-orbitron font-black" style={{ fontSize: 22, color: step >= 4 ? sample.color : '#33485c' }}>
            {step >= 4 ? sample.label : '—'}
          </span>
          <span className="font-mono" style={{ fontSize: 12, color: step >= 4 ? '#00f5d4' : '#33485c' }}>
            {step >= 4 ? `${conf}%` : '—'}
          </span>
        </div>
        <TriggerBtn running={running} done={done} onRun={start} onReset={reset} label="capture & classify" color="#a855f7" />
      </div>
      <Console logs={logs} running={running} idleText="// PyTorch model loaded — pick a traffic type and CAPTURE & CLASSIFY" />
    </div>
  )
}

/* ══════════════════ Shell ══════════════════ */
const META = {
  'blue-soc-p8': { title: 'BLUE SOC P8', tag: 'n8n SECURITY AUTOMATION · LIVE PIPELINE',  color: '#00d4ff', Sim: BlueSocSim },
  'fortress-v2': { title: 'FORTRESS v2', tag: 'AWS ATTACK / DEFENSE · IaC LAB',           color: '#ffaa00', Sim: FortressSim },
  'blue-x':      { title: 'BLUE-X',      tag: 'PyTorch TRAFFIC CLASSIFIER · FORWARD PASS', color: '#a855f7', Sim: BlueXSim },
}

export default function ProjectSimulation({ projectId, onClose }) {
  const meta = META[projectId]
  useEffect(() => {
    const k = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  if (!meta) return null
  const { title, tag, color, Sim } = meta

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9995] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(2,8,24,0.94)', backdropFilter: 'blur(6px)' }} />
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        onClick={e => e.stopPropagation()}
        className="relative z-10 w-full overflow-hidden"
        style={{ maxWidth: 920, maxHeight: '90vh', overflowY: 'auto',
          background: 'linear-gradient(160deg, rgba(10,18,38,0.96), rgba(2,8,20,0.98))',
          border: `1.4px solid ${color}44`, borderRadius: 12,
          boxShadow: `0 0 60px ${color}22, 0 30px 80px rgba(0,0,0,0.6)` }}>

        {/* header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4" style={{ borderBottom: `1px solid ${color}1f` }}>
          <div>
            <div className="font-mono tracking-[3px] uppercase mb-1 flex items-center gap-2" style={{ fontSize: 9, color }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 7px ${color}`, animation: 'simBlink 1.4s ease-in-out infinite' }} />
              {tag}
            </div>
            <div className="font-orbitron font-black" style={{ fontSize: 24, color: '#e2eaff' }}>{title}</div>
          </div>
          <button onClick={onClose} className="font-mono tracking-[1px]"
            style={{ fontSize: 10, color: '#7f97ad', border: `1px solid ${color}33`, padding: '6px 12px', borderRadius: 4 }}>
            ESC ✕
          </button>
        </div>

        {/* body */}
        <div className="px-6 py-6">
          <Sim />
        </div>

        {/* footer */}
        <div className="px-6 py-3 font-mono" style={{ fontSize: 8.5, color: '#46617a', borderTop: `1px solid ${color}14` }}>
          Animated reconstruction of the real pipeline for demonstration — logs are representative, not live infrastructure.
        </div>
      </motion.div>

      <style>{`
        @keyframes simBlink { 0%,100%{opacity:.35} 50%{opacity:1} }
        @keyframes simRing  { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(1.18);opacity:0} }
        @keyframes simFlow  { 0%{left:0%;opacity:0} 20%{opacity:1} 100%{left:100%;opacity:0} }
        @keyframes simFire  { 0%,100%{transform:scale(1);filter:brightness(1)} 50%{transform:scale(1.35);filter:brightness(1.6)} }
      `}</style>
    </motion.div>
  )
}
