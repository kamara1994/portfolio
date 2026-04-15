export default function GlowOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Top left blue orb */}
      <div
        className="absolute rounded-full opacity-20"
        style={{
          width: 700, height: 700,
          background: 'radial-gradient(circle, #1e3a8a, transparent 70%)',
          top: -250, left: -250,
          filter: 'blur(80px)',
        }}
      />
      {/* Bottom right teal orb */}
      <div
        className="absolute rounded-full opacity-15"
        style={{
          width: 600, height: 600,
          background: 'radial-gradient(circle, #0e7490, transparent 70%)',
          bottom: -150, right: -150,
          filter: 'blur(100px)',
        }}
      />
      {/* Center purple orb */}
      <div
        className="absolute rounded-full opacity-10"
        style={{
          width: 400, height: 400,
          background: 'radial-gradient(circle, #4f46e5, transparent 70%)',
          top: '40%', left: '45%',
          filter: 'blur(90px)',
        }}
      />
      {/* Scan line */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)',
          animation: 'scan 10s linear infinite',
          top: 0,
        }}
      />
    </div>
  )
}
