'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const links = ['projects', 'skills', 'certs', 'experience', 'about', 'contact']

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'nav-blur border-b border-[rgba(0,212,255,0.08)]' : ''}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* LOGO */}
        <a href="#" className="font-mono text-[13px] tracking-[3px] text-neon flex items-center gap-2">
          <span className="text-[10px] text-muted">▮</span>
          JAK<span className="text-muted">://SOC</span>
        </a>

        {/* LINKS */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map(link => (
            <li key={link}>
              <a
                href={`#${link}`}
                className="font-mono text-[11px] tracking-[2px] uppercase text-muted hover:text-cyan transition-colors duration-200"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a
          href="mailto:kamarajosephallan@gmail.com"
          className="hidden md:block btn-hex bg-cyan text-bg font-mono text-[11px] tracking-[2px] uppercase px-5 py-2 hover:bg-neon transition-colors"
        >
          Hire Me
        </a>
      </div>
    </nav>
  )
}
