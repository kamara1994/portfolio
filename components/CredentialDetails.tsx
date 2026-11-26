'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type Detail = {
  id: string
  name: string
  issuer: string
  image?: string
  issued?: string
  earned: boolean
  directUrl?: string
  lookupUrl?: string
  requestUrl?: string
  skills: string[]
  projects: { id: string; title: string }[]
  stackable?: boolean
}

export default function CredentialDetails({ item }: { item: Detail }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const [feedback, setFeedback] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  function open() {
    setFeedback('')
    const url = new URL(window.location.pathname, window.location.origin)
    url.hash = item.id
    setShareUrl(url.href)
    dialog.current?.showModal()
  }
  useEffect(() => {
    const el = dialog.current
    if (!el) return
    function restore() { trigger.current?.focus({ preventScroll: true }) }
    el.addEventListener('close', restore)
    return () => el.removeEventListener('close', restore)
  }, [])
  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: item.name, url: shareUrl })
        setFeedback('Shared')
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl)
        setFeedback('Link copied')
      } else {
        setFeedback('Copy the link below.')
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) setFeedback('Copy the link below.')
    }
  }
  return <>
    <button ref={trigger} type="button" className="cred-detail-trigger" onClick={open} aria-haspopup="dialog" aria-label={'View credential details for ' + item.name} title="View credential details">{item.name}</button>
    <dialog ref={dialog} className="cred-detail-dialog" aria-labelledby={item.id + '-title'} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close() }}>
      <div className="cred-detail-inner">
        <header className="cred-detail-top">
          <span>Credential details</span>
          <button type="button" onClick={() => dialog.current?.close()} aria-label="Close credential viewer" className="cred-detail-close">×</button>
        </header>
        <div className="cred-detail-hero">
          {item.image && <div className={'cred-detail-image' + (item.id === 'credential-ccna' ? ' is-ccna' : '')}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt={item.name + ' badge artwork'} />
          </div>}
          <div>
            <h2 id={item.id + '-title'}>{item.name}</h2>
            <p>{item.issuer}{item.issued ? ' · ' + item.issued : ''}</p>
            <p className="cred-detail-status">{item.directUrl ? 'Public issuer credential linked' : item.earned ? 'Earned · Individual verification link not yet linked' : 'In progress'}</p>
            {item.directUrl ? <a className="cred-detail-primary" href={item.directUrl} target="_blank" rel="noopener noreferrer">View official certificate / badge ↗</a> : item.earned && <>
              {item.lookupUrl && <a className="cred-detail-primary" href={item.lookupUrl} target="_blank" rel="noopener noreferrer">Issuer lookup ↗</a>}
              {item.requestUrl && <a className="cred-detail-secondary" href={item.requestUrl}>Request individual proof</a>}
            </>}
            {item.directUrl && <p className="cred-detail-note">The original credential opens on the issuer's own page, including its available verification information.</p>}
          </div>
        </div>
        {item.skills.length > 0 && <section className="cred-detail-section"><h3>Skills covered</h3><div className="cred-detail-skills">{item.skills.map(s => <span key={s}>{s}</span>)}</div><p className="cred-detail-note">Topics associated with this credential; not separate endorsements or a proficiency rating.</p></section>}
        {item.stackable && <section className="cred-detail-section"><h3>Stackable credential</h3><div className="cred-combination"><a href="#credential-security-plus" onClick={() => dialog.current?.close()}>Security+</a><span aria-hidden="true">+</span><a href="#credential-pentest-plus" onClick={() => dialog.current?.close()}>PenTest+</a><span aria-hidden="true">→</span><strong>CNVP</strong></div><p className="cred-detail-note">Awarded for the qualifying certifications, not a separate exam.</p></section>}
        {item.projects.length > 0 && <section className="cred-detail-section"><h3>Related practical work</h3><div className="cred-detail-projects">{item.projects.map(p => <Link key={p.id} href={'/projects/' + p.id} onClick={() => dialog.current?.close()}>{p.title}<span aria-hidden="true">↗</span></Link>)}</div><p className="cred-detail-note">Portfolio projects connected to the subject matter; not issuer-assessed evidence.</p></section>}
        <section className="cred-detail-section"><h3>Share this credential card</h3><div className="cred-detail-share"><input aria-label="Public portfolio card link" value={shareUrl} readOnly onFocus={e => e.currentTarget.select()} /><button type="button" onClick={share}>Share / copy</button></div><p className="cred-detail-note" role="status">{feedback}</p></section>
      </div>
    </dialog>
  </>
}
