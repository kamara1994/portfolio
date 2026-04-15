export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-[rgba(0,212,255,0.08)] px-6 py-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="font-mono text-[11px] text-muted tracking-[2px] uppercase">
          Joseph Allan Kamara <span className="text-[rgba(0,212,255,0.3)]">//</span> Cybersecurity Engineer
        </div>
        <div className="flex items-center gap-6">
          {[
            { label: 'LinkedIn', href: 'https://linkedin.com/in/joseph-allan-kamara' },
            { label: 'GitHub', href: 'https://github.com/joseph-allan-kamara' },
            { label: 'Email', href: 'mailto:kamarajosephallan@gmail.com' },
          ].map(l => (
            <a key={l.label} href={l.href} target="_blank"
              className="font-mono text-[10px] tracking-[2px] uppercase text-muted hover:text-cyan transition-colors">
              {l.label}
            </a>
          ))}
        </div>
        <div className="font-mono text-[10px] text-[rgba(136,153,187,0.4)]">
          © 2026 — Built with intent.
        </div>
      </div>
    </footer>
  )
}
