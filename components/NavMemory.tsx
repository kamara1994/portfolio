'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/** Remembers that the visitor moved between pages inside this site, so Back buttons can return them to where they were. */
export default function NavMemory() {
  const path = usePathname()
  useEffect(() => {
    try {
      const last = sessionStorage.getItem('nav-current')
      if (last && last !== path) sessionStorage.setItem('nav-previous', last)
      sessionStorage.setItem('nav-current', path)
    } catch {}
  }, [path])
  return null
}
