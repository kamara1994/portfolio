'use client'
import { useState } from 'react'
import { ROLES, RoleIcon, chooseRole } from './roles'

/**
 * "See my work": one click goes straight to the projects. With a mouse, hovering also
 * reveals reader choices on a glowing branch underneath (Recruiter / SOC Analyst /
 * Security Engineer). Touch devices skip the menu so the tap is never slowed down.
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
        className={`absolute left-0 top-full z-20 pt-1 transition-all duration-300 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 ${
          open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'
        }`}
      >
        <div className="branch">
          <p id="see-work-hint" className="branch-hint">Or view it as a</p>
          <ul>
            {ROLES.map((r) => (
              <li key={r.id}>
                <button type="button" onClick={() => { setOpen(false); chooseRole(r.id) }} className="branch-item">
                  <RoleIcon role={r.id} className="h-[17px] w-[17px] shrink-0" />
                  <span>{r.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
