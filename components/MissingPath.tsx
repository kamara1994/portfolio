'use client'

import { usePathname } from 'next/navigation'

/** Shows the address the visitor asked for on the 404 page. */
export default function MissingPath() {
  const path = usePathname()
  return <span className="break-all text-snow">{path}</span>
}
