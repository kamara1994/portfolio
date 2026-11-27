import { CORPUS, type Passage } from './corpus'

// BM25 retrieval over PWEZA's passages, with security-domain synonyms and name aliases,
// so "Allan's SIEM work" finds the BLUE SOC / Splunk passages.

const STOP = new Set('a an the is are was were be been do does did you your he his him i me my to of in on for and or with at by from about can could would will what whats which who whom how when where why it this that these those there any some has have had as into than then so if not no yes tell show give please also just more most very really like get'.split(' '))

const SYNONYMS: Record<string, string[]> = {
  allan: ['joseph'], alan: ['joseph'], allen: ['joseph'], joe: ['joseph'], kamara: ['joseph'],
  aws: ['cloud', 'amazon'], cloud: ['aws'], amazon: ['aws'],
  siem: ['splunk', 'soc'], splunk: ['siem', 'soc'], soc: ['security', 'operations', 'triage', 'siem'],
  ml: ['machine', 'learning', 'pytorch'], ai: ['machine', 'learning', 'llm'], pytorch: ['ml', 'machine'],
  network: ['networking', 'cisco', 'ccna', 'ospf', 'vlan'], networking: ['network', 'cisco'], cisco: ['ccna', 'network'],
  cert: ['certification', 'certifications'], certification: ['cert', 'certifications'], certs: ['certifications'],
  hire: ['available', 'availability', 'contact', 'roles'], job: ['roles', 'available'], contact: ['email', 'linkedin'],
  pentest: ['penetration', 'pentest+'], threat: ['detection', 'classifier'], iac: ['terraform'], terraform: ['iac', 'aws'],
  school: ['byu-idaho', 'degree', 'education'], degree: ['education', 'byu-idaho'], experience: ['work', 'role'],
}

function stem(w: string) {
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3)
  if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2)
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1)
  return w
}

export function tokens(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9+\- ]+/g, ' ').split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w)).map(stem)
}

const DOCS = CORPUS.map((p) => ({ p, toks: tokens(`${p.title} ${p.title} ${p.text}`) }))
const AVG = DOCS.reduce((a, d) => a + d.toks.length, 0) / Math.max(1, DOCS.length)
const DF = new Map<string, number>()
for (const d of DOCS) new Set(d.toks).forEach((t) => DF.set(t, (DF.get(t) || 0) + 1))

const BROAD = /\b(different|special|unique|stand(s)? out|strength|strongest|best|why (should|would)|why hire|hire him|good fit|overview|summary|summari[sz]e|tell me about (him|joseph)|who is|what does (he|joseph) do|background|impress)/i
const FLAGSHIP = ['blue-soc-p8', 'blue-x', 'fortress-v2', 'pweza-voice-agent']

export function retrieve(query: string, k = 6, extra: Passage[] = []): Passage[] {
  const q = tokens(query)
  const expanded = q.concat(q.flatMap((t) => (SYNONYMS[t] || []).map(stem)))
  const docs = extra.length ? DOCS.concat(extra.map((p) => ({ p, toks: tokens(`${p.title} ${p.text}`) }))) : DOCS
  const N = docs.length, k1 = 1.4, b = 0.75
  const scored = docs.map((d) => {
    let s = 0
    const len = d.toks.length
    for (const t of Array.from(new Set(expanded))) {
      const tf = d.toks.filter((x) => x === t).length
      if (!tf) continue
      const idf = Math.log(1 + (N - (DF.get(t) || 0) + 0.5) / ((DF.get(t) || 0) + 0.5))
      s += idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * len) / AVG)))
    }
    return { p: d.p, s }
  }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s)
  const picked = scored.slice(0, k).map((x) => x.p)
  // Broad "who is he / why him" questions: ground them in the flagship project summaries too,
  // so the slim prompt answers them as richly as the old full knowledge base did.
  if (BROAD.test(query)) {
    for (const p of CORPUS.filter((x) => FLAGSHIP.includes(x.id))) if (!picked.includes(p)) picked.push(p)
  }
  // Always ground identity/availability questions even when wording is unusual.
  if (!picked.length) return CORPUS.filter((p) => p.id === 'identity' || p.id === 'availability')
  return picked
}

export function sourcesBlock(sources: Passage[]) {
  return sources.map((s, i) => `[${i + 1}] ${s.title} (${s.href}): ${s.text}`).join('\n')
}
