'use client'
import { useState } from 'react'
import { ROLES, RoleIcon, chooseRole } from './roles'

/**
 * "See my work": one click goes straight to the projects. With a mouse, hovering also
 * reveals reader choices underneath (Recruiter / SOC Analyst / Security Engineer).
 * Touch devices skip the menu entirely so the tap is never slowed down.
 */
export default function SeeMyWork() {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="group relative"
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') setOpen(true) }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') setOpen(false) }}
      onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}
    >
      <a href="#work" className="btn-primary" aria-describedby="see-work-hint">
        See my work
      </a>

      <div
        className={`absolute left-0 top-full z-20 pt-3 transition-all duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 ${
          open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'
        }`}
      >
        <div className="plain-menu min-w-[230px] py-2">
          <p id="see-work-hint" className="px-4 pb-1 pt-1 text-[13px] text-smoke">Or view it as a</p>
          <ul>
            {ROLES.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => { setOpen(false); chooseRole(r.id) }}
                  className="plain-item flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] font-medium text-snow/85"
                >
                  <span className="text-signal"><RoleIcon role={r.id} className="h-[18px] w-[18px]" /></span>
                  {r.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
