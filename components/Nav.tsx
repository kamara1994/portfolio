'use client'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import FlipStatus from './FlipStatus'
import { ROLES, RoleIcon } from './roles'

const LINKS = [
  { href: '/#work', label: 'Work' },
  { href: '/#skills', label: 'Skills' },
  { href: '/#credentials', label: 'Credentials' },
  { href: '/#experience', label: 'Experience' },
  { href: '/#story', label: 'About' },
  { href: '/#contact', label: 'Contact' },
]

export const RESUME = '/resume/Joseph_Allan_Kamara_Resume_v3.pdf'

export default function Nav() {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('')
  const [hover, setHover] = useState<string | null>(null)
  const pill = useRef<HTMLUListElement>(null)

  // Glass light follows the mouse: snaps to the hovered link, otherwise rests on the section in view.
  useLayoutEffect(() => {
    const box = pill.current
    if (!box) return
    const target = hover ?? current
    const el = target ? box.querySelector<HTMLElement>(`[data-id="${target}"]`) : null
    if (!el) { box.style.setProperty('--ind-o', '0'); return }
    box.style.setProperty('--ind-x', `${el.offsetLeft}px`)
    box.style.setProperty('--ind-w', `${el.offsetWidth}px`)
    box.style.setProperty('--ind-o', '1')
  }, [hover, current])

  useEffect(() => {
    const ids = ['work', 'skills', 'credentials', 'experience', 'story', 'contact']
    const onScroll = () => {
      setSolid(window.scrollY > 24)
      // Highlight the section in view
      const line = window.innerHeight * 0.35
      let cur = ''
      for (const id of ids) {
        const r = document.getElementById(id)?.getBoundingClientRect()
        if (r && r.top <= line && r.bottom > line) cur = id
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = 'contact'
      setCurrent(cur)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid || open ? 'bg-ink/95 backdrop-blur border-b border-line' : 'bg-transparent'
      } ${open ? 'h-[100dvh] overflow-y-auto lg:h-auto' : ''
      }`}
    >
      <span aria-hidden className="scroll-progress" />
      <nav className="wrap flex h-[72px] items-center justify-between" aria-label="Main">
        <FlipStatus />

        <div className="hidden items-center gap-5 lg:flex">
          <ul
            ref={pill}
            className="nav-glass"
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect()
              e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
            }}
            onPointerLeave={() => setHover(null)}
          >
            <span aria-hidden="true" className="nav-glass-light" />
            {LINKS.map((l) => {
              const id = l.href.slice(2)
              return (
                <li key={l.href}>
                  <a
                    href={l.href}
                    data-id={id}
                    onPointerEnter={() => setHover(id)}
                    onFocus={() => setHover(id)}
                    onBlur={() => setHover(null)}
                    aria-current={current === id ? 'true' : undefined}
                    className={`nav-glass-link ${current === id ? 'is-current' : ''} ${(hover ?? current) === id ? 'is-lit' : ''}`}
                  >
                    {l.label}
                  </a>
                </li>
              )
            })}
          </ul>
          <a href={RESUME} target="_blank" rel="noopener" className="btn-ghost h-10 px-5 text-[14px]">
            Résumé
          </a>
        </div>

        <button
          className="lg:hidden -mr-2 flex h-11 w-11 flex-col items-center justify-center"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="block h-[2px] w-6 bg-snow transition-transform" style={{ transform: open ? 'translateY(4px) rotate(45deg)' : 'none' }} />
          <span className="mt-[6px] block h-[2px] w-6 bg-snow transition-transform" style={{ transform: open ? 'translateY(-4px) rotate(-45deg)' : 'none' }} />
        </button>
      </nav>

      {open && (
        <ul id="mobile-menu" className="wrap m-glass-menu flex flex-col gap-1 pb-8 lg:hidden">
          <li>
            <a href="/#work" onClick={() => setOpen(false)} className={`m-glass-link block py-3 font-display text-3xl font-semibold uppercase tracking-wide ${current === 'work' ? 'is-lit' : ''}`}>
              Work
            </a>
            <ul className="mb-2 grid gap-1 pl-1">
              {ROLES.map((r) => (
                <li key={r.id}>
                  <a href={`/?role=${r.id}#work`} onClick={() => setOpen(false)} className="flex items-center gap-3 py-2 text-[16px] text-snow/85">
                    <span className="text-signal"><RoleIcon role={r.id} className="h-4 w-4" /></span>
                    For a {r.label}
                  </a>
                </li>
              ))}
            </ul>
          </li>
          {LINKS.filter((l) => l.label !== 'Work').map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)} className={`m-glass-link block py-3 font-display text-3xl font-semibold uppercase tracking-wide ${current === l.href.slice(2) ? 'is-lit' : ''}`}>
                {l.label}
              </a>
            </li>
          ))}
          <li className="pt-4">
            <a href={RESUME} target="_blank" rel="noopener" className="btn-primary w-full">Download résumé</a>
          </li>
        </ul>
      )}
    </header>
  )
}
