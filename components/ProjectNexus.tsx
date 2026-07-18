'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Html, useProgress, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { projects, type Project } from '@/data/projects'

const GALLERY_PROJECTS = projects

const ACCENTS: Record<string, string> = {
  'blue-soc-p8': '#21c7e8',
  'python-ids': '#ef6f6c',
  'cve-scanner': '#c7e36b',
  'threat-intel-dashboard': '#6ba8e3',
  'blue-v3': '#d78ee8',
  'security-automation-toolkit': '#7bd5b3',
  elitecom: '#f08a5d',
  'pandie-foundation': '#e5c76b',
  'fortress-v2': '#f2aa4c',
  'blue-x': '#42d392',
  'enterprise-networking': '#8aa4ff',
  'pweza-voice-agent': '#00f5d4',
  'pweza-visitor-intelligence': '#00d4ff',
}

const PROOF_METRICS: Record<string, Array<{ value: string; label: string }>> = {
  'blue-soc-p8': [
    { value: '5-stage', label: 'response pipeline' },
    { value: '7', label: 'integrated tools' },
    { value: 'Human', label: 'containment approval' },
  ],
  'fortress-v2': [
    { value: '20+', label: 'AWS resources' },
    { value: '6', label: 'Terraform modules' },
    { value: '5', label: 'attack simulations' },
  ],
  'blue-x': [
    { value: '99.98%', label: 'model accuracy' },
    { value: '50k', label: 'traffic samples' },
    { value: '5', label: 'traffic classes' },
  ],
  'pweza-voice-agent': [
    { value: '3-model', label: 'provider routing' },
    { value: '2-mode', label: 'voice and text' },
    { value: '20/min', label: 'endpoint guard' },
  ],
  'pweza-visitor-intelligence': [
    { value: 'Server', label: 'location source' },
    { value: '5 sec', label: 'duplicate guard' },
    { value: 'Live', label: 'Telegram delivery' },
  ],
}

function projectAccent(project: Project) {
  return ACCENTS[project.id] || '#9aa7b2'
}

function makeFortressTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1600
  canvas.height = 1000
  const context = canvas.getContext('2d')!

  context.fillStyle = '#091015'
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.fillStyle = '#f2aa4c'
  context.fillRect(80, 78, 10, 112)
  context.font = '700 58px ui-monospace, monospace'
  context.fillText('FORTRESS v2', 125, 135)
  context.fillStyle = '#91a0a8'
  context.font = '24px ui-monospace, monospace'
  context.fillText('AWS DEFENSE ARCHITECTURE / TERRAFORM DEPLOYED', 127, 180)

  const columns = [
    { x: 110, title: 'TELEMETRY', items: ['CloudTrail', 'GuardDuty', 'WAF'] },
    { x: 610, title: 'DETECTION', items: ['EventBridge', 'Security Hub', 'CloudWatch'] },
    { x: 1110, title: 'RESPONSE', items: ['Lambda isolation', 'SNS alerting', 'Analyst review'] },
  ]

  columns.forEach((column, columnIndex) => {
    context.fillStyle = columnIndex === 1 ? '#f2aa4c' : '#dce6e9'
    context.font = '700 25px ui-monospace, monospace'
    context.fillText(column.title, column.x, 325)

    column.items.forEach((item, itemIndex) => {
      const y = 385 + itemIndex * 112
      context.fillStyle = '#101b22'
      context.strokeStyle = columnIndex === 1 ? '#8a632e' : '#33464f'
      context.lineWidth = 2
      context.fillRect(column.x, y, 350, 74)
      context.strokeRect(column.x, y, 350, 74)
      context.fillStyle = '#dce6e9'
      context.font = '25px ui-monospace, monospace'
      context.fillText(item, column.x + 28, y + 47)
    })

    if (columnIndex < columns.length - 1) {
      context.strokeStyle = '#f2aa4c'
      context.lineWidth = 3
      context.beginPath()
      context.moveTo(column.x + 370, 498)
      context.lineTo(column.x + 465, 498)
      context.lineTo(column.x + 445, 485)
      context.moveTo(column.x + 465, 498)
      context.lineTo(column.x + 445, 511)
      context.stroke()
    }
  })

  context.fillStyle = '#0f171c'
  context.fillRect(80, 820, 1440, 100)
  context.fillStyle = '#f2aa4c'
  context.font = '700 28px ui-monospace, monospace'
  context.fillText('20+ AWS RESOURCES', 120, 880)
  context.fillStyle = '#dce6e9'
  context.fillText('6 TERRAFORM MODULES', 610, 880)
  context.fillText('5 ATTACK SIMULATIONS', 1110, 880)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  texture.needsUpdate = true
  return texture
}

function ScreenshotSurface({ src }: { src: string }) {
  const texture = useTexture(src)
  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 4
    texture.needsUpdate = true
  }, [texture])

  return <meshBasicMaterial map={texture} toneMapped={false} />
}

function FortressSurface() {
  const texture = useMemo(makeFortressTexture, [])
  useEffect(() => () => texture.dispose(), [texture])
  return <meshBasicMaterial map={texture} toneMapped={false} />
}

function makeProjectTexture(project: Project) {
  const canvas = document.createElement('canvas')
  canvas.width = 1600
  canvas.height = 1000
  const context = canvas.getContext('2d')!
  const accent = projectAccent(project)

  context.fillStyle = '#091015'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = accent
  context.fillRect(82, 76, 10, 122)
  context.font = '700 54px ui-monospace, monospace'
  context.fillText(project.title.toUpperCase(), 128, 137)
  context.fillStyle = '#91a0a8'
  context.font = '24px ui-monospace, monospace'
  context.fillText(project.category.toUpperCase(), 130, 183)

  const steps = (project.architecture || [project.approach]).slice(0, 5)
  steps.forEach((step, index) => {
    const y = 285 + index * 112
    context.fillStyle = '#101b22'
    context.strokeStyle = index === 0 ? accent : '#33464f'
    context.lineWidth = 2
    context.fillRect(130, y, 1340, 76)
    context.strokeRect(130, y, 1340, 76)
    context.fillStyle = accent
    context.font = '700 22px ui-monospace, monospace'
    context.fillText(String(index + 1).padStart(2, '0'), 165, y + 47)
    context.fillStyle = '#dce6e9'
    context.font = '22px ui-monospace, monospace'
    const label = step.length > 86 ? `${step.slice(0, 83)}...` : step
    context.fillText(label, 235, y + 47)
  })

  context.fillStyle = '#0f171c'
  context.fillRect(82, 880, 1436, 60)
  context.fillStyle = accent
  context.font = '700 20px ui-monospace, monospace'
  context.fillText(`${project.role.toUpperCase()} / ${project.duration.toUpperCase()}`, 120, 919)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  texture.needsUpdate = true
  return texture
}

function GeneratedProjectSurface({ project }: { project: Project }) {
  const texture = useMemo(() => makeProjectTexture(project), [project])
  useEffect(() => () => texture.dispose(), [texture])
  return <meshBasicMaterial map={texture} toneMapped={false} />
}

function SignalField({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Points>(null)
  const geometry = useMemo(() => {
    const count = reduced ? 90 : 240
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 26
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12
      positions[i * 3 + 2] = -4 - Math.random() * 12
    }
    const value = new THREE.BufferGeometry()
    value.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return value
  }, [reduced])

  useFrame((_, delta) => {
    if (!reduced && ref.current) ref.current.rotation.y += delta * 0.008
  })

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color="#8fa9b7" size={0.035} transparent opacity={0.5} depthWrite={false} />
    </points>
  )
}

function EvidenceFrame({
  project,
  index,
  activeIndex,
  reduced,
  onSelect,
}: {
  project: Project
  index: number
  activeIndex: number
  reduced: boolean
  onSelect: () => void
}) {
  const group = useRef<THREE.Group>(null)
  const orbitAngle = useRef((index > GALLERY_PROJECTS.length / 2 ? index - GALLERY_PROJECTS.length : index) * ((Math.PI * 2) / GALLERY_PROJECTS.length))
  const [hovered, setHovered] = useState(false)
  const accent = projectAccent(project)

  useFrame((state, delta) => {
    if (!group.current) return

    let offset = index - activeIndex
    if (offset > GALLERY_PROJECTS.length / 2) offset -= GALLERY_PROJECTS.length
    if (offset < -GALLERY_PROJECTS.length / 2) offset += GALLERY_PROJECTS.length

    const step = (Math.PI * 2) / GALLERY_PROJECTS.length
    let targetAngle = offset * step
    while (targetAngle - orbitAngle.current > Math.PI) targetAngle -= Math.PI * 2
    while (targetAngle - orbitAngle.current < -Math.PI) targetAngle += Math.PI * 2

    const ease = reduced ? 1 : 1 - Math.pow(0.0025, delta)
    orbitAngle.current = THREE.MathUtils.lerp(orbitAngle.current, targetAngle, ease)

    const drift = reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.55) * 0.09
    const displayAngle = orbitAngle.current + drift
    const depth = 1 - Math.cos(displayAngle)
    const targetX = Math.sin(displayAngle) * 7.2
    const targetY = 0.25 - depth * 0.28
    const targetZ = -depth * 4.1
    const targetRotation = displayAngle * 0.42
    const targetScale = 1 - depth * 0.17 + (hovered ? 0.035 : 0)

    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, targetX, ease)
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, targetY, ease)
    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, targetZ, ease)
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotation, ease)
    group.current.rotation.x = reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.45 + index) * 0.018
    group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), ease)
  })

  return (
    <group ref={group}>
      <mesh position={[0, 0, -0.1]} castShadow>
        <boxGeometry args={[4.9, 3.25, 0.18]} />
        <meshStandardMaterial color="#11171c" metalness={0.72} roughness={0.34} />
      </mesh>

      <mesh
        position={[0, 0, 0.01]}
        onClick={(event) => { event.stopPropagation(); onSelect() }}
        onPointerOver={(event) => {
          event.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'default'
        }}
      >
        <planeGeometry args={[4.62, 2.98]} />
        {project.id === 'fortress-v2'
          ? <FortressSurface />
          : project.id === 'pandie-foundation' || !project.screenshot
            ? <GeneratedProjectSurface project={project} />
            : <ScreenshotSurface src={project.screenshot || '/screenshots/blue-soc.png'} />}
      </mesh>

      <mesh position={[0, 1.69, 0.03]}>
        <boxGeometry args={[4.9, 0.035, 0.035]} />
        <meshBasicMaterial color={accent} />
      </mesh>

      {index === activeIndex && (
        <Html position={[-2.35, -1.92, 0]} transform distanceFactor={8} style={{ pointerEvents: 'none' }}>
          <div style={{
            color: accent,
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: 11,
            letterSpacing: 2,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}>
            Evidence {project.num}
          </div>
        </Html>
      )}
    </group>
  )
}

function GalleryScene({
  activeIndex,
  reduced,
  onSelect,
}: {
  activeIndex: number
  reduced: boolean
  onSelect: (index: number) => void
}) {
  const stage = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (reduced) return

    const elapsed = state.clock.elapsedTime
    const targetX = state.pointer.x * 0.72
    const targetY = 0.2 + state.pointer.y * 0.36
    const ease = 1 - Math.pow(0.012, delta)

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, ease)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, ease)
    state.camera.lookAt(0, 0, 0)

    if (stage.current) {
      const idleYaw = Math.sin(elapsed * 0.55) * 0.11
      const idlePitch = Math.sin(elapsed * 0.42) * 0.025
      const pointerYaw = state.pointer.x * 0.12
      const pointerPitch = -state.pointer.y * 0.07

      stage.current.rotation.y = THREE.MathUtils.lerp(stage.current.rotation.y, idleYaw + pointerYaw, ease)
      stage.current.rotation.x = THREE.MathUtils.lerp(stage.current.rotation.x, idlePitch + pointerPitch, ease)
      stage.current.rotation.z = THREE.MathUtils.lerp(stage.current.rotation.z, Math.sin(elapsed * 0.35) * 0.012 - state.pointer.x * 0.012, ease)
      stage.current.position.x = Math.sin(elapsed * 0.3) * 0.055
      stage.current.position.y = Math.sin(elapsed * 0.7) * 0.07
    }
  })

  return (
    <>
      <ambientLight intensity={1.4} />
      <directionalLight position={[4, 8, 7]} intensity={2.4} color="#d7edf1" castShadow />
      <pointLight position={[-7, -2, 5]} intensity={22} color="#21c7e8" />
      <pointLight position={[7, 2, 3]} intensity={18} color="#f2aa4c" />
      <SignalField reduced={reduced} />

      <group ref={stage}>
        {GALLERY_PROJECTS.map((project, index) => (
          <EvidenceFrame
            key={project.id}
            project={project}
            index={index}
            activeIndex={activeIndex}
            reduced={reduced}
            onSelect={() => onSelect(index)}
          />
        ))}
      </group>

      <ContactShadows position={[0, -2.05, 0]} opacity={0.42} scale={18} blur={2.8} far={8} color="#000000" />
      <gridHelper args={[32, 32, '#28404a', '#111a1f']} position={[0, -2.08, 0]} />
    </>
  )
}

function LoadingProgress() {
  const { active, progress } = useProgress()
  if (!active && progress >= 100) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[#020818]" role="status" aria-live="polite">
      <div className="w-48">
        <div className="mb-3 flex items-center justify-between font-mono text-[9px] uppercase text-white/45" style={{ letterSpacing: 2 }}>
          <span>Loading evidence</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-px bg-white/10">
          <div className="h-px transition-[width] duration-300" style={{ width: `${progress}%`, background: '#21c7e8' }} />
        </div>
      </div>
    </div>
  )
}

function StaticEvidence({ project }: { project: Project }) {
  if (project.id === 'pandie-foundation' || !project.screenshot) {
    const accent = projectAccent(project)
    return (
      <div className="absolute inset-0 flex items-center justify-center px-5 pt-24 pb-20">
        <div className="w-full max-w-3xl border bg-[#091015] p-5 md:p-8" style={{ borderColor: `${accent}66` }}>
          <p className="font-mono text-sm font-bold md:text-xl" style={{ color: accent }}>{project.title}</p>
          <p className="mt-1 font-mono text-[8px] uppercase text-white/45 md:text-[10px]" style={{ letterSpacing: 1 }}>{project.category}</p>
          <div className="mt-5 space-y-2">
            {(project.architecture || []).slice(0, 5).map((step, index) => (
              <p key={step} className="border border-white/10 p-2 font-mono text-[8px] text-white/65 md:text-[10px]">
                <span className="mr-3" style={{ color: accent }}>{String(index + 1).padStart(2, '0')}</span>{step}
              </p>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (project.id === 'fortress-v2') {
    const columns = [
      ['Telemetry', 'CloudTrail', 'GuardDuty', 'WAF'],
      ['Detection', 'EventBridge', 'Security Hub', 'CloudWatch'],
      ['Response', 'Lambda isolation', 'SNS alerting', 'Analyst review'],
    ]

    return (
      <div className="absolute inset-0 flex items-center justify-center px-5 pt-24 pb-20">
        <div className="w-full max-w-3xl border border-[#f2aa4c]/40 bg-[#091015] p-5 md:p-8">
          <p className="font-mono text-sm font-bold text-[#f2aa4c] md:text-xl">FORTRESS v2</p>
          <p className="mt-1 font-mono text-[8px] uppercase text-white/45 md:text-[10px]" style={{ letterSpacing: 1 }}>AWS defense architecture / Terraform deployed</p>
          <div className="mt-5 grid grid-cols-3 gap-2 md:gap-4">
            {columns.map(([title, ...items]) => (
              <div key={title}>
                <p className="mb-2 font-mono text-[8px] uppercase text-[#f2aa4c] md:text-[10px]">{title}</p>
                {items.map((item) => <p key={item} className="mb-2 border border-white/10 p-2 font-mono text-[7px] text-white/70 md:text-[9px]">{item}</p>)}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center px-5 pt-24 pb-20">
      <img src={project.screenshot} alt={`${project.title} project interface`} className="max-h-full w-full max-w-3xl border border-white/15 object-contain" />
    </div>
  )
}

function ProjectThumbnail({ project }: { project: Project }) {
  const accent = projectAccent(project)
  if (project.id === 'fortress-v2' || project.id === 'pandie-foundation' || !project.screenshot) {
    return (
      <div className="flex aspect-[16/10] items-end border border-white/10 bg-[#010c1e] p-3" style={{ borderTopColor: accent }}>
        <div>
          <p className="font-mono text-[8px] uppercase text-white/35">{project.category}</p>
          <p className="mt-1 text-xs font-semibold text-white/85">{project.title}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="aspect-[16/10] overflow-hidden border border-white/10" style={{ borderTopColor: accent }}>
      <img src={project.screenshot} alt="" className="h-full w-full object-cover object-top opacity-75 transition-opacity group-hover:opacity-100" />
    </div>
  )
}

function GalleryModal({
  mode,
  active,
  onClose,
  onSelect,
}: {
  mode: 'overview' | 'evidence'
  active: Project
  onClose: () => void
  onSelect: (index: number) => void
}) {
  const accent = projectAccent(active)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 md:p-8" role="dialog" aria-modal="true" aria-label={mode === 'overview' ? 'All project overview' : `${active.title} evidence viewer`}>
      <div className="flex max-h-full w-full max-w-6xl flex-col overflow-hidden border border-white/15 bg-[#020818]" style={{ borderRadius: 6 }}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:px-6">
          <div>
            <p className="font-mono text-[9px] uppercase text-white/35" style={{ letterSpacing: 2 }}>{mode === 'overview' ? 'Complete portfolio' : active.category}</p>
            <h4 className="mt-1 text-sm font-semibold md:text-base">{mode === 'overview' ? `${GALLERY_PROJECTS.length} Project Systems` : active.title}</h4>
          </div>
          <button type="button" onClick={onClose} aria-label="Close viewer" title="Close" className="flex h-9 w-9 items-center justify-center border border-white/15 text-lg text-white/60 hover:border-white/40 hover:text-white" style={{ borderRadius: 5 }}>×</button>
        </div>

        {mode === 'overview' ? (
          <div className="grid overflow-y-auto p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:p-6">
            {GALLERY_PROJECTS.map((project, index) => (
              <button key={project.id} type="button" onClick={() => onSelect(index)} className="group border-b border-r border-white/10 p-2 text-left hover:bg-white/[0.035]">
                <ProjectThumbnail project={project} />
                <div className="mt-2 flex items-start gap-2 px-1 pb-1">
                  <span className="font-mono text-[9px]" style={{ color: projectAccent(project) }}>{project.num}</span>
                  <span className="min-w-0 text-[11px] leading-4 text-white/65 group-hover:text-white">{project.title}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="relative min-h-[300px] flex-1 overflow-hidden bg-[#020818] md:min-h-[560px]">
            {active.id === 'fortress-v2' || active.id === 'pandie-foundation'
              ? <StaticEvidence project={active} />
              : <img src={active.screenshot} alt={`${active.title} full project evidence`} className="h-full w-full object-contain p-3 md:p-6" />}
            <div className="absolute bottom-3 left-3 border border-white/10 bg-[#010c1e]/90 px-3 py-2 font-mono text-[9px] uppercase md:bottom-5 md:left-5" style={{ color: accent, borderRadius: 4 }}>
              Evidence {active.num} / {active.duration}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProjectNexus({ standalone = false }: { standalone?: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null)
  const [deepLinkReady, setDeepLinkReady] = useState(false)
  const [copied, setCopied] = useState(false)
  const [touring, setTouring] = useState(true)
  const [modal, setModal] = useState<'overview' | 'evidence' | null>(null)
  const pointerStart = useRef<{ x: number; y: number } | null>(null)
  const suppressSceneClickUntil = useRef(0)
  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )
  const active = GALLERY_PROJECTS[activeIndex]
  const accent = projectAccent(active)
  const metrics = PROOF_METRICS[active.id] || []

  useEffect(() => {
    const canvas = document.createElement('canvas')
    setWebglAvailable(Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl')))

    if (standalone) {
      const requested = new URLSearchParams(window.location.search).get('project')
      const requestedIndex = GALLERY_PROJECTS.findIndex((project) => project.id === requested)
      if (requestedIndex >= 0) setActiveIndex(requestedIndex)
    }
    setDeepLinkReady(true)
  }, [standalone])

  useEffect(() => {
    if (!standalone || !deepLinkReady) return
    const url = new URL(window.location.href)
    url.searchParams.set('project', active.id)
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
  }, [active.id, deepLinkReady, standalone])

  useEffect(() => {
    if (!touring || modal) return
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % GALLERY_PROJECTS.length)
    }, 4200)
    return () => window.clearInterval(timer)
  }, [modal, touring])

  useEffect(() => {
    if (!modal) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setModal(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [modal])

  const move = (direction: number) => {
    setTouring(false)
    setActiveIndex((current) => (current + direction + GALLERY_PROJECTS.length) % GALLERY_PROJECTS.length)
  }

  const selectProject = (index: number) => {
    setTouring(false)
    setActiveIndex(index)
  }

  const selectFromScene = (index: number) => {
    if (Date.now() < suppressSceneClickUntil.current) return
    selectProject(index)
  }

  const copyProjectLink = async () => {
    const url = new URL('/4d', window.location.origin)
    url.searchParams.set('project', active.id)
    try {
      await navigator.clipboard.writeText(url.toString())
    } catch {
      const input = document.createElement('textarea')
      input.value = url.toString()
      input.style.position = 'fixed'
      input.style.opacity = '0'
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      input.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <section
      aria-label="Project evidence gallery"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault()
          move(event.key === 'ArrowLeft' ? -1 : 1)
        }
      }}
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest('button, a')) return
        pointerStart.current = { x: event.clientX, y: event.clientY }
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerUp={(event) => {
        if (!pointerStart.current) return
        const deltaX = event.clientX - pointerStart.current.x
        const deltaY = event.clientY - pointerStart.current.y
        pointerStart.current = null
        if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25) {
          suppressSceneClickUntil.current = Date.now() + 300
          move(deltaX > 0 ? -1 : 1)
        }
      }}
      onPointerCancel={() => { pointerStart.current = null }}
      className={standalone
        ? 'relative min-h-screen touch-pan-y overflow-hidden outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white/35 lg:h-screen'
        : 'relative min-h-[940px] touch-pan-y overflow-hidden outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white/35 lg:h-[720px] lg:min-h-[680px]'}
      style={{ background: '#020818', color: '#e2eaff', borderTop: '1px solid rgba(0,212,255,0.12)', borderBottom: '1px solid rgba(0,212,255,0.12)' }}
    >
      <div className="grid min-h-[inherit] lg:h-full lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="relative h-[430px] min-h-[430px] overflow-hidden lg:h-auto lg:min-h-0">
          {webglAvailable !== false ? (
            <>
              <Canvas
                camera={{ position: [0, 0.2, 10.5], fov: 44 }}
                dpr={[1, 1.65]}
                gl={{ antialias: true, powerPreference: 'high-performance' }}
                shadows
              >
                <color attach="background" args={['#020818']} />
                <fog attach="fog" args={['#020818', 10, 24]} />
                <Suspense fallback={null}>
                  <GalleryScene activeIndex={activeIndex} reduced={reduced} onSelect={selectFromScene} />
                </Suspense>
              </Canvas>
              <LoadingProgress />
            </>
          ) : (
            <StaticEvidence project={active} />
          )}

          <div className="pointer-events-none absolute left-5 top-5 md:left-7 md:top-7">
            {standalone && (
              <a href="/#projects" className="pointer-events-auto mb-5 inline-block font-mono text-[10px] uppercase text-white/55 hover:text-white">
                ← Portfolio
              </a>
            )}
            <p className="font-mono text-[10px] uppercase text-white/45" style={{ letterSpacing: 2 }}>Interactive evidence gallery</p>
            <h2 className="mt-1 text-xl font-semibold md:text-2xl" style={{ letterSpacing: 0 }}>Project Evidence Gallery</h2>
          </div>

          <div className="absolute bottom-5 left-5 flex items-center gap-2 md:bottom-7 md:left-7">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Previous project"
              title="Previous project"
              className="flex h-10 w-10 items-center justify-center border border-white/15 text-lg text-white/70 transition-colors hover:border-white/40 hover:text-white"
              style={{ borderRadius: 6, background: 'rgba(2,8,24,0.82)' }}
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Next project"
              title="Next project"
              className="flex h-10 w-10 items-center justify-center border border-white/15 text-lg text-white/70 transition-colors hover:border-white/40 hover:text-white"
              style={{ borderRadius: 6, background: 'rgba(2,8,24,0.82)' }}
            >
              →
            </button>
            <span className="ml-2 font-mono text-[10px] text-white/45">
              {String(activeIndex + 1).padStart(2, '0')} / {String(GALLERY_PROJECTS.length).padStart(2, '0')}
            </span>
          </div>

          <div className="absolute bottom-5 right-5 flex items-center gap-2 md:bottom-7 md:right-7">
            <button
              type="button"
              onClick={() => setTouring((current) => !current)}
              aria-pressed={touring}
              className="border px-3 py-2 font-mono text-[9px] uppercase transition-colors"
              style={{ borderColor: touring ? accent : 'rgba(255,255,255,0.15)', color: touring ? accent : 'rgba(255,255,255,0.62)', borderRadius: 5, background: 'rgba(2,8,24,0.86)' }}
            >
              {touring ? 'Pause tour' : 'Start tour'}
            </button>
            <button
              type="button"
              onClick={() => { setTouring(false); setModal('overview') }}
              className="border border-white/15 px-3 py-2 font-mono text-[9px] uppercase text-white/65 transition-colors hover:border-white/40 hover:text-white"
              style={{ borderRadius: 5, background: 'rgba(2,8,24,0.86)' }}
            >
              Overview
            </button>
          </div>
        </div>

        <aside className="flex min-h-[510px] flex-col overflow-y-auto border-t border-white/10 p-5 md:p-7 lg:min-h-0 lg:border-l lg:border-t-0 lg:p-8">
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-[10px] uppercase" style={{ color: accent, letterSpacing: 2 }}>Selected evidence</span>
            <span className="font-mono text-[10px] text-white/35">{active.duration}</span>
          </div>

          <h3 className="mt-5 text-2xl font-semibold leading-tight" style={{ letterSpacing: 0 }}>{active.title}</h3>
          <p className="mt-2 text-sm text-white/50">{active.subtitle}</p>

          <div className="mt-5 grid grid-cols-2 border-l border-t border-white/10">
            <div className="border-b border-r border-white/10 p-2.5">
              <p className="font-mono text-[8px] uppercase text-white/28">Category</p>
              <p className="mt-1 text-[11px] text-white/68">{active.category}</p>
            </div>
            <div className="border-b border-r border-white/10 p-2.5">
              <p className="font-mono text-[8px] uppercase text-white/28">Status</p>
              <p className="mt-1 text-[11px] capitalize text-white/68">{active.status?.replace('-', ' ') || 'Documented'}</p>
            </div>
            <div className="col-span-2 border-b border-r border-white/10 p-2.5">
              <p className="font-mono text-[8px] uppercase text-white/28">Role</p>
              <p className="mt-1 text-[11px] text-white/68">{active.role}</p>
            </div>
          </div>

          <div className="mt-6 border-y border-white/10 py-5">
            <p className="font-mono text-[10px] uppercase text-white/35" style={{ letterSpacing: 2 }}>Verified impact</p>
            <p className="mt-3 text-sm leading-6 text-white/78">{active.impact}</p>
          </div>

          {metrics.length > 0 && (
            <div className="grid grid-cols-3 border-b border-white/10 py-5">
              {metrics.map((metric) => (
                <div key={metric.label} className="border-r border-white/10 px-2 first:pl-0 last:border-r-0 last:pr-0">
                  <p className="font-mono text-sm font-semibold md:text-base" style={{ color: accent }}>{metric.value}</p>
                  <p className="mt-1 text-[9px] leading-3 text-white/38">{metric.label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {active.stack.slice(0, 7).map((item) => (
              <span key={item} className="border border-white/10 px-2 py-1 font-mono text-[9px] uppercase text-white/55" style={{ borderRadius: 4 }}>
                {item}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { setTouring(false); setModal('evidence') }}
              className="border border-white/15 px-4 py-2 font-mono text-[10px] uppercase text-white/65 transition-colors hover:border-white/40 hover:text-white"
              style={{ borderRadius: 5, letterSpacing: 1 }}
            >
              Inspect evidence
            </button>
            <a
              href={`/projects/${active.id}`}
              className="px-4 py-2 font-mono text-[10px] uppercase text-[#071014] transition-opacity hover:opacity-85"
              style={{ background: accent, borderRadius: 5, letterSpacing: 1 }}
            >
              Case study →
            </a>
            <a
              href={active.github}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/15 px-4 py-2 font-mono text-[10px] uppercase text-white/65 transition-colors hover:border-white/40 hover:text-white"
              style={{ borderRadius: 5, letterSpacing: 1 }}
            >
              GitHub ↗
            </a>
            {active.demo && (
              <a
                href={active.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/15 px-4 py-2 font-mono text-[10px] uppercase text-white/65 transition-colors hover:border-white/40 hover:text-white"
                style={{ borderRadius: 5, letterSpacing: 1 }}
              >
                Live demo ↗
              </a>
            )}
            {standalone ? (
              <button
                type="button"
                onClick={copyProjectLink}
                className="border border-white/15 px-4 py-2 font-mono text-[10px] uppercase text-white/65 transition-colors hover:border-white/40 hover:text-white"
                style={{ borderRadius: 5, letterSpacing: 1 }}
              >
                {copied ? 'Link copied' : 'Copy link'}
              </button>
            ) : (
              <a
                href={`/4d?project=${active.id}`}
                className="border border-white/15 px-4 py-2 font-mono text-[10px] uppercase text-white/65 transition-colors hover:border-white/40 hover:text-white"
                style={{ borderRadius: 5, letterSpacing: 1 }}
              >
                Open full 3D ↗
              </a>
            )}
          </div>

          <div className="mt-auto pt-8">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-mono text-[10px] uppercase text-white/30" style={{ letterSpacing: 2 }}>All projects</p>
              <p className="font-mono text-[9px] text-white/30">{GALLERY_PROJECTS.length} total</p>
            </div>
            <div className="grid grid-cols-2 border-l border-t border-white/10">
              {GALLERY_PROJECTS.map((project, index) => {
                const selected = index === activeIndex
                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => selectProject(index)}
                    className="flex min-w-0 items-center gap-2 border-b border-r border-white/10 px-2 py-2.5 text-left transition-colors hover:text-white"
                    style={{ color: selected ? '#ffffff' : 'rgba(255,255,255,0.42)' }}
                  >
                    <span className="h-2 w-2 flex-none" style={{ borderRadius: 2, background: projectAccent(project), opacity: selected ? 1 : 0.45 }} />
                    <span className="font-mono text-[9px]">{project.num}</span>
                    <span className="min-w-0 truncate text-[11px]">{project.title}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </aside>
      </div>
      {modal && (
        <GalleryModal
          mode={modal}
          active={active}
          onClose={() => setModal(null)}
          onSelect={(index) => { selectProject(index); setModal(null) }}
        />
      )}
    </section>
  )
}
