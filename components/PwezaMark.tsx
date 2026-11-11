import { useId } from 'react'

/**
 * PWEZA assistant mark: a hex "core" with an AI spark inside and a slow orbit
 * ring. Pure SVG + CSS, so it stays sharp and costs nothing to load.
 */
export default function PwezaMark({ size = 28, className = '' }: { size?: number; className?: string }) {
  const uid = useId().replace(/:/g, '')
  const edge = `pzm-edge-${uid}`
  const core = `pzm-core-${uid}`
  return (
    <svg aria-hidden viewBox="0 0 40 40" width={size} height={size} className={`pz-mark ${className}`} fill="none">
      <defs>
        <linearGradient id={edge} x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8AE4FF" />
          <stop offset=".55" stopColor="#4C8DFF" />
          <stop offset="1" stopColor="#A78BFA" />
        </linearGradient>
        <radialGradient id={core} cx="20" cy="20" r="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4CC9FF" stopOpacity=".35" />
          <stop offset="1" stopColor="#4CC9FF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="pz-mark-orbit">
        <ellipse cx="20" cy="20" rx="18" ry="7.5" stroke={`url(#${edge})`} strokeWidth="1" strokeDasharray="2 3.5" opacity=".7" />
        <circle cx="38" cy="20" r="1.6" fill="#8AE4FF" />
      </g>
      <path d="M20 5.5l12.5 7.2v14.6L20 34.5 7.5 27.3V12.7z" fill={`url(#${core})`} stroke={`url(#${edge})`} strokeWidth="1.6" strokeLinejoin="round" />
      <path className="pz-mark-spark" d="M20 12.5c.7 4.1 3.4 6.8 7.5 7.5-4.1.7-6.8 3.4-7.5 7.5-.7-4.1-3.4-6.8-7.5-7.5 4.1-.7 6.8-3.4 7.5-7.5z" fill="#EAF8FF" />
    </svg>
  )
}
