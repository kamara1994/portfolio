import { RESUME } from './Nav'

export const EMAIL = 'kamarajosephallan@gmail.com'
export const LINKEDIN = 'https://linkedin.com/in/joseph-allan-kamara'
export const GITHUB = 'https://github.com/kamara1994'

const MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent('Opportunity for Joseph Kamara')}`

const LINKS: { label: string; href: string; ext?: boolean; icon: React.ReactNode }[] = [
  {
    label: 'Email me',
    href: MAILTO,
    icon: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
  },
  {
    label: 'Connect on LinkedIn',
    href: LINKEDIN,
    ext: true,
    icon: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 014 0v4M12 10v7" /></>,
  },
  {
    label: 'See my code',
    href: GITHUB,
    ext: true,
    icon: <path d="M9 19c-4 1.3-4-2-6-2.5M15 21v-3.5a3 3 0 00-.8-2.3c2.7-.3 5.5-1.3 5.5-6a4.7 4.7 0 00-1.3-3.2 4.3 4.3 0 00-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 00-6 0C6.5 2.5 5.5 2.8 5.5 2.8a4.3 4.3 0 00-.1 3.2A4.7 4.7 0 004 9.2c0 4.6 2.8 5.7 5.5 6a3 3 0 00-.8 2.3V21" />,
  },
  {
    label: 'Get my résumé',
    href: RESUME,
    ext: true,
    icon: <><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></>,
  },
]

/** Compact closing footer: glowing rule, small "Let's connect", contact chips, copyright. */
export default function Footer() {
  return (
    <footer id="contact" className="footer-glow relative overflow-hidden">
      <div aria-hidden className="footer-portrait" />
      <div className="wrap relative flex flex-col gap-8 py-12 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-[clamp(30px,3vw,40px)] font-bold uppercase leading-none">
            Let&apos;s <span className="title-accent">connect</span>
          </p>
          <p className="mt-3 flex items-center gap-2.5 text-[15px] text-smoke">
            <span aria-hidden className="status-dot" />
            Open to full-time roles. Graduating December 2026. Based in Philadelphia.
          </p>
        </div>

        <ul className="flex flex-wrap gap-3">
          {LINKS.map((l) => (
            <li key={l.label}>
              <a href={l.href} {...(l.ext ? { target: '_blank', rel: 'noopener' } : {})} className="foot-chip">
                <svg aria-hidden viewBox="0 0 24 24" className="icon-live h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {l.icon}
                </svg>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative border-t border-line">
        <div className="wrap flex flex-col gap-2 pb-24 pt-5 text-[13px] text-smoke/80 sm:flex-row sm:justify-between md:pb-5">
          <p>© {new Date().getFullYear()} Joseph Allan Kamara · <a href="/privacy" className="underline-offset-4 hover:text-snow hover:underline">Privacy</a></p>
          <p>{EMAIL}</p>
        </div>
      </div>
    </footer>
  )
}
