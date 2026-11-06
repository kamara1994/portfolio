'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ROLES, RoleIcon, chooseRole, type Role } from './roles'

/** "Work" in the top menu: hover (or click/tap) opens a reader picker, Starlink-style. */
export default function WorkMenu() {
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLLIElement>(null)
  const pointer = useRef('')
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !box.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  const pick = (role: Role) => {
    setOpen(false)
    if (pathname === '/') chooseRole(role)
    else router.push(`/?role=${role}#work`)
  }

  return (
    <li
      ref={box}
      className="relative"
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') setOpen(true) }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') setOpen(false) }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onPointerDown={(e) => { pointer.current = e.pointerType }}
        onClick={() => {
          // hover already opened it for mouse users; taps and keyboard toggle
          if (pointer.current === 'mouse') setOpen(true)
          else setOpen((o) => !o)
          pointer.current = ''
        }}
        className="nav-link flex items-center gap-1.5 text-[15px] font-medium text-snow/80 transition-colors hover:text-snow"
      >
        Work
        <svg aria-hidden viewBox="0 0 12 12" className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 4.5l3 3 3-3" />
        </svg>
      </button>

      {/* pt-4 bridges the gap so the menu doesn't close on the way down */}
      <div className={`absolute left-1/2 top-full -translate-x-1/2 pt-4 transition-all duration-200 ${open ? 'visible opacity-100 translate-y-0' : 'invisible opacity-0 -translate-y-1'}`}>
        <div className="role-menu w-[300px] p-2">
          <p className="px-3 pb-2 pt-2 text-[13px] text-smoke">Show my work for a</p>
          <ul>
            {ROLES.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => pick(r.id)}
                  className="role-item flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-raised text-signal">
                    <RoleIcon role={r.id} />
                  </span>
                  <span>
                    <span className="block text-[15px] font-semibold text-snow">{r.label}</span>
                    <span className="block text-[13px] text-smoke">{r.blurb}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  )
}
