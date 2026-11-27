'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import Link from 'next/link'
import { SKILL_CATEGORIES, PROJECT_NAMES, type Skill, type SkillCategory } from '@/data/skills'
import { projects, type Project } from '@/data/projects'
import { useRole } from './roles'
import styles from './Skills.module.css'

const ROLE_CATEGORY: Record<string,string> = { recruiter: 'secops', soc: 'secops', engineer: 'cloud' }
const ROLES = [
  { id:'soc', label:'SOC analyst', cats:['secops','network','frameworks'] },
  { id:'security', label:'Security engineer', cats:['secops','cloud','network','offense','frameworks'] },
  { id:'network', label:'Network engineer', cats:['network','networking'] },
  { id:'cloud', label:'Cloud engineer', cats:['cloud','network','dev'] },
  { id:'software', label:'Software engineer', cats:['dev','ai'] },
  { id:'ai', label:'AI / automation', cats:['ai','dev','secops'] },
]
const ACCENTS:Record<string,string> = {secops:'#60c9fa',cloud:'#f2b36d',network:'#56d6c2',networking:'#8ab5ff',offense:'#f192a6',ai:'#b6a1ff',dev:'#77b5fc',frameworks:'#a5b5cc'}
const ICONS:Record<string,string> = {
 shield:'M12 3 4 6v6c0 5 4 8 8 10 4-2 8-5 8-10V6l-8-3Z M9 12l2 2 4-4',
 cloud:'M6 18a4 4 0 0 1-1-8 7 7 0 0 1 13-1 5 5 0 0 1 0 9H6Z M9 14h6',
 radar:'M12 12 21 3 M12 8a4 4 0 1 0 4 4 M12 3a9 9 0 1 0 9 9 M12 12h.01',
 network:'M12 7v4 M5 17v-6h14v6 M12 11v6 M9 3h6v4H9z M2 17h6v4H2z M9 17h6v4H9z M16 17h6v4h-6z',
 target:'M12 3a9 9 0 1 0 9 9 M12 7a5 5 0 1 0 5 5 M12 12l9-9 M17 3h4v4',
 spark:'M4 8h16v12H4z M9 3h6 M12 3v5 M8 12h.01 M16 12h.01 M8 16h8 M2 11v6 M22 11v6',
 code:'M8 6 2 12l6 6 M16 6l6 6-6 6 M14 4l-4 16',
 book:'M12 6v15 M3 4c4 0 6 1 9 3 3-2 5-3 9-3v15c-4 0-6 1-9 2-3-1-5-2-9-2V4Z',
}
const BRAND:Record<string,string> = {
 'Splunk SIEM':'splunk','Terraform IaC':'terraform','CloudWatch Logs':'amazonaws','Metric Filters':'amazonaws','CloudWatch Alarms':'amazonaws','Amazon SNS':'amazonaws','AWS CLI':'amazonaws','AWS Lambda':'amazonaws','Palo Alto NGFW':'paloaltonetworks','OSPF Routing':'cisco','VRRP Redundancy':'cisco','LACP EtherChannel':'cisco','VLANs and VTP':'cisco','SSH Hardening':'cisco','DHCP and STP':'cisco','Metasploit':'metasploit','Burp Suite':'burpsuite','PyTorch':'pytorch','Python':'python','TypeScript and Next.js':'typescript','Flask':'flask','Docker and Linux':'docker','Wireshark':'wireshark',
}
const CERTS:Record<string,string> = {'TCM PSAA':'credential-psaa','Security+':'credential-security-plus','PenTest+':'credential-pentest-plus',CCNA:'credential-ccna',CNVP:'credential-cnvp'}
const FLOWS:Record<string,string[]> = {
 secops:['Splunk SIEM','SIEM Detection Rules','Alert Triage','Incident Response'],
 cloud:['Terraform IaC','CloudWatch Logs','Metric Filters','CloudWatch Alarms','Amazon SNS'],
 network:['Zeek','Suricata IDS','Traffic Classification','Palo Alto NGFW'],
 networking:['VLANs and VTP','LACP EtherChannel','OSPF Routing','VRRP Redundancy'],
 offense:['Nmap','Vulnerability Assessment','Attack Simulation'],
 ai:['n8n Orchestration','Claude LLM API','Multi-Model Routing'],
 dev:['Python','REST APIs','Docker and Linux'],
 frameworks:['NIST CSF','GRC Fundamentals','Zero Trust'],
}
const ALL = SKILL_CATEGORIES.flatMap(cat=>cat.skills.map(skill=>({cat,skill})))
const evidence = (s:Skill) => s.projects?.length && s.certs?.length ? {text:'Project + cert',cls:'ev-both'} : s.projects?.length ? {text:'Project evidence',cls:'ev-built'} : {text:'Cert coverage',cls:'ev-cert'}
function Icon({name,className}: {name:string;className?:string}) {return <svg className={className} aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={ICONS[name] || ICONS.code}/></svg>}
function artStyle(cat:SkillCategory):CSSProperties {return {'--skill-accent':ACCENTS[cat.id]||'#90baff'} as CSSProperties}
function Artwork({skill,cat,large=false}:{skill:Skill;cat:SkillCategory;large?:boolean}) {
 const brand=BRAND[skill.name]
 return <span className={large?styles.largeArt:styles.art} aria-hidden="true" style={artStyle(cat)}>{brand?<span className={styles.brand} style={{maskImage:'url(/skill-logos/'+brand+'.svg)',WebkitMaskImage:'url(/skill-logos/'+brand+'.svg)'}}/>:<Icon name={cat.icon}/>}</span>
}
function projectFor(id:string) {return projects.find(p=>p.id===id && p.placement)}
function Proof({skill,onNavigate}:{skill:Skill;onNavigate?:()=>void}) {
 return <div className={styles.proofs}>{skill.projects?.map(id=>{const p=projectFor(id);return p?<Link key={id} onClick={onNavigate} href={'/projects/'+id} className={'sk-proof sk-proof-link '+styles.proj} title="Project evidence"><span aria-hidden="true">🛠️</span>{PROJECT_NAMES[id]||p.title} ↗</Link>:null})}{skill.certs?.map(c=>CERTS[c]?<Link key={c} onClick={onNavigate} href={'/#'+CERTS[c]} className={'sk-proof sk-proof-link '+styles.cert} title="Certification coverage"><span aria-hidden="true">🏅</span>{c} ↗</Link>:<span key={c} className={'sk-proof '+styles.cert}><span aria-hidden="true">🏅</span>{c}</span>)}</div>
}
function Preview({project:p}:{project:Project}) {
 const source=p.screenshot||p.evidenceImages?.[0]?.src
 const caption=p.evidenceImages?.find(i=>i.src===source)?.caption || p.mediaLabel || 'Existing project image'
 return <Link href={'/projects/'+p.id} className={styles.evidencePreview}>
 {source?<div className={styles.media}>
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img src={source} alt={p.title+' — '+caption} loading="lazy"/>
 </div>:null}
 <div><h4>{p.title} <span aria-hidden="true">↗</span></h4>{source&&<p className={styles.caption}>{caption}</p>}<p>{p.outcome}</p>{!source&&<p className={styles.caption}>Case study available; no preview image listed.</p>}</div>
 </Link>
}
export default function Skills() {
 const [active,setActive]=useState(SKILL_CATEGORIES[0].id)
 const [query,setQuery]=useState('')
 const [recruiter,setRecruiter]=useState('')
 const [selected,setSelected]=useState<{cat:SkillCategory;skill:Skill}|null>(null)
 const dialog=useRef<HTMLDialogElement>(null)
 const tabs=useRef<(HTMLButtonElement|null)[]>([])
 const lastFocus=useRef<HTMLElement|null>(null)
 const tabsBox=useRef<HTMLDivElement>(null)
 const role=useRole()
 // Sliding highlight: follows the active tab (vertical list on desktop, swipeable chips on phones)
 useEffect(()=>{
  const box=tabsBox.current, el=tabs.current[SKILL_CATEGORIES.findIndex(c=>c.id===active)]
  if(!box||!el)return
  const place=()=>{
   box.style.setProperty('--ind-y',el.offsetTop+'px');box.style.setProperty('--ind-h',el.offsetHeight+'px')
   box.style.setProperty('--ind-x',el.offsetLeft+'px');box.style.setProperty('--ind-w',el.offsetWidth+'px')
   box.style.setProperty('--ind-accent',ACCENTS[active]||'#90baff')
  }
  place()
  if(box.scrollWidth>box.clientWidth+4)box.scrollTo({left:el.offsetLeft-box.clientWidth/2+el.offsetWidth/2,behavior:'smooth'})
  const ro=new ResizeObserver(place);ro.observe(box)
  return()=>ro.disconnect()
 },[active])
 useEffect(()=>{if(role&&ROLE_CATEGORY[role])setActive(ROLE_CATEGORY[role])},[role])
 const chosenRole=ROLES.find(r=>r.id===recruiter)
 const cat=SKILL_CATEGORIES.find(c=>c.id===active)||SKILL_CATEGORIES[0]
 const searching=Boolean(query.trim()||chosenRole)
 const results=useMemo(()=>{const tokens=query.trim().toLowerCase().split(/\s+/).filter(Boolean);return ALL.filter(({cat:c,skill:s})=>(!chosenRole||chosenRole.cats.includes(c.id))&&tokens.every(t=>[s.name,s.what,c.title,...(s.certs||[]),...(s.projects||[]).map(p=>projectFor(p)?.title||p)].join(' ').toLowerCase().includes(t)))},[query,chosenRole])
 const shown=searching?results:cat.skills.map(skill=>({cat,skill}))
 function choose(id:string){setActive(id);setQuery('');setRecruiter('')}
 function onKey(e:KeyboardEvent){const i=SKILL_CATEGORIES.findIndex(c=>c.id===active);const n=SKILL_CATEGORIES.length;const to:Record<string,number>={ArrowDown:i+1,ArrowRight:i+1,ArrowUp:i-1,ArrowLeft:i-1,Home:0,End:n-1};if(!(e.key in to))return;e.preventDefault();const j=(to[e.key]+n)%n;choose(SKILL_CATEGORIES[j].id);tabs.current[j]?.focus()}
 function open(c:SkillCategory,s:Skill){lastFocus.current=document.activeElement as HTMLElement;setSelected({cat:c,skill:s})}
 useEffect(()=>{if(selected&&dialog.current&&!dialog.current.open)dialog.current.showModal()},[selected])
 function close(){dialog.current?.close()}
 function afterClose(){setSelected(null);lastFocus.current?.focus({preventScroll:true})}
 const related=selected?.skill.projects?.flatMap(id=>{const p=projectFor(id);return p?[p]:[]})||[]
 return <section id="skills" className="lazy-section border-t border-line">
  <div className="wrap py-16 md:py-32">
   <p className="text-[clamp(18px,1.4vw,22px)] font-medium text-signal">Applied skills</p>
   <h2 className="mt-3 font-display text-[clamp(38px,4.4vw,68px)] font-bold uppercase leading-[0.95]">Skills with <span className="title-accent">proof</span></h2>
   <p className="mt-5 max-w-[60ch] text-[17px] leading-relaxed text-smoke">Explore the technologies, documented work and certification coverage behind each skill.</p>
   <div className={styles.toolbar}>
     <label className={styles.search}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><input type="search" aria-label="Search all skills" placeholder="Search skills, tools, certifications…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
     <label className={styles.role}><span>Recruiter focus</span><select aria-label="Filter skills by role" value={recruiter} onChange={e=>setRecruiter(e.target.value)}><option value="">All roles</option>{ROLES.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}</select></label>
     {searching&&<button className={styles.reset} onClick={()=>{setQuery('');setRecruiter('')}}>Reset ×</button>}
   </div>
   <div className={styles.layout}>
    <div ref={tabsBox} className={styles.tabs} role="tablist" aria-label="Skill categories" onKeyDown={onKey} data-searching={searching}>
      <span className={styles.indicator} aria-hidden="true"/>
      {SKILL_CATEGORIES.map((c,i)=><button type="button" key={c.id} id={'skill-tab-'+c.id} ref={el=>{tabs.current[i]=el}} role="tab" tabIndex={c.id===active?0:-1} aria-selected={c.id===active&&!searching} aria-controls="skill-panel" className={styles.tab} data-active={c.id===active&&!searching} onClick={()=>choose(c.id)} style={artStyle(c)}><Icon name={c.icon} className={styles.tabIcon}/><span className={styles.tabText}><b>{c.title}</b><em>{c.skills.slice(0,3).map(x=>x.name).join(' · ')}</em></span><Icon name={c.icon} className={styles.tabWatermark}/></button>)}
    </div>
    <div id="skill-panel" role={searching?'region':'tabpanel'} aria-labelledby={searching?undefined:'skill-tab-'+cat.id} aria-label={searching?'Skill search results':undefined} className={styles.panel}>
     <div className={styles.heading} style={artStyle(cat)}><Icon name={cat.icon}/><div><h3>{searching?'Matching skills':cat.title}</h3><p>{searching?shown.length+' skill'+(shown.length===1?'':'s')+(chosenRole?' · '+chosenRole.label:'') :cat.summary}</p></div></div>
     {searching&&chosenRole&&<p className={styles.note}>Role filters match subject areas, not measured proficiency.</p>}
     {!searching&&<details className={styles.relationship}><summary>How these skills connect <span aria-hidden="true">+</span></summary><p>Illustrative technical workflow — not a claim that every step was deployed together.</p><div className={styles.nodes}>{(FLOWS[cat.id]||[]).map((name,i)=>{const s=cat.skills.find(s=>s.name===name);return s?<div key={name}>{i>0&&<span aria-hidden="true">→</span>}<button onClick={()=>open(cat,s)}>{name}</button></div>:null})}</div></details>}
     <ul className={styles.cards}>{shown.map(({cat:c,skill:s})=>{const ev=evidence(s);return <li className={styles.card} key={c.id+'-'+s.name} style={artStyle(c)}>{BRAND[s.name]&&<Artwork cat={c} skill={s}/>}<div className={styles.cardContent}><div className={styles.meta}>{searching&&<span>{c.title}</span>}<span className={'sk-ev '+ev.cls}>{ev.text}</span></div><button className={styles.skillName} onClick={()=>open(c,s)} aria-haspopup="dialog">{s.name}<span aria-hidden="true">↗</span></button><p>{s.what}</p><Proof skill={s}/></div></li>})}</ul>
     {!shown.length&&<div className={styles.empty}>No matching skills. Try a different search or reset the role filter.</div>}
    </div>
   </div>
  </div>
  <dialog ref={dialog} className={styles.dialog} aria-labelledby="skill-viewer-title" onClose={afterClose} onClick={e=>{if(e.target===e.currentTarget)close()}}>
   {selected&&<div className={styles.dialogInner} style={artStyle(selected.cat)}>
    <header className={styles.dialogTop}><span>{selected.cat.title} / Skill evidence</span><button type="button" autoFocus onClick={close} aria-label="Close skill details">×</button></header>
    <div className={styles.detailHero}><Artwork skill={selected.skill} cat={selected.cat} large/><div><h2 id="skill-viewer-title">{selected.skill.name}</h2><span className={'sk-ev '+evidence(selected.skill).cls}>{evidence(selected.skill).text}</span><p>{selected.skill.what}</p></div></div>
    <section className={styles.detailSection}><h3>Supporting credentials and case studies</h3><Proof skill={selected.skill} onNavigate={close}/><p className={styles.note}>Certification coverage describes relevant topics, not a separate endorsement for each technology.</p></section>
    {related.length>0?<section className={styles.detailSection}><h3>Documented project evidence</h3><div className={styles.previewGrid}>{related.map(p=><Preview key={p.id} project={p}/>)}</div></section>:<p className={styles.note}>No published implementation is linked to this skill yet; certification coverage only.</p>}
   </div>}
  </dialog>
 </section>
}
