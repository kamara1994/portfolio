'use client'
import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot  = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    // Use raw coordinates — NOT affected by scroll
    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let ringX  = mouseX
    let ringY  = mouseY
    let rafId  = 0

    const moveCursor = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const animate = () => {
      // Dot follows instantly
      dot.style.left  = `${mouseX}px`
      dot.style.top   = `${mouseY}px`

      // Ring follows with smooth lag
      ringX += (mouseX - ringX) * 0.12
      ringY += (mouseY - ringY) * 0.12
      ring.style.left = `${ringX}px`
      ring.style.top  = `${ringY}px`

      rafId = requestAnimationFrame(animate)
    }

    const handleHoverEnter = () => ring.classList.add('hovering')
    const handleHoverLeave = () => ring.classList.remove('hovering')

    // Add hover effect to interactive elements
    const addHoverListeners = () => {
      const els = document.querySelectorAll('a, button, [role="button"], input, textarea')
      els.forEach(el => {
        el.addEventListener('mouseenter', handleHoverEnter)
        el.addEventListener('mouseleave', handleHoverLeave)
      })
    }

    window.addEventListener('mousemove', moveCursor, { passive: true })
    rafId = requestAnimationFrame(animate)
    addHoverListeners()

    // Re-add listeners when DOM changes (new elements)
    const observer = new MutationObserver(addHoverListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      <div ref={dotRef}  className="cursor-dot"  />
      <div ref={ringRef} className="cursor-ring" />
    </>
  )
}
