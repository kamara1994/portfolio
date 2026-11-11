'use client'

import { useEffect, useRef, useState } from 'react'
import { BLUR } from '@/lib/blur'

/**
 * Slow-network fallback: a tiny pre-blurred copy sits underneath and shows while
 * the sharp image is still downloading. The real image is never hidden or
 * delayed; once it loads, the preview fades away (so transparent images leave
 * no blurred halo behind).
 */
export default function BlurImage(props: React.ImgHTMLAttributes<HTMLImageElement> & { src: string }) {
  const { src, alt = '', className = '', ...rest } = props
  const [loaded, setLoaded] = useState(false)
  const ref = useRef<HTMLImageElement>(null)
  const blur = BLUR[src]

  // Covers the case where the image finished loading before React attached
  useEffect(() => { if (ref.current?.complete && ref.current.naturalWidth) setLoaded(true) }, [])

  return (
    <span className="blur-wrap">
      {blur && (
        // eslint-disable-next-line @next/next/no-img-element
        <img aria-hidden alt="" src={blur} className={`blur-ph ${loaded ? 'is-gone' : ''}`} />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={ref} src={src} alt={alt} onLoad={() => setLoaded(true)} className={`blur-real ${className}`} {...rest} />
    </span>
  )
}
