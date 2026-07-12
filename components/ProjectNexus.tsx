'use client'
// =============================================================================
// PROJECT NEXUS — a cinematic 3D constellation of Joseph's real projects.
// Each node is a glowing crystalline core, color-coded by domain, clustered in
// 3D space and wired by a living neural network with traveling light pulses.
// Hover to light a node + its links; click to fly in and open the case study.
// Built only on primitives already proven in this project (no postprocessing
// dependency) — bloom is faked with additive glow sprites + emissive shells.
// =============================================================================
import { useReducer, useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import {
  NEXUS_NODES, NEXUS_EDGES, CATEGORY_COLORS, NEXUS_CATEGORIES,
  CORE_COLOR, BG, type NexusNode,
} from '@/lib/nexus/graph'

/* ─────────────────────────── radial glow texture ─────────────────────────── */
// A soft additive halo — the whole "bloom" look is built from these.
function makeGlowTexture(): THREE.Texture {
  const s = 128
  const cv = document.createElement('canvas')
  cv.width = cv.height = s
  const ctx = cv.getContext('2d')!
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.18, 'rgba(255,255,255,0.85)')
  g.addColorStop(0.45, 'rgba(255,255,255,0.28)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  const tex = new THREE.CanvasTexture(cv)
  tex.needsUpdate = true
  return tex
}

/* ─────────────────────────── drifting starfield ─────────────────────────── */
function Starfield({ glow, count = 1400 }: { glow: THREE.Texture; count?: number }) {
  const ref = useRef<THREE.Points>(null)
  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const c = new THREE.Color()
    for (let i = 0; i < count; i++) {
      // shell of stars around the scene
      const r = 24 + Math.random() * 40
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th)
      pos[i * 3 + 1] = r * Math.cos(ph)
      pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th)
      c.setHSL(0.55 + Math.random() * 0.12, 0.6, 0.55 + Math.random() * 0.35)
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return g
  }, [count])

  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.012 })

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        size={0.5} map={glow} vertexColors transparent opacity={0.85}
        sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/* ─────────────────────────── central core ─────────────────────────── */
function Core({ glow }: { glow: THREE.Texture }) {
  const shell = useRef<THREE.Mesh>(null)
  const inner = useRef<THREE.Mesh>(null)
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    if (shell.current) { shell.current.rotation.y += dt * 0.25; shell.current.rotation.x += dt * 0.08 }
    if (inner.current) {
      const s = 1 + Math.sin(t * 1.6) * 0.06
      inner.current.scale.setScalar(s)
    }
  })
  return (
    <group>
      <mesh ref={inner}>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshBasicMaterial color={CORE_COLOR} />
      </mesh>
      <mesh ref={shell}>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshBasicMaterial color={CORE_COLOR} wireframe transparent opacity={0.35} />
      </mesh>
      <Billboard>
        <mesh>
          <planeGeometry args={[6, 6]} />
          <meshBasicMaterial map={glow} color={CORE_COLOR} transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </Billboard>
    </group>
  )
}

/* ─────────────────────────── a single project node ─────────────────────────── */
function NexusNodeMesh({
  node, glow, focused, dim, hovered, onHover, onOut, onClick,
}: {
  node: NexusNode; glow: THREE.Texture
  focused: boolean; dim: number; hovered: boolean
  onHover: () => void; onOut: () => void; onClick: () => void
}) {
  const group = useRef<THREE.Group>(null)
  const shell = useRef<THREE.Mesh>(null)
  const halo = useRef<THREE.Mesh>(null)
  const ring = useRef<THREE.Group>(null)
  const color = useMemo(() => new THREE.Color(node.color), [node.color])
  const hoverV = useRef(0)
  const dimV = useRef(0)

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    hoverV.current = THREE.MathUtils.lerp(hoverV.current, hovered || focused ? 1 : 0, 0.15)
    dimV.current = THREE.MathUtils.lerp(dimV.current, dim, 0.12)

    if (group.current) {
      const drift = Math.sin(t * 0.6 + node.position[0]) * 0.06
      group.current.position.set(node.position[0], node.position[1] + drift, node.position[2])
      const lift = 1 + hoverV.current * 0.28
      const shrink = 1 - 0.35 * dimV.current
      group.current.scale.setScalar(node.baseScale * lift * shrink)
    }
    if (shell.current) shell.current.rotation.y += dt * (0.3 + node.activity * 0.5)
    if (halo.current) {
      const pulse = 0.55 + Math.sin(t * (1 + node.activity * 2) + node.position[2]) * 0.18 * node.activity
      const mat = halo.current.material as THREE.MeshBasicMaterial
      mat.opacity = (pulse + hoverV.current * 0.5) * (1 - dimV.current * 0.7)
      const hs = 1 + hoverV.current * 0.5
      halo.current.scale.setScalar(hs)
    }
    if (ring.current) ring.current.rotation.z += dt * 0.6
  })

  return (
    <group ref={group}>
      {/* bright emissive core */}
      <mesh>
        <sphereGeometry args={[0.34, 24, 24]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* rotating crystalline shell */}
      <mesh ref={shell}>
        <icosahedronGeometry args={[0.62, 0]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.55} />
      </mesh>
      {/* additive glow halo (the bloom) */}
      <Billboard>
        <mesh ref={halo}>
          <planeGeometry args={[2.9, 2.9]} />
          <meshBasicMaterial map={glow} color={color} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </Billboard>
      {/* featured projects get an orbiting particle ring */}
      {node.project.featured && (
        <group ref={ring} rotation={[Math.PI / 2.4, 0, 0]}>
          <mesh>
            <torusGeometry args={[0.95, 0.012, 8, 64]} />
            <meshBasicMaterial color={color} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>
      )}
      {/* generous invisible hit area so nodes are easy to click */}
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); onHover() }}
        onPointerOut={onOut}
        onClick={(e) => { e.stopPropagation(); onClick() }}
      >
        <sphereGeometry args={[1.1, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* label */}
      <Html position={[0, -1.0, 0]} center distanceFactor={12} zIndexRange={[10, 0]}>
        <div style={{
          pointerEvents: 'none', whiteSpace: 'nowrap', fontFamily: 'ui-monospace, monospace',
          fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
          color: hovered || focused ? '#ffffff' : 'rgba(220,235,245,0.7)',
          textShadow: '0 0 10px rgba(0,0,0,0.95)',
          opacity: 1 - dim * 0.65, transition: 'color 0.2s',
        }}>
          {node.project.title}
        </div>
      </Html>
    </group>
  )
}

/* ─────────────────────────── neural links ─────────────────────────── */
function Links({ activeId, filter }: { activeId: string | null; filter: string | null }) {
  const edgeGeo = useRef<THREE.BufferGeometry>(null)
  const pulseGeo = useRef<THREE.BufferGeometry>(null)
  const pos = useMemo(() => {
    const m: Record<string, THREE.Vector3> = {}
    NEXUS_NODES.forEach((n) => { m[n.id] = new THREE.Vector3(...n.position) })
    return m
  }, [])

  // static line positions
  const linePositions = useMemo(() => {
    const arr = new Float32Array(NEXUS_EDGES.length * 6)
    let i = 0
    NEXUS_EDGES.forEach(([a, b]) => {
      const A = pos[a], B = pos[b]
      arr[i++] = A.x; arr[i++] = A.y; arr[i++] = A.z
      arr[i++] = B.x; arr[i++] = B.y; arr[i++] = B.z
    })
    return arr
  }, [pos])

  useFrame((state) => {
    if (!pulseGeo.current || !NEXUS_EDGES.length) return
    const t = state.clock.elapsedTime
    const arr = pulseGeo.current.attributes.position.array as Float32Array
    let j = 0
    NEXUS_EDGES.forEach(([a, b], idx) => {
      const A = pos[a], B = pos[b]
      const ph = (t * 0.22 + idx * 0.137) % 1
      arr[j++] = A.x + (B.x - A.x) * ph
      arr[j++] = A.y + (B.y - A.y) * ph
      arr[j++] = A.z + (B.z - A.z) * ph
    })
    pulseGeo.current.attributes.position.needsUpdate = true
  })

  // opacity emphasis when a node is active / category filtered
  const nodeById = useMemo(() => Object.fromEntries(NEXUS_NODES.map((n) => [n.id, n])), [])
  const highlighted = !!activeId || !!filter
  const lineOpacity = highlighted ? 0.06 : 0.16

  return (
    <group>
      <lineSegments>
        <bufferGeometry ref={edgeGeo}>
          <bufferAttribute attach="attributes-position" count={NEXUS_EDGES.length * 2} array={linePositions} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color={CORE_COLOR} transparent opacity={lineOpacity} depthWrite={false} />
      </lineSegments>
      <points>
        <bufferGeometry ref={pulseGeo}>
          <bufferAttribute attach="attributes-position" count={NEXUS_EDGES.length} array={new Float32Array(NEXUS_EDGES.length * 3)} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color={'#dff6ff'} size={0.13} sizeAttenuation transparent opacity={highlighted ? 0.4 : 0.95} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  )
}

/* ─────────────────────────── FSM ─────────────────────────── */
type State = { mode: 'idle' | 'focusing' | 'focused' | 'returning'; focusId: string | null }
type Event =
  | { type: 'FOCUS'; id: string }
  | { type: 'ARRIVED' }
  | { type: 'RETURN' }
  | { type: 'RETURNED' }
const initial: State = { mode: 'idle', focusId: null }
function reducer(s: State, e: Event): State {
  switch (e.type) {
    case 'FOCUS': return { mode: 'focusing', focusId: e.id }
    case 'ARRIVED': return s.mode === 'focusing' ? { ...s, mode: 'focused' } : s
    case 'RETURN': return { ...s, mode: 'returning' }
    case 'RETURNED': return { mode: 'idle', focusId: null }
    default: return s
  }
}

/* ─────────────────────────── scene graph ─────────────────────────── */
function Scene({
  engine, dispatch, hoverId, setHoverId, filter, reduced, onIntro,
}: {
  engine: State; dispatch: React.Dispatch<Event>
  hoverId: string | null; setHoverId: (id: string | null) => void
  filter: string | null; reduced: boolean; onIntro: () => void
}) {
  const { camera, controls } = useThree() as any
  const glow = useMemo(makeGlowTexture, [])
  const pos = useMemo(() => {
    const m: Record<string, THREE.Vector3> = {}
    NEXUS_NODES.forEach((n) => { m[n.id] = new THREE.Vector3(...n.position) })
    return m
  }, [])
  const introDone = useRef(reduced)
  const introStart = useRef<number | null>(null)
  const desired = useRef(new THREE.Vector3())

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const k = 1 - Math.pow(0.0016, dt)

    // cinematic intro fly-in
    if (!introDone.current) {
      if (introStart.current === null) introStart.current = t
      const tt = Math.min((t - introStart.current) / 2.4, 1)
      const e = 1 - Math.pow(1 - tt, 3)
      camera.position.set(
        Math.sin(tt * 0.6) * 2,
        THREE.MathUtils.lerp(9, 3, e),
        THREE.MathUtils.lerp(52, 20, e),
      )
      if (controls) { controls.target.set(0, 0, 0); controls.update() }
      if (tt >= 1) { introDone.current = true; onIntro() }
      return
    }

    // fly-to focus / return
    if (engine.mode === 'focusing' || engine.mode === 'focused') {
      const target = engine.focusId ? pos[engine.focusId] : null
      if (target) {
        desired.current.copy(target).add(new THREE.Vector3(2.4, 1.4, 3.6))
        camera.position.lerp(desired.current, k)
        if (controls) { controls.target.lerp(target, k); controls.update() }
        if (engine.mode === 'focusing' && camera.position.distanceTo(desired.current) < 0.2) dispatch({ type: 'ARRIVED' })
      }
    } else if (engine.mode === 'returning') {
      desired.current.set(0, 3, 20)
      camera.position.lerp(desired.current, k)
      if (controls) { controls.target.lerp(new THREE.Vector3(0, 0, 0), k); controls.update() }
      if (camera.position.distanceTo(desired.current) < 0.4) dispatch({ type: 'RETURNED' })
    }
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 12, 10]} intensity={60} color={CORE_COLOR} />
      <Starfield glow={glow} count={reduced ? 500 : 1400} />
      <Core glow={glow} />
      <Links activeId={engine.focusId} filter={filter} />
      {NEXUS_NODES.map((n) => {
        const filteredOut = filter ? n.project.category !== filter : false
        const focusDim = engine.focusId && engine.focusId !== n.id ? 1 : 0
        const dim = Math.max(focusDim, filteredOut ? 0.85 : 0)
        return (
          <NexusNodeMesh
            key={n.id}
            node={n}
            glow={glow}
            focused={engine.focusId === n.id}
            hovered={hoverId === n.id}
            dim={dim}
            onHover={() => { setHoverId(n.id); document.body.style.cursor = 'pointer' }}
            onOut={() => { setHoverId(null); document.body.style.cursor = 'default' }}
            onClick={() => dispatch({ type: 'FOCUS', id: n.id })}
          />
        )
      })}
    </>
  )
}

/* ─────────────────────────── live signal (focus panel) ─────────────────────────── */
function useSignal(active: boolean) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setV(38 + Math.round((Math.sin(Date.now() / 1400) + 1) * 26) + Math.floor(Math.random() * 8)), 420)
    return () => clearInterval(id)
  }, [active])
  return v
}

/* ─────────────────────────── root + HUD ─────────────────────────── */
const lbl = 'font-mono uppercase tracking-[0.25em] text-[10px] text-white/40'

export default function ProjectNexus() {
  const [engine, dispatch] = useReducer(reducer, initial)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [filter, setFilter] = useState<string | null>(null)
  const [, setIntroDone] = useState(false)
  const focused = engine.focusId ? NEXUS_NODES.find((n) => n.id === engine.focusId)! : null
  const signal = useSignal(engine.mode === 'focused')

  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

  const p = focused?.project

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: BG, color: '#dcebf5' }}>
      <Canvas
        camera={{ position: [0, 9, 52], fov: 55 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onPointerMissed={() => { if (engine.mode === 'focused' || engine.mode === 'focusing') dispatch({ type: 'RETURN' }) }}
      >
        <color attach="background" args={[BG]} />
        <fog attach="fog" args={[BG, 22, 60]} />
        <Scene
          engine={engine} dispatch={dispatch}
          hoverId={hoverId} setHoverId={setHoverId}
          filter={filter} reduced={reduced}
          onIntro={() => setIntroDone(true)}
        />
        <OrbitControls
          makeDefault enablePan={false}
          enableZoom={engine.mode === 'focused'}
          autoRotate={engine.mode === 'idle' && !reduced}
          autoRotateSpeed={0.35}
          minDistance={4} maxDistance={44}
          enableDamping dampingFactor={0.08}
        />
      </Canvas>

      {/* cinematic framing */}
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 46%, rgba(3,6,15,0.72) 100%)' }} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ background: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 3px)' }} />

      {/* title */}
      <div className="pointer-events-none absolute top-6 left-6 select-none">
        <div className={lbl}>Interactive Constellation</div>
        <div className="font-mono text-lg tracking-[0.2em] mt-1" style={{ color: '#eaf6ff' }}>PROJECT NEXUS</div>
        <div className={lbl + ' mt-3'}>{NEXUS_NODES.length} projects · drag to orbit · click a node</div>
      </div>

      {/* overview button */}
      <AnimatePresence>
        {engine.mode !== 'idle' && (
          <motion.button
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            onClick={() => dispatch({ type: 'RETURN' })}
            className="absolute top-6 right-6 font-mono uppercase tracking-[0.2em] text-[10px] px-4 py-2 border border-white/15 hover:border-white/40 transition-colors z-20"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            ← overview
          </motion.button>
        )}
      </AnimatePresence>

      {/* category legend / filter */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-x-4 gap-y-2 max-w-[92vw] px-4">
        {NEXUS_CATEGORIES.map((c) => {
          const active = filter === c
          return (
            <button
              key={c}
              onClick={() => setFilter(active ? null : c)}
              className="flex items-center gap-1.5 font-mono uppercase tracking-[0.15em] text-[9px] transition-opacity"
              style={{ color: active ? '#ffffff' : 'rgba(220,235,245,0.5)', opacity: filter && !active ? 0.4 : 1 }}
            >
              <span style={{ width: 8, height: 8, borderRadius: 9, background: CATEGORY_COLORS[c], boxShadow: `0 0 8px ${CATEGORY_COLORS[c]}` }} />
              {c}
            </button>
          )
        })}
      </div>

      {/* focus detail panel */}
      <AnimatePresence>
        {engine.mode === 'focused' && p && (
          <motion.aside
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="absolute top-1/2 -translate-y-1/2 right-6 w-[340px] max-h-[82vh] overflow-y-auto p-5 backdrop-blur-md z-20"
            style={{ background: 'rgba(8,12,20,0.82)', border: `1px solid ${focused!.color}55` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono uppercase tracking-[0.2em] text-[10px]" style={{ color: focused!.color }}>{p.category}</span>
              {p.status && <span className="font-mono text-[8px] uppercase tracking-wider px-1.5 py-0.5 border" style={{ color: focused!.color, borderColor: `${focused!.color}55` }}>{p.status}</span>}
            </div>
            <div className="font-mono text-base tracking-[0.12em] mb-0.5">{p.title}</div>
            <div className="text-[11px] text-white/45 mb-3">{p.subtitle}</div>
            <p className="text-[11px] leading-relaxed text-white/65 mb-3">{p.description}</p>
            <div className="border-l-2 pl-3 mb-4 text-[11px] leading-relaxed text-white/75" style={{ borderColor: focused!.color }}>{p.impact}</div>

            <div className={lbl + ' mb-2'}>live signal</div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-mono text-[9px] uppercase tracking-wider text-white/40">throughput</span>
              <span className="font-mono text-[12px]" style={{ color: focused!.color }}>{signal}/s</span>
            </div>
            <div className="h-[2px] w-full bg-white/10 mb-4"><div className="h-full transition-all duration-300" style={{ width: `${signal}%`, background: focused!.color }} /></div>

            <div className={lbl + ' mb-2'}>stack</div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {p.stack.slice(0, 8).map((s) => (
                <span key={s} className="font-mono text-[9px] uppercase tracking-wider px-2 py-1 border border-white/10 text-white/60">{s}</span>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {p.demo && <a href={p.demo} target="_blank" rel="noopener noreferrer" className="font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 border" style={{ color: focused!.color, borderColor: `${focused!.color}55` }}>Live →</a>}
              <a href={p.github} target="_blank" rel="noopener noreferrer" className="font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 border border-white/15 text-white/60">GitHub →</a>
              <a href={`/projects/${p.id}`} className="font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 border border-white/15 text-white/60">Case Study →</a>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}
