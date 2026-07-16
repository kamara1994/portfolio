'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Html, useProgress, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { projects, type Project } from '@/data/projects'

const FEATURED = projects.filter((project) => project.featured)

const ACCENTS: Record<string, string> = {
  'blue-soc-p8': '#21c7e8',
  'fortress-v2': '#f2aa4c',
  'blue-x': '#42d392',
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
  const [hovered, setHovered] = useState(false)
  const accent = projectAccent(project)

  useFrame((state, delta) => {
    if (!group.current) return

    let offset = index - activeIndex
    if (offset > FEATURED.length / 2) offset -= FEATURED.length
    if (offset < -FEATURED.length / 2) offset += FEATURED.length

    const active = offset === 0
    const targetX = offset * 5.25
    const targetY = active ? 0.25 : -0.3
    const targetZ = active ? 0 : -2.2
    const targetRotation = active ? 0 : offset > 0 ? -0.3 : 0.3
    const targetScale = (active ? 1 : 0.76) + (hovered ? 0.035 : 0)
    const ease = reduced ? 1 : 1 - Math.pow(0.0008, delta)

    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, targetX, ease)
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, targetY, ease)
    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, targetZ, ease)
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotation, ease)
    group.current.rotation.x = reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.45 + index) * 0.012
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
  useFrame((state, delta) => {
    if (reduced) return
    const targetX = state.pointer.x * 0.32
    const targetY = 0.2 + state.pointer.y * 0.18
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, delta * 1.8)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, delta * 1.8)
    state.camera.lookAt(0, 0, 0)
  })

  return (
    <>
      <ambientLight intensity={1.4} />
      <directionalLight position={[4, 8, 7]} intensity={2.4} color="#d7edf1" castShadow />
      <pointLight position={[-7, -2, 5]} intensity={22} color="#21c7e8" />
      <pointLight position={[7, 2, 3]} intensity={18} color="#f2aa4c" />
      <SignalField reduced={reduced} />

      {FEATURED.map((project, index) => (
        <EvidenceFrame
          key={project.id}
          project={project}
          index={index}
          activeIndex={activeIndex}
          reduced={reduced}
          onSelect={() => onSelect(index)}
        />
      ))}

      <ContactShadows position={[0, -2.05, 0]} opacity={0.42} scale={18} blur={2.8} far={8} color="#000000" />
      <gridHelper args={[32, 32, '#28404a', '#111a1f']} position={[0, -2.08, 0]} />
    </>
  )
}

function LoadingProgress() {
  const { active, progress } = useProgress()
  if (!active && progress >= 100) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[#07090c]" role="status" aria-live="polite">
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

export default function ProjectNexus({ standalone = false }: { standalone?: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null)
  const [deepLinkReady, setDeepLinkReady] = useState(false)
  const [copied, setCopied] = useState(false)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )
  const active = FEATURED[activeIndex]
  const accent = projectAccent(active)
  const metrics = PROOF_METRICS[active.id] || []

  useEffect(() => {
    const canvas = document.createElement('canvas')
    setWebglAvailable(Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl')))

    if (standalone) {
      const requested = new URLSearchParams(window.location.search).get('project')
      const requestedIndex = FEATURED.findIndex((project) => project.id === requested)
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

  const move = (direction: number) => {
    setActiveIndex((current) => (current + direction + FEATURED.length) % FEATURED.length)
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
      aria-label="Featured project evidence gallery"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault()
          move(event.key === 'ArrowLeft' ? -1 : 1)
        }
      }}
      onTouchStart={(event) => {
        const touch = event.changedTouches[0]
        touchStart.current = { x: touch.clientX, y: touch.clientY }
      }}
      onTouchEnd={(event) => {
        if (!touchStart.current) return
        const touch = event.changedTouches[0]
        const deltaX = touch.clientX - touchStart.current.x
        const deltaY = touch.clientY - touchStart.current.y
        touchStart.current = null
        if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25) move(deltaX > 0 ? -1 : 1)
      }}
      className={standalone
        ? 'relative min-h-screen overflow-hidden outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white/35 lg:h-screen'
        : 'relative min-h-[940px] overflow-hidden outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white/35 lg:h-[720px] lg:min-h-[680px]'}
      style={{ background: '#07090c', color: '#edf3f5', borderTop: '1px solid rgba(255,255,255,0.09)', borderBottom: '1px solid rgba(255,255,255,0.09)' }}
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
                <color attach="background" args={['#07090c']} />
                <fog attach="fog" args={['#07090c', 10, 24]} />
                <Suspense fallback={null}>
                  <GalleryScene activeIndex={activeIndex} reduced={reduced} onSelect={setActiveIndex} />
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
            <h2 className="mt-1 text-xl font-semibold md:text-2xl" style={{ letterSpacing: 0 }}>Flagship Security Systems</h2>
          </div>

          <div className="absolute bottom-5 left-5 flex items-center gap-2 md:bottom-7 md:left-7">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Previous project"
              title="Previous project"
              className="flex h-10 w-10 items-center justify-center border border-white/15 text-lg text-white/70 transition-colors hover:border-white/40 hover:text-white"
              style={{ borderRadius: 6, background: 'rgba(7,9,12,0.8)' }}
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Next project"
              title="Next project"
              className="flex h-10 w-10 items-center justify-center border border-white/15 text-lg text-white/70 transition-colors hover:border-white/40 hover:text-white"
              style={{ borderRadius: 6, background: 'rgba(7,9,12,0.8)' }}
            >
              →
            </button>
            <span className="ml-2 font-mono text-[10px] text-white/45">
              {String(activeIndex + 1).padStart(2, '0')} / {String(FEATURED.length).padStart(2, '0')}
            </span>
          </div>
        </div>

        <aside className="flex min-h-[510px] flex-col border-t border-white/10 p-5 md:p-7 lg:min-h-0 lg:border-l lg:border-t-0 lg:p-8">
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-[10px] uppercase" style={{ color: accent, letterSpacing: 2 }}>Selected evidence</span>
            <span className="font-mono text-[10px] text-white/35">{active.duration}</span>
          </div>

          <h3 className="mt-5 text-2xl font-semibold leading-tight" style={{ letterSpacing: 0 }}>{active.title}</h3>
          <p className="mt-2 text-sm text-white/50">{active.subtitle}</p>

          <div className="mt-6 border-y border-white/10 py-5">
            <p className="font-mono text-[10px] uppercase text-white/35" style={{ letterSpacing: 2 }}>Verified impact</p>
            <p className="mt-3 text-sm leading-6 text-white/78">{active.impact}</p>
          </div>

          <div className="grid grid-cols-3 border-b border-white/10 py-5">
            {metrics.map((metric) => (
              <div key={metric.label} className="border-r border-white/10 px-2 first:pl-0 last:border-r-0 last:pr-0">
                <p className="font-mono text-sm font-semibold md:text-base" style={{ color: accent }}>{metric.value}</p>
                <p className="mt-1 text-[9px] leading-3 text-white/38">{metric.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {active.stack.slice(0, 7).map((item) => (
              <span key={item} className="border border-white/10 px-2 py-1 font-mono text-[9px] uppercase text-white/55" style={{ borderRadius: 4 }}>
                {item}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
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
            <p className="mb-3 font-mono text-[10px] uppercase text-white/30" style={{ letterSpacing: 2 }}>Flagship index</p>
            <div className="border-t border-white/10">
              {FEATURED.map((project, index) => {
                const selected = index === activeIndex
                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className="flex w-full items-center gap-3 border-b border-white/10 py-3 text-left transition-colors hover:text-white"
                    style={{ color: selected ? '#ffffff' : 'rgba(255,255,255,0.42)' }}
                  >
                    <span className="h-2 w-2 flex-none" style={{ borderRadius: 2, background: projectAccent(project), opacity: selected ? 1 : 0.45 }} />
                    <span className="font-mono text-[10px]">{project.num}</span>
                    <span className="min-w-0 truncate text-sm">{project.title}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
