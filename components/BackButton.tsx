'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

/** Goes back to where the visitor came from on this site (keeping their scroll spot); otherwise to `href`. */
function useSmartBack(href: string) {
  const router = useRouter()
  return (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    let cameFromSite = false
    try {
      const prev = sessionStorage.getItem('nav-previous')
      cameFromSite = !!prev && prev !== location.pathname
      if (!cameFromSite && document.referrer) cameFromSite = new URL(document.referrer).origin === location.origin
    } catch {}
    if (cameFromSite && window.history.length > 1) { e.preventDefault(); router.back() }
  }
}

const Arrow = () => (
  <svg aria-hidden viewBox="0 0 20 20" width="16" height="16" fill="none"><path d="M12.5 4.5 7 10l5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

/** Clear back button at the top of the page. */
export function BackButton({ href, label }: { href: string; label: string }) {
  const onClick = useSmartBack(href)
  return <Link href={href} onClick={onClick} className="back-btn"><Arrow />{label}</Link>
}

/** Floating back button that appears once the visitor scrolls down. */
export function FloatingBack({ href, label }: { href: string; label: string }) {
  const onClick = useSmartBack(href)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 380)
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <Link href={href} onClick={onClick} aria-label={label} tabIndex={show ? 0 : -1} className={`back-float ${show ? 'is-shown' : ''}`}>
      <Arrow /><span>Back</span>
    </Link>
  )
}
