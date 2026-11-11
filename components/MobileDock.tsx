'use client'

import { useEffect, useState } from 'react'
import PwezaMark from './PwezaMark'
import { RESUME } from './Nav'

const ITEMS = [
  { label: 'Work', href: '/#work', icon: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 13h18" /></> },
  { label: 'Skills', href: '/#skills', icon: <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z" /> },
  null,
  { label: 'Résumé', href: RESUME, ext: true, icon: <><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></> },
  { label: 'Contact', href: '/#contact', icon: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></> },
] as const

/** App-style bottom dock for phones: four shortcuts and a raised AI button. */
export default function MobileDock() {
  const [active, setActive] = useState('')
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const ids = ['work', 'skills', 'contact']
    const onScroll = () => {
      setShown(window.scrollY > 200)
      let cur = ''
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.5) cur = id
      }
      setActive(cur)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav aria-label="Quick links" className={`dock lg:hidden ${shown ? 'is-on' : ''}`}>
      {ITEMS.map((it) =>
        it === null ? (
          <button
            key="ai"
            type="button"
            className="dock-ai"
            aria-label="Ask my AI assistant"
            onClick={() => window.dispatchEvent(new Event('pweza:toggle'))}
          >
            <PwezaMark size={30} />
          </button>
        ) : (
          <a
            key={it.label}
            href={it.href}
            {...('ext' in it ? { target: '_blank', rel: 'noopener' } : {})}
            className={`dock-item ${active && it.href === `/#${active}` ? 'is-active' : ''}`}
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-[21px] w-[21px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              {it.icon}
            </svg>
            <span>{it.label}</span>
          </a>
        ),
      )}
    </nav>
  )
}
