import { RESUME } from './Nav'
import SocMap from './SocMap'

export const EMAIL = 'kamarajosephallan@gmail.com'
export const LINKEDIN = 'https://linkedin.com/in/joseph-allan-kamara'
export const GITHUB = 'https://github.com/kamara1994'

const MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent('Opportunity for Joseph Kamara')}`

const LINKS: { label: string; short: string; href: string; ext?: boolean; icon: string }[] = [
  {
    label: 'Email me', short: 'Email',
    href: MAILTO,
    icon: '✉️',
  },
  {
    label: 'Connect on LinkedIn', short: 'LinkedIn',
    href: LINKEDIN,
    ext: true,
    icon: '💼',
  },
  {
    label: 'See my code', short: 'GitHub',
    href: GITHUB,
    ext: true,
    icon: '👨‍💻',
  },
  {
    label: 'Get my résumé', short: 'Résumé',
    href: RESUME,
    ext: true,
    icon: '📄',
  },
]

/** Compact closing footer: glowing rule, small "Let's connect", contact chips, copyright. */
export default function Footer() {
  return (
    <footer id="contact" className="footer-glow relative overflow-hidden">
      <SocMap />
      <div aria-hidden className="footer-portrait" />
      <div className="wrap relative z-[2] flex flex-col gap-7 py-12 md:flex-row md:items-center md:justify-between md:py-16 lg:py-20">
        <div>
          <p className="font-display text-[clamp(30px,3vw,40px)] font-bold uppercase leading-none">
            Let&apos;s <span className="title-accent">connect</span>
          </p>
          <p className="mt-3 flex items-center gap-2.5 text-[15px] text-smoke">
            <span aria-hidden className="status-dot" />
            Open to full-time roles. Graduating December 2026. Based in Philadelphia.
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
          {LINKS.map((l) => (
            <li key={l.label}>
              <a href={l.href} {...(l.ext ? { target: '_blank', rel: 'noopener' } : {})} className="foot-chip">
                <span aria-hidden className="emoji">{l.icon}</span>
                <span className="sm:hidden">{l.short}</span>
                <span className="hidden sm:inline">{l.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-[2] border-t border-line">
        <div className="wrap flex flex-col gap-2 pb-28 pt-5 text-[13px] text-smoke/80 sm:flex-row sm:justify-between lg:pb-5">
          <p>© {new Date().getFullYear()} Joseph Allan Kamara · <a href="/privacy" className="underline-offset-4 hover:text-snow hover:underline">Privacy</a></p>
          <p>{EMAIL}</p>
        </div>
      </div>
    </footer>
  )
}
