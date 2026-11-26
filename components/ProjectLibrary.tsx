'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { Project } from '@/data/projects'
import previews from '@/data/next-project-previews.json'
import styles from './ProjectLibrary.module.css'

const categories = ['Cybersecurity', 'Cloud engineering', 'Networking', 'AI & automation', 'Software engineering'] as const
type Category = typeof categories[number]
const tags: Record<string, Category[]> = {
  'salone-aegis': ['Networking','Cybersecurity','Software engineering'],
  'blue-soc-p8': ['Cybersecurity','AI & automation','Software engineering'],
  'elitecom': ['Software engineering','Cybersecurity'],
  'pandie-foundation': ['Software engineering'],
  'fortress-v2': ['Cybersecurity','Cloud engineering'],
  'blue-x': ['Cybersecurity','AI & automation'],
  'enterprise-networking': ['Networking','Cybersecurity'],
  'pweza-voice-agent': ['AI & automation','Software engineering'],
  'griot-nexus': ['AI & automation','Software engineering'],
}
function projectCategories(p: Project): Category[] {
  if (tags[p.id]) return tags[p.id]
  if (p.course === 'CYBER375') return ['Cybersecurity']
  if (p.course === 'ITM 400') return p.id === 'aws-iam-security' ? ['Cloud engineering','Cybersecurity'] : p.id === 'aws-vpc-peering' ? ['Cloud engineering','Networking'] : ['Cloud engineering']
  if (p.course === 'CYBER345') return p.id === 'wireless-security' ? ['Networking','Cybersecurity'] : ['Networking']
  return ['Software engineering']
}
const statuses: Record<NonNullable<Project['status']>, string> = {
  'lab-validated':'Lab validated', 'live-demo':'Live demo listed', 'case-study':'Case study',
  'in-development':'In development', verified:'Production verified',
}
function statusLabel(p: Project) {
  return p.course && p.status === 'in-development' ? 'Partial / incomplete lab' : p.status ? statuses[p.status] : 'Project'
}
const roles: { label: string; categories: Category[]; keywords: string[] }[] = [
  { label:'SOC analyst', categories:['Cybersecurity'], keywords:['security onion','splunk','incident','endpoint','phishing','siem','soc','detection'] },
  { label:'Security engineer', categories:['Cybersecurity','Cloud engineering'], keywords:['security','vulnerability','iam','firewall','least privilege','fortress'] },
  { label:'Cloud engineer', categories:['Cloud engineering'], keywords:['aws','cloud','vpc','ec2','automation','migration','terraform'] },
  { label:'Network engineer', categories:['Networking'], keywords:['network','cisco','vlan','wireless','routing','wireshark','vpc'] },
  { label:'Software engineer', categories:['Software engineering'], keywords:['react','next.js','typescript','api','postgresql','web','software'] },
  { label:'AI / automation engineer', categories:['AI & automation'], keywords:['ai','automation','voice','agent','provider','workflow'] },
]
function searchable(p: Project) {
  return [p.title,p.subtitle,p.category,p.course,p.role,p.description,p.approach,p.outcome,p.impact,p.stack.join(' '),p.architecture?.join(' '),...projectCategories(p)].filter(Boolean).join(' ').toLowerCase()
}
function roleScore(p: Project, role: typeof roles[number] | undefined) {
  if (!role || !projectCategories(p).some(c=>role.categories.includes(c))) return 0
  const hay = searchable(p)
  return 10 + role.keywords.filter(k=>hay.includes(k)).length
}
const authenticPreviews: Record<string,string> = previews
function mediaFor(p: Project) {
  const source = authenticPreviews[p.id] || p.screenshot || p.evidenceImages?.[0]?.src
  const caption = p.evidenceImages?.find(i=>i.src===source)?.caption
  return { source, caption, label: p.mediaLabel || (p.id==='cloud-cafe-architecture'?'Related lab screenshot':source ? 'Project evidence' : p.video ? 'Demo preview' : 'Architecture overview') }
}
function Preview({project:p}:{project:Project}) {
  const [failed,setFailed] = useState(false)
  const {source,label,caption}=mediaFor(p)
  const steps=(p.architecture?.length ? p.architecture.slice(0,3).map(s=>s.split('→')[0].trim()) : p.stack.slice(0,3))
  return <div className={styles.preview}>
    {source&&!failed ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={source} alt={caption || p.title+' — '+label} loading="lazy" decoding="async" onError={()=>setFailed(true)}/>
    ) : p.video&&!failed ? <video src={p.video} muted playsInline preload="metadata" aria-label={p.title+' demo preview'} onError={()=>setFailed(true)}/> : <div className={styles.flow} aria-label="Summary of documented components, not a screenshot"><span className={styles.flowKicker}>DOCUMENTED COMPONENTS</span>{steps.map((s,i)=><div className={styles.flowNode} key={i}><span>{String(i+1).padStart(2,'0')}</span>{s}</div>)}</div>}
    <span className={styles.mediaLabel}>{failed?'Architecture overview':label}</span>
  </div>
}
function Card({project:p,featured=false}:{project:Project;featured?:boolean}) {
  const [expanded,setExpanded]=useState(false)
  return <article className={styles.card}>
    <Link href={'/projects/'+p.id} className={styles.cardLink} aria-label={'Open '+p.title}>
      <Preview project={p}/>
      <div className={styles.body}>
        <div className={styles.meta}><span>{p.course || projectCategories(p)[0]}</span><span className={styles.status} data-status={p.status}><i aria-hidden="true"/>{statusLabel(p)}</span></div>
        <h3>{p.title}</h3><p className={styles.subtitle}>{p.subtitle}</p>
        <div className={styles.badges}>{p.stack.slice(0,4).map((s,i)=><span key={i}>{s}</span>)}{p.stack.length>4&&<span>+{p.stack.length-4}</span>}</div>
        <div className={styles.cardBottom}><span>{featured?'Featured project':'View case study'}</span><span aria-hidden="true">↗</span></div>
      </div>
    </Link>
    <div className={styles.quick}>
      <button type="button" aria-expanded={expanded} onClick={()=>setExpanded(x=>!x)}>{expanded?'Hide technical preview':'Technical preview'} <span aria-hidden="true">{expanded?'−':'+'}</span></button>
      <div className={styles.quickContent} data-expanded={expanded}><p>{p.description}</p><p><strong>Outcome:</strong> {p.outcome}</p><div className={styles.quickLinks}>{p.report&&<a href={p.report}>Report ↗</a>}{p.architecture?.length&&<Link href={'/projects/'+p.id+'#architecture'}>Architecture ↗</Link>}{p.demo&&<a href={p.demo} target="_blank" rel="noopener noreferrer">Demo link ↗</a>}</div></div>
    </div>
  </article>
}
export default function ProjectLibrary({projects}:{projects:Project[]}) {
  const [query,setQuery]=useState('')
  const [category,setCategory]=useState<Category|'All'>('All')
  const [status,setStatus]=useState('all')
  const [kind,setKind]=useState('all')
  const [view,setView]=useState<'grid'|'list'>('grid')
  const [role,setRole]=useState('')
  const [sort,setSort]=useState('featured')
  const selectedRole=roles.find(r=>r.label===role)
  const active=Boolean(query.trim()||category!=='All'||status!=='all'||kind!=='all'||role)
  const featured=projects.filter(p=>p.featured&&!p.course).slice(0,3)
  const stats=[['Projects',projects.length],['Reports',projects.filter(p=>p.report).length],['Architecture sections',projects.filter(p=>p.architecture?.length).length],['Demo links',projects.filter(p=>p.demo||p.video).length]] as const
  const result=useMemo(()=>{
    const tokens=query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    const matches=projects.filter(p=>(category==='All'||projectCategories(p).includes(category))&&(status==='all'||p.status===status)&&(kind==='all'||(kind==='coursework'?Boolean(p.course):!p.course))&&(!selectedRole||roleScore(p,selectedRole)>0)&&tokens.every(t=>searchable(p).includes(t)))
    return matches.sort((a,b)=>sort==='az'?a.title.localeCompare(b.title):sort==='za'?b.title.localeCompare(a.title):sort==='evidence'?Number(Boolean(b.report))+Number(Boolean(b.architecture?.length))+Number(Boolean(mediaFor(b).source))-Number(Boolean(a.report))-Number(Boolean(a.architecture?.length))-Number(Boolean(mediaFor(a).source)):selectedRole?roleScore(b,selectedRole)-roleScore(a,selectedRole):Number(Boolean(b.featured))-Number(Boolean(a.featured)))
  },[projects,query,category,status,kind,selectedRole,sort])
  function clear(){setQuery('');setCategory('All');setStatus('all');setKind('all');setRole('');setSort('featured')}
  return <main className={styles.library}>
    <div className="wrap project-wrap pb-20 pt-28 md:pt-32">
      <Link href="/#work" className={styles.back}>← Back to portfolio</Link>
      <header className={styles.hero}>
        <div><p className={styles.eyebrow}>ENGINEERING WORK / PROJECT INDEX</p><h1>Project <span>library.</span></h1><p className={styles.lead}>Explore independent platforms, security investigations, cloud architecture and networking labs. Every project has its own technical case study.</p></div>
        <div className={styles.stats}>{stats.map(([label,count])=><div key={label}><strong>{String(count).padStart(2,'0')}</strong><span>{label}</span></div>)}</div>
      </header>
      {!active&&featured.length>0&&<section className={styles.featured} aria-labelledby="featured-heading"><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>SELECTED WORK</p><h2 id="featured-heading">Featured engineering</h2></div><a href="#project-index">Explore all {projects.length} ↓</a></div><div className={styles.grid}>{featured.map(p=><Card key={p.id} project={p} featured/>)}</div></section>}
      <section id="project-index" className={styles.index} aria-labelledby="index-heading">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>DISCOVER / FILTER / COMPARE</p><h2 id="index-heading">All projects</h2></div></div>
        <div className={styles.controls}>
          <div className={styles.searchRow}><label className={styles.search}><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search projects, skills, technologies…" aria-label="Search projects"/></label><div className={styles.viewToggle} role="group" aria-label="Project view"><button type="button" aria-pressed={view==='grid'} onClick={()=>setView('grid')}>▦ Grid</button><button type="button" aria-pressed={view==='list'} onClick={()=>setView('list')}>☰ List</button></div></div>
          <div className={styles.chips} role="group" aria-label="Filter by category">{(['All',...categories] as const).map(c=><button key={c} type="button" aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}<span>{c==='All'?projects.length:projects.filter(p=>projectCategories(p).includes(c)).length}</span></button>)}</div>
          <div className={styles.selectRow}><label>Verification status<select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All statuses</option>{Object.entries(statuses).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label>Project type<select value={kind} onChange={e=>setKind(e.target.value)}><option value="all">All project types</option><option value="independent">Independent projects</option><option value="coursework">Coursework</option></select></label><label>Sort by<select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">{role?'Role relevance':'Featured first'}</option><option value="az">Name A–Z</option><option value="za">Name Z–A</option><option value="evidence">Evidence coverage</option></select></label></div>
          <div className={styles.recruiter}><div><p className={styles.eyebrow}>RECRUITER MODE</p><h3>Explore by role</h3><p>Match documented skills to a hiring focus. Rankings are based on project topics, not a proficiency score.</p></div><div className={styles.chips} role="group" aria-label="Recruiter role"><button type="button" aria-pressed={!role} onClick={()=>{setRole('');setSort('featured')}}>All roles</button>{roles.map(r=><button key={r.label} type="button" aria-pressed={role===r.label} onClick={()=>{setRole(r.label);setSort('featured')}}>{r.label}</button>)}</div></div>
        </div>
        <div className={styles.results}><p aria-live="polite"><strong>{result.length}</strong> of {projects.length} projects{role?' · '+role:''}</p>{active&&<button type="button" onClick={clear}>Reset filters ×</button>}</div>
        {result.length ? <div className={view==='grid'?styles.grid:styles.list}>{result.map(p=><Card key={p.id} project={p}/>)}</div> : <div className={styles.empty}><h3>No matching projects</h3><p>Try a broader skill or clear the filters.</p><button type="button" onClick={clear}>Reset filters</button></div>}
        <p className={styles.disclaimer}>Evidence labels distinguish original screenshots, design artifacts, assessment records and source-derived summaries. Listed demo links and recorded statuses are not live uptime checks. Academic scores are not production metrics.</p>
      </section>
    </div>
  </main>
}
