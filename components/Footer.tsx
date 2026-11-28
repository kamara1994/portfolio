import { RESUME } from './Nav'
import SocMap from './SocMap'

export const EMAIL = 'kamarajosephallan@gmail.com'
export const LINKEDIN = 'https://linkedin.com/in/joseph-allan-kamara'
export const GITHUB = 'https://github.com/kamara1994'

const MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent('Opportunity for Joseph Kamara')}`

const LINKS: { label: string; short: string; href: string; ext?: boolean; icon: React.ReactNode }[] = [
  {
    label: 'Email me', short: 'Email',
    href: MAILTO,
    icon: (
      <svg aria-hidden viewBox="0 0 24 24" className="foot-svg h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
      </svg>
    ),
  },
  {
    label: 'Connect on LinkedIn', short: 'LinkedIn',
    href: LINKEDIN,
    ext: true,
    icon: (
      <svg aria-hidden viewBox="0 0 24 24" className="foot-svg h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3.5" /><path d="M8 10.5V16M8 7.8v.01M11.5 16v-5.5M11.5 13c0-1.5 1-2.5 2.3-2.5S16 11.5 16 13v3" />
      </svg>
    ),
  },
  {
    label: 'See my code', short: 'GitHub',
    href: GITHUB,
    ext: true,
    icon: (
      <svg aria-hidden viewBox="0 0 24 24" className="foot-svg h-[18px] w-[18px]" fill="currentColor">
        <path d="M12 .5a11.5 11.5 0 00-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 015.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0012 .5z" />
      </svg>
    ),
  },
  {
    label: 'Get my résumé', short: 'Résumé',
    href: RESUME,
    ext: true,
    icon: (
      <svg aria-hidden viewBox="0 0 24 24" className="foot-svg h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" />
      </svg>
    ),
  },
]

/** Compact closing footer: glowing rule, small "Let's connect", contact chips, copyright. */
export default function Footer() {
  return (
    <footer id="contact" className="footer-glow relative overflow-hidden">
      <SocMap />
      <div aria-hidden className="footer-portrait" />
      <div className="foot-main wrap relative z-[2] flex flex-col gap-7 py-12 md:flex-row md:items-center md:justify-between md:py-16 lg:py-20">
        <div>
          <p className="foot-head font-display text-[clamp(30px,3vw,40px)] font-bold uppercase leading-none">
            Let&apos;s <span className="title-accent">connect</span>
          </p>
          <p className="foot-status mt-3 flex items-center gap-2.5 text-[15px] text-smoke">
            <span aria-hidden className="status-dot" />
            Open to full-time roles. Graduating December 2026. Based in Rexburg, Idaho · open to relocation.
          </p>
        </div>

        <div className="foot-ring">
        <p className="foot-ring-center" aria-hidden="true"><b>Let&apos;s<br /><span className="title-accent">connect</span></b></p>
        <ul className="foot-links grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
          {LINKS.map((l) => (
            <li key={l.label}>
              <a href={l.href} {...(l.ext ? { target: '_blank', rel: 'noopener' } : {})} className="foot-chip" aria-label={l.label}>
                <span className="foot-ico">{typeof l.icon === 'string' ? <span aria-hidden className="emoji">{l.icon}</span> : l.icon}</span>
                <span className="foot-short sm:hidden">{l.short}</span>
                <span className="hidden sm:inline">{l.label}</span>
              </a>
            </li>
          ))}
        </ul>
        </div>
      </div>

      <div className="relative z-[2] border-t border-line">
        <div className="foot-bottom wrap flex flex-col gap-2 pb-28 pt-5 text-[13px] text-smoke/80 sm:flex-row sm:justify-between lg:pb-5">
          <p>© {new Date().getFullYear()} Joseph Allan Kamara · <a href="/privacy" className="underline-offset-4 hover:text-snow hover:underline">Privacy</a></p>
          <p>{EMAIL}</p>
        </div>
      </div>
    </footer>
  )
}
