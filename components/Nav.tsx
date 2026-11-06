'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import TypeStatus from './TypeStatus'

const LINKS = [
  { href: '/#work', label: 'Work' },
  { href: '/#credentials', label: 'Credentials' },
  { href: '/#experience', label: 'Experience' },
  { href: '/#contact', label: 'Contact' },
]

export const RESUME = '/resume/Joseph_Allan_Kamara_Resume_v3.pdf'

export default function Nav() {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid || open ? 'bg-ink/95 backdrop-blur border-b border-line' : 'bg-transparent'
      }`}
    >
      <nav className="wrap flex h-[72px] items-center justify-between" aria-label="Main">
        <Link href="/#contact" aria-label="Open to work. Contact Joseph" className="flex items-center gap-3 text-[15px] font-medium text-snow/85 hover:text-snow">
          <span aria-hidden className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-signal/60 motion-safe:animate-ping" />
            <span className="relative h-2 w-2 rounded-full bg-signal" />
          </span>
          <TypeStatus />
        </Link>

        <ul className="hidden items-center gap-9 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-[15px] font-medium text-snow/80 transition-colors hover:text-snow">
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a href={RESUME} target="_blank" rel="noopener" className="btn-ghost h-10 px-5 text-[14px]">
              Résumé
            </a>
          </li>
        </ul>

        <button
          className="md:hidden -mr-2 p-2"
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
        <ul id="mobile-menu" className="wrap flex flex-col gap-1 pb-8 md:hidden">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)} className="block py-3 font-display text-3xl font-semibold uppercase tracking-wide">
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
