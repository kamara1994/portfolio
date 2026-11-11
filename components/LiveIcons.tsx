'use client'
import { useEffect } from 'react'

const SHAPES = 'path, circle, rect, line, polyline, polygon, ellipse'

/**
 * Prepares every <svg class="icon-live"> so its strokes can be "drawn" with CSS:
 * each shape gets pathLength="1", then the svg is marked ready. Watches for icons
 * that mount later (tab switches, menus).
 */
export default function LiveIcons() {
  useEffect(() => {
    const prep = (root: ParentNode) => {
      root.querySelectorAll<SVGSVGElement>('svg.icon-live:not(.icon-ready)').forEach((svg) => {
        svg.querySelectorAll(SHAPES).forEach((s) => s.setAttribute('pathLength', '1'))
        svg.classList.add('icon-ready')
      })
    }
    prep(document)
    const mo = new MutationObserver((muts) => {
      for (const m of muts) m.addedNodes.forEach((n) => { if (n instanceof Element) prep(n.parentNode ?? n) })
    })
    mo.observe(document.body, { childList: true, subtree: true })
    return () => mo.disconnect()
  }, [])
  return null
}
