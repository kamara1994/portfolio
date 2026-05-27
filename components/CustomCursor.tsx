'use client'
import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Disable entirely on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return

    const dot  = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let mouseX = -100, mouseY = -100
    let ringX  = -100, ringY  = -100
    let rafId  = 0
    let isOnScreen = false

    const moveCursor = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      isOnScreen = true
      dot.style.opacity  = '1'
      ring.style.opacity = '1'
    }

    const hideCursor = () => {
      isOnScreen = false
      dot.style.opacity  = '0'
      ring.style.opacity = '0'
    }

    const animate = () => {
      dot.style.left  = `${mouseX}px`
      dot.style.top   = `${mouseY}px`
      ringX += (mouseX - ringX) * 0.12
      ringY += (mouseY - ringY) * 0.12
      ring.style.left = `${ringX}px`
      ring.style.top  = `${ringY}px`
      rafId = requestAnimationFrame(animate)
    }

    const handleEnter = () => ring.classList.add('hovering')
    const handleLeave = () => ring.classList.remove('hovering')

    const addListeners = () => {
      document.querySelectorAll('a, button, [role="button"], input, textarea').forEach(el => {
        el.addEventListener('mouseenter', handleEnter)
        el.addEventListener('mouseleave', handleLeave)
      })
    }

    window.addEventListener('mousemove', moveCursor, { passive: true })
    window.addEventListener('mouseleave', hideCursor)
    rafId = requestAnimationFrame(animate)
    addListeners()

    const observer = new MutationObserver(addListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mouseleave', hideCursor)
      cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      <div ref={dotRef}  className="cursor-dot"  style={{ opacity: 0 }} />
      <div ref={ringRef} className="cursor-ring" style={{ opacity: 0 }} />
    </>
  )
}
