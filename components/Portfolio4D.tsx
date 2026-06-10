'use client'
// =============================================================================
// Portfolio4D — observation engine over your REAL projects.
// Signature: a schematic floor grid that bends into gravity wells under each
// project, well depth driven by the timeline (the 4D pull of milestones).
// Motion: gentle ambient sway + inertia-damped mouse parallax. No auto-spin.
// Place at: components/Portfolio4D.tsx
// =============================================================================
import { useReducer, useRef, useMemo, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import {
  NODES_4D, EPOCHS, ACCENT, BG,
  engineReducer, initialEngineState,
  type EngineState, type EngineEvent, type Node4D,
} from '@/lib/portfolio4d/projects4d'

/* ─────────────────────────── schematic gravity grid ─────────────────────────── */
// Vertices dip toward each project (well depth = its timeline pull). The grid
// physically flexes; lines glow over the wells.
const GRID_VERT = /* glsl */`
  uniform vec3 uNodes[12];   // x = world.x, y = world.z, z = pull(0..1)
  uniform int  uCount;
  varying float vWell;
  varying vec2  vGrid;
  void main() {
    vec3 pos = position;
    vec2 lp = pos.xy;             // plane-local coords (x, -worldZ)
    float well = 0.0;
    for (int i = 0; i < 12; i++) {
      if (i >= uCount) break;
      vec2 np = vec2(uNodes[i].x, -uNodes[i].y);
      float d2 = dot(lp - np, lp - np);
      well += uNodes[i].z * exp(-d2 * 0.06);
    }
    vWell = well;
    vGrid = lp;
    pos.z = -well * 1.6;          // local z -> world -y (dip downward)
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`
const GRID_FRAG = /* glsl */`
  precision highp float;
  varying float vWell;
  varying vec2  vGrid;
  uniform vec3  uColor;
  uniform float uTime;
  float gline(vec2 p, float s, float w) { vec2 f = fract(p * s); vec2 d = min(f, 1.0 - f); return 1.0 - smoothstep(0.0, w, min(d.x, d.y)); }
  void main() {
    float fine  = gline(vGrid, 0.5, 0.02);
    float major = gline(vGrid, 0.1, 0.012);
    float glow  = clamp(vWell * 0.5, 0.0, 1.0);
    vec3 col = uColor * (0.20 + glow * 1.4);
    float a = fine * (0.08 + glow * 0.55) + major * 0.10 + glow * 0.12;
    gl_FragColor = vec4(col, a);
  }
`

/* ─────────────────────────── node panel shaders ─────────────────────────── */
const PANEL_VERT = /* glsl */`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`
const PANEL_FRAG = /* glsl */`
  uniform float uTime; uniform float uActivity; uniform float uFocused; uniform float uHover; uniform float uAlive; uniform float uDim; uniform vec3 uColor;
  varying vec2 vUv;
  float rrect(vec2 p, vec2 b, float r){ vec2 d = abs(p) - b + r; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r; }
  float hash(float n){ return fract(sin(n * 78.233) * 43758.5453); }
  void main() {
    vec2 uv = vUv; vec2 p = uv - 0.5;
    float sd = rrect(p, vec2(0.5, 0.5), 0.05);
    float mask = smoothstep(0.004, -0.004, sd);
    float border = smoothstep(0.05, 0.0, abs(sd));
    float row = floor(uv.y * 14.0);
    float speed = 0.4 + hash(row) * 1.2;
    float barLen = 0.12 + 0.7 * fract(hash(row * 2.0) + uTime * 0.06 * speed);
    float bar = step(0.08, uv.x) * step(uv.x, 0.08 + barLen);
    float rowMask = smoothstep(0.12, 0.0, abs(fract(uv.y * 14.0) - 0.5)) * bar;
    float scan = 0.5 + 0.5 * sin(uv.y * 200.0);
    float act = 0.25 + uActivity * 0.75;
    vec3 screen = vec3(0.02, 0.035, 0.05);
    screen += uColor * rowMask * 0.5 * act;
    screen += uColor * scan * 0.02;
    float glow = border * (0.35 + 0.6 * uHover + uFocused * 0.7 + uActivity * 0.3);
    vec3 col = (screen + uColor * glow) * (1.0 - 0.4 * uDim);
    float alpha = (mask * 0.92 + glow * 0.5) * (0.18 + 0.82 * uAlive) * (1.0 - 0.6 * uDim);
    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
  }
`

/* ─────────────────────────── node face (screenshot, else feed) ─────────────────────────── */
function makeGlowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grd.addColorStop(0, 'rgba(190,232,255,0.9)')
  grd.addColorStop(0.25, 'rgba(127,223,255,0.45)')
  grd.addColorStop(1, 'rgba(127,223,255,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

function useImageTexture(src?: string) {
  const [tex, setTex] = useState<THREE.Texture | null>(null)
  useEffect(() => {
    if (!src) { setTex(null); return }
    let alive = true
    new THREE.TextureLoader().load(
      src,
      (t) => { if (alive) { try { (t as any).colorSpace = (THREE as any).SRGBColorSpace ?? (t as any).colorSpace } catch {} ; setTex(t) } },
      undefined,
      () => { if (alive) setTex(null) }
    )
    return () => { alive = false }
  }, [src])
  return tex
}

function NodeFace({ node, uniforms, glowTex }: { node: Node4D; uniforms: any; glowTex: THREE.Texture }) {
  const img = useImageTexture(node.project.screenshot)
  return (
    <>
      <mesh position={[0, 0, -0.06]} scale={1.9}>
        <planeGeometry args={[1.6, 1.2]} />
        <meshBasicMaterial map={glowTex} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh scale={1.06}>
        <planeGeometry args={[1.6, 0.95]} />
        <shaderMaterial uniforms={uniforms} vertexShader={PANEL_VERT} fragmentShader={PANEL_FRAG} transparent depthWrite={false} />
      </mesh>
      {img && (
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[1.6, 0.95]} />
          <meshBasicMaterial map={img} toneMapped={false} transparent />
        </mesh>
      )}
    </>
  )
}

/* ─────────────────────────── scene ─────────────────────────── */
function Scene({
  engine, dispatch, pointer, reduced, onIntroDone,
}: {
  engine: EngineState
  dispatch: (e: EngineEvent) => void
  pointer: React.MutableRefObject<THREE.Vector2>
  reduced: boolean
  onIntroDone: () => void
}) {
  const { camera } = useThree()
  const controls = useThree((s) => s.controls) as any

  const world = useRef<THREE.Group>(null)
  const groups = useRef<Record<string, THREE.Group>>({})
  const posCache = useRef<Record<string, THREE.Vector3>>({})
  const hoverTarget = useRef<Record<string, number>>({})
  const dimVal = useRef<Record<string, number>>({})
  const edgeGeo = useRef<THREE.BufferGeometry>(null)
  const pulseGeo = useRef<THREE.BufferGeometry>(null)
  const gridMat = useRef<THREE.ShaderMaterial>(null)
  const camMouse = useRef(new THREE.Vector2(0, 0))
  const swayAmp = useRef(0)
  const introStart = useRef<number | null>(null)
  const introDoneRef = useRef(reduced)
  const glowTex = useMemo(() => makeGlowTexture(), [])

  useMemo(() => {
    NODES_4D.forEach((n) => {
      posCache.current[n.id] = new THREE.Vector3(...n.position)
      hoverTarget.current[n.id] = 0
      dimVal.current[n.id] = 0
    })
  }, [])

  const nodeUniforms = useMemo(() => {
    const u: Record<string, any> = {}
    NODES_4D.forEach((n) => {
      u[n.id] = {
        uTime: { value: 0 }, uActivity: { value: 0 }, uFocused: { value: 0 },
        uHover: { value: 0 }, uAlive: { value: 1 }, uDim: { value: 0 }, uColor: { value: new THREE.Color(ACCENT) },
      }
    })
    return u
  }, [])

  const gridUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(ACCENT) },
    uCount: { value: Math.min(NODES_4D.length, 12) },
    uNodes: { value: Array.from({ length: 12 }, () => new THREE.Vector3()) },
  }), [])

  const edges = useMemo(() => {
    const seen = new Set<string>()
    const list: [string, string][] = []
    NODES_4D.forEach((n) => n.links.forEach((l) => {
      const key = [n.id, l].sort().join('|')
      if (!seen.has(key)) { seen.add(key); list.push([n.id, l]) }
    }))
    return list
  }, [])

  const desiredCam = useRef(new THREE.Vector3())

  useFrame((state, dt) => {
    const year = 2023 + engine.timeline
    const time = state.clock.elapsedTime
    const k = 1 - Math.pow(0.0015, dt)

    // cinematic boot
    if (!introDoneRef.current) {
      if (introStart.current === null) introStart.current = time
      const tt = Math.min((time - introStart.current) / 2.6, 1)
      const e = 1 - Math.pow(1 - tt, 3)
      camera.position.set(0, THREE.MathUtils.lerp(6, 2, e), THREE.MathUtils.lerp(42, 16, e))
      if (controls) { controls.target.set(0, 0, 0); controls.update() }
      if (tt >= 1) { introDoneRef.current = true; onIntroDone() }
    }

    // nodes + grid wells
    NODES_4D.forEach((n, idx) => {
      const alive = THREE.MathUtils.smoothstep(year, n.startYear - 0.6, n.startYear + 0.2)
      const base = posCache.current[n.id]
      const g = groups.current[n.id]
      const u = nodeUniforms[n.id]
      const dimT = engine.focusId && engine.focusId !== n.id ? 1 : 0
      dimVal.current[n.id] = THREE.MathUtils.lerp(dimVal.current[n.id] ?? 0, dimT, 0.12)
      if (g) {
        const drift = Math.sin(time * 0.5 + base.x) * 0.05
        g.position.set(base.x, base.y + drift, base.z)
        const lift = 1 + u.uHover.value * 0.12
        const shrink = 1 - 0.16 * dimVal.current[n.id]
        g.scale.setScalar(THREE.MathUtils.lerp(0.28, n.baseScale, alive) * lift * shrink)
      }
      u.uTime.value = time
      u.uActivity.value = n.activity * (0.15 + 0.85 * alive)
      u.uFocused.value = engine.focusId === n.id ? 1 : 0
      u.uAlive.value = alive
      u.uDim.value = dimVal.current[n.id]
      u.uHover.value = THREE.MathUtils.lerp(u.uHover.value, hoverTarget.current[n.id] ?? 0, 0.15)
      // feed the grid: (world.x, world.z, pull)
      if (idx < 12) gridUniforms.uNodes.value[idx].set(base.x, base.z, alive * (0.6 + 0.4 * n.baseScale))
    })

    if (edgeGeo.current) {
      const arr = edgeGeo.current.attributes.position.array as Float32Array
      let i = 0
      edges.forEach(([x, y]) => {
        const A = posCache.current[x], B = posCache.current[y]
        arr[i++] = A.x; arr[i++] = A.y; arr[i++] = A.z
        arr[i++] = B.x; arr[i++] = B.y; arr[i++] = B.z
      })
      edgeGeo.current.attributes.position.needsUpdate = true
    }

    if (pulseGeo.current && edges.length) {
      const arr = pulseGeo.current.attributes.position.array as Float32Array
      let j = 0
      edges.forEach(([x, y], idx) => {
        const A = posCache.current[x], B = posCache.current[y]
        const ph = (time * 0.18 + idx * 0.137) % 1
        arr[j++] = A.x + (B.x - A.x) * ph
        arr[j++] = A.y + (B.y - A.y) * ph
        arr[j++] = A.z + (B.z - A.z) * ph
      })
      pulseGeo.current.attributes.position.needsUpdate = true
    }

    if (gridMat.current) gridUniforms.uTime.value = time

    // gentle sway + inertia mouse parallax (applied to the world group, not the camera —
    // so your drag-to-orbit still fully controls the view). Eases to 0 when focused.
    camMouse.current.lerp(pointer.current, 0.05)
    const ampTarget = !reduced && introDoneRef.current && engine.state === 'idle' ? 1 : 0
    swayAmp.current = THREE.MathUtils.lerp(swayAmp.current, ampTarget, 0.05)
    if (world.current) {
      const a = swayAmp.current
      world.current.rotation.y = (camMouse.current.x * 0.10 + Math.sin(time * 0.05) * 0.02) * a
      world.current.rotation.x = (-camMouse.current.y * 0.06 + Math.sin(time * 0.04) * 0.015) * a
    }

    // cinematic camera fly-to
    if (engine.state === 'focusing' || engine.state === 'focused') {
      const target = engine.focusId ? posCache.current[engine.focusId] : null
      if (target) {
        desiredCam.current.copy(target).add(new THREE.Vector3(2.0, 1.1, 3.0))
        camera.position.lerp(desiredCam.current, k)
        if (controls) { controls.target.lerp(target, k); controls.update() }
        if (engine.state === 'focusing' && camera.position.distanceTo(desiredCam.current) < 0.18) dispatch({ type: 'ARRIVED' })
      }
    } else if (engine.state === 'returning') {
      desiredCam.current.set(0, 2, 16)
      camera.position.lerp(desiredCam.current, k)
      if (controls) { controls.target.lerp(new THREE.Vector3(0, 0, 0), k); controls.update() }
      if (camera.position.distanceTo(desiredCam.current) < 0.35) dispatch({ type: 'RETURNED' })
    }
  })

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[8, 10, 8]} intensity={45} color={ACCENT} />

      <group ref={world}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
          <planeGeometry args={[80, 80, 150, 150]} />
          <shaderMaterial ref={gridMat} uniforms={gridUniforms} vertexShader={GRID_VERT} fragmentShader={GRID_FRAG} transparent depthWrite={false} />
        </mesh>

        <lineSegments>
          <bufferGeometry ref={edgeGeo}>
            <bufferAttribute attach="attributes-position" count={edges.length * 2} array={new Float32Array(edges.length * 6)} itemSize={3} />
          </bufferGeometry>
          <lineBasicMaterial color={ACCENT} transparent opacity={0.14} />
        </lineSegments>

        <points>
          <bufferGeometry ref={pulseGeo}>
            <bufferAttribute attach="attributes-position" count={edges.length} array={new Float32Array(edges.length * 3)} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial color={'#dff6ff'} size={0.16} sizeAttenuation transparent opacity={0.95} blending={THREE.AdditiveBlending} depthWrite={false} />
        </points>

        {NODES_4D.map((n) => (
          <group
            key={n.id}
            ref={(el) => { if (el) groups.current[n.id] = el }}
            onClick={(e) => { e.stopPropagation(); dispatch({ type: 'FOCUS', id: n.id }) }}
            onPointerOver={() => { hoverTarget.current[n.id] = 1; document.body.style.cursor = 'pointer' }}
            onPointerOut={() => { hoverTarget.current[n.id] = 0; document.body.style.cursor = 'default' }}
          >
            <Billboard>
              <Suspense fallback={null}>
                <NodeFace node={n} uniforms={nodeUniforms[n.id]} glowTex={glowTex} />
              </Suspense>
            </Billboard>
            <Html position={[0, -0.72, 0]} center distanceFactor={11} occlude={false} zIndexRange={[10, 0]}>
              <div style={{ pointerEvents: 'none', whiteSpace: 'nowrap', fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(220,235,245,0.85)', textShadow: '0 0 8px rgba(0,0,0,0.9)' }}>
                {n.project.title}
              </div>
            </Html>
          </group>
        ))}
      </group>
    </>
  )
}

/* ─────────────────────────── live signal ─────────────────────────── */
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

export default function Portfolio4D() {
  const [engine, dispatch] = useReducer(engineReducer, initialEngineState)
  const pointer = useRef(new THREE.Vector2(0, 0))
  const focused = engine.focusId ? NODES_4D.find((n) => n.id === engine.focusId)! : null
  const signal = useSignal(engine.state === 'focused')

  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )
  const [, setIntroDone] = useState(reduced)

  const onMove = (e: React.PointerEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    pointer.current.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1))
  }

  const p = focused?.project
  const epochLabel = EPOCHS[Math.round(engine.timeline)] ?? EPOCHS[EPOCHS.length - 1]

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: BG, color: '#dcebf5' }} onPointerMove={onMove}>
      <Canvas
        camera={{ position: [0, 2, 16], fov: 52 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
        onPointerMissed={() => { if (engine.state === 'focused' || engine.state === 'focusing') dispatch({ type: 'RETURN' }) }}
      >
        <color attach="background" args={[BG]} />
        <fog attach="fog" args={[BG, 16, 40]} />
        <Scene engine={engine} dispatch={dispatch} pointer={pointer} reduced={reduced} onIntroDone={() => setIntroDone(true)} />
        <OrbitControls makeDefault enablePan={false} enableZoom={engine.state === 'focused'} minDistance={3} maxDistance={30} enableDamping dampingFactor={0.08} />
      </Canvas>

      {/* cinematic framing */}
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 48%, rgba(2,5,12,0.7) 100%)' }} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ background: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 3px)' }} />

      <div className="pointer-events-none absolute top-6 left-6 select-none">
        <div className={lbl}>Observation Engine</div>
        <div className="font-mono text-lg tracking-[0.2em] mt-1">JOSEPH · 4D</div>
        <div className={lbl + ' mt-3'}>{NODES_4D.length} projects · drag to orbit</div>
      </div>

      <AnimatePresence>
        {engine.state !== 'idle' && (
          <motion.button
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            onClick={() => dispatch({ type: 'RETURN' })}
            className="absolute top-6 right-6 font-mono uppercase tracking-[0.2em] text-[10px] px-4 py-2 border border-white/15 hover:border-white/40 transition-colors"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            ← overview
          </motion.button>
        )}
      </AnimatePresence>

      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 w-[min(560px,82vw)]">
        <div className="flex justify-between mb-2">{EPOCHS.map((y) => <span key={y} className={lbl}>{y}</span>)}</div>
        <input type="range" min={0} max={EPOCHS.length - 1} step={0.005} value={engine.timeline}
          onChange={(e) => dispatch({ type: 'SCRUB', value: parseFloat(e.target.value) })} className="w-full" style={{ accentColor: ACCENT }} />
        <div className={lbl + ' text-center mt-2'}>timeline · {epochLabel} — the grid bends toward active projects</div>
      </div>

      <AnimatePresence>
        {engine.state === 'focused' && p && (
          <motion.aside
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="absolute top-1/2 -translate-y-1/2 right-6 w-[330px] max-h-[80vh] overflow-y-auto p-5 backdrop-blur-md"
            style={{ background: 'rgba(8,12,20,0.78)', border: '1px solid rgba(127,223,255,0.18)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={lbl}>{p.category}</span>
              {p.status && <span className="font-mono text-[8px] uppercase tracking-wider px-1.5 py-0.5 border" style={{ color: ACCENT, borderColor: 'rgba(127,223,255,0.3)' }}>{p.status}</span>}
            </div>
            <div className="font-mono text-base tracking-[0.12em] mb-0.5">{p.title}</div>
            <div className="text-[11px] text-white/45 mb-3">{p.subtitle}</div>
            <p className="text-[11px] leading-relaxed text-white/65 mb-3">{p.description}</p>
            <div className="border-l-2 pl-3 mb-4 text-[11px] leading-relaxed text-white/75" style={{ borderColor: ACCENT }}>{p.impact}</div>

            <div className={lbl + ' mb-2'}>live signal</div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-mono text-[9px] uppercase tracking-wider text-white/40">throughput</span>
              <span className="font-mono text-[12px]" style={{ color: ACCENT }}>{signal}/s</span>
            </div>
            <div className="h-[2px] w-full bg-white/10 mb-4"><div className="h-full transition-all duration-300" style={{ width: `${signal}%`, background: ACCENT }} /></div>

            <div className={lbl + ' mb-2'}>stack</div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {p.stack.slice(0, 8).map((t) => (
                <span key={t} className="font-mono text-[9px] uppercase tracking-wider px-2 py-1 border border-white/10 text-white/60">{t}</span>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {p.demo && <a href={p.demo} target="_blank" className="font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 border" style={{ color: ACCENT, borderColor: 'rgba(127,223,255,0.3)' }}>Live →</a>}
              <a href={p.github} target="_blank" className="font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 border border-white/15 text-white/60">GitHub →</a>
              <a href={`/projects/${p.id}`} className="font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 border border-white/15 text-white/60">Case Study →</a>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}
