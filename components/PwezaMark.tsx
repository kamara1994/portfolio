/**
 * PWEZA assistant mark: a dark core inside a rotating color ring, with a
 * twinkling AI spark. CSS + a tiny SVG, so it is sharp at any size.
 */
export default function PwezaMark({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <span aria-hidden className={`pz-core ${className}`} style={{ width: size, height: size }}>
      <span className="pz-core-ring" />
      <span className="pz-core-ball" />
      <svg viewBox="0 0 24 24" className="pz-core-spark">
        <path d="M12 4.2c.5 3.9 3.2 6.6 7.1 7.1-3.9.5-6.6 3.2-7.1 7.1-.5-3.9-3.2-6.6-7.1-7.1 3.9-.5 6.6-3.2 7.1-7.1z" fill="#F2FBFF" />
        <path className="pz-core-mini" d="M18 3.6c.2 1.1.9 1.8 2 2-1.1.2-1.8.9-2 2-.2-1.1-.9-1.8-2-2 1.1-.2 1.8-.9 2-2z" fill="#9FE6FF" />
      </svg>
    </span>
  )
}
