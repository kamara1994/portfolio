'use client'
import './globals.css'
import { useEffect, useRef } from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let mouseX = 0, mouseY = 0
    let ringX = 0, ringY = 0

    const moveCursor = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      dot.style.left = mouseX + 'px'
      dot.style.top = mouseY + 'px'
    }

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.12
      ringY += (mouseY - ringY) * 0.12
      ring.style.left = ringX + 'px'
      ring.style.top = ringY + 'px'
      requestAnimationFrame(animateRing)
    }

    const addHover = () => ring.classList.add('hovering')
    const removeHover = () => ring.classList.remove('hovering')

    window.addEventListener('mousemove', moveCursor)
    document.querySelectorAll('a, button, .tilt-card').forEach(el => {
      el.addEventListener('mouseenter', addHover)
      el.addEventListener('mouseleave', removeHover)
    })
    animateRing()

    return () => window.removeEventListener('mousemove', moveCursor)
  }, [])

  return (
    <html lang="en">
      <head>
        <title>Joseph Allan Kamara | Cybersecurity Engineer</title>
        <meta name="description" content="Cybersecurity Engineer & AI Security Builder — SOC Analyst, Security Engineer, AI Security Engineer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="grid-bg noise">
        <div ref={dotRef} className="cursor-dot" />
        <div ref={ringRef} className="cursor-ring" />
        {children}
      </body>
    </html>
  )
}
