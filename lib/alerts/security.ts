// 🛡 Mini SOC for the portfolio itself. Runs in middleware (edge), so only uses fetch.
// Detects vulnerability scanners, credential-file probes and canary traps, maps them to
// MITRE ATT&CK, and sends a throttled Telegram incident.

export type Rule = { id: string; re: RegExp; title: string; technique: string; severity: 'Low' | 'Medium' | 'High' }

// Decoy paths listed as "Disallow" in robots.txt — no legitimate visitor or crawler opens them.
export const DECOYS = ['/internal-backup', '/admin-portal']

export const RULES: Rule[] = [
  { id: 'decoy', re: /^\/(internal-backup|admin-portal)(\/|$)/i, title: 'Decoy path from robots.txt opened', technique: 'T1595.003 Active Scanning: Wordlist Scanning', severity: 'Medium' },
  { id: 'secrets', re: /(^|\/)(\.env(\.\w+)?|\.git\/(config|HEAD)|\.aws\/credentials|\.ssh\/id_rsa|id_rsa|\.npmrc|\.htpasswd|\.DS_Store|config\.(php|json|yml|yaml)|secrets?\.(json|ya?ml)|credentials\.json|docker-compose\.ya?ml|web\.config)$/i, title: 'Probe for credential / config files', technique: 'T1552.001 Unsecured Credentials: Credentials In Files', severity: 'Medium' },
  { id: 'backup', re: /\.(sql|bak|old|backup|tar|tar\.gz|tgz|zip|7z|rar)$/i, title: 'Probe for backup / database dumps', technique: 'T1595.003 Active Scanning: Wordlist Scanning', severity: 'Medium' },
  { id: 'cms', re: /^\/(wp-admin|wp-login\.php|wp-content|wp-includes|xmlrpc\.php|wordpress|wp-json|phpmyadmin|pma|administrator|joomla|drupal|vendor\/phpunit|cgi-bin|boaform|HNAP1|owa|ecp|autodiscover)(\/|$|\.)/i, title: 'Vulnerability scanner (CMS / admin panels)', technique: 'T1595.002 Active Scanning: Vulnerability Scanning', severity: 'Low' },
  { id: 'rce', re: /(\.\.\/|%2e%2e|\/etc\/passwd|\/bin\/sh|cmd\.exe|<script|%3cscript|\$\{jndi:|union(\s|%20)+select|\/actuator|\/server-status|\/solr\/|\/console\/|\.php$|\.asp$|\.aspx$|\.jsp$)/i, title: 'Exploit attempt (traversal / injection / RCE payload)', technique: 'T1190 Exploit Public-Facing Application', severity: 'High' },
]

export function matchRule(path: string, search: string): Rule | null {
  const target = decodeSafe(path + search)
  return RULES.find((r) => r.re.test(path) || (r.id === 'rce' && r.re.test(target))) || null
}

function decodeSafe(s: string) { try { return decodeURIComponent(s) } catch { return s } }

const recent = new Map<string, { at: number; hits: number }>()

/** Returns false when this source already alerted for this rule in the last 10 minutes (counts the hit). */
export function shouldAlert(key: string) {
  const now = Date.now()
  const r = recent.get(key)
  if (r && now - r.at < 10 * 60_000) { r.hits++; return false }
  if (recent.size > 2000) recent.clear()
  recent.set(key, { at: now, hits: 1 })
  return true
}

const flag = (cc?: string | null) => cc && /^[A-Z]{2}$/i.test(cc) ? String.fromCodePoint(...cc.toUpperCase().split('').map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)) : ''
const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

type Tg = { ok: boolean; result?: any }
async function tg(method: string, body: Record<string, unknown>): Promise<Tg> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return { ok: false }
  try {
    const r = await fetch(`${process.env.TELEGRAM_API_BASE || 'https://api.telegram.org'}/bot${token}/${method}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
    return (await r.json()) as Tg
  } catch { return { ok: false } }
}

/** Reads topic IDs and mute/quiet from the pinned settings message (same format as lib/alerts/settings.ts). */
async function settings(): Promise<{ thread?: number; hushed: boolean }> {
  const r = await tg('getChat', { chat_id: process.env.TELEGRAM_CHAT_ID })
  const text: string = r.result?.pinned_message?.text || ''
  const m = text.match(/PWEZA-CFG (\{[\s\S]*\})\s*$/)
  if (!m) return { hushed: false }
  try {
    const s = JSON.parse(m[1])
    let hushed = !!(s.mutedUntil && s.mutedUntil > Date.now())
    if (!hushed && s.quiet) {
      const h = Number(new Intl.DateTimeFormat('en-US', { timeZone: s.tz || 'America/New_York', hour: 'numeric', hourCycle: 'h23' }).format(new Date()))
      hushed = s.quiet.from <= s.quiet.to ? h >= s.quiet.from && h < s.quiet.to : h >= s.quiet.from || h < s.quiet.to
    }
    return { thread: s.topics?.priority, hushed }
  } catch { return { hushed: false } }
}

export async function securityAlert(info: { rule: Pick<Rule, 'title' | 'technique' | 'severity'>; path: string; method: string; ip: string; ua: string; city?: string | null; country?: string | null; extra?: string }) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return
  const { thread, hushed } = await settings()
  const icon = info.rule.severity === 'High' ? '🚨' : info.rule.severity === 'Medium' ? '🛡' : '🔎'
  const text = [
    `${icon} <b>Security · ${esc(info.rule.title)}</b>`,
    `Severity: <b>${info.rule.severity}</b> · MITRE ATT&amp;CK <code>${esc(info.rule.technique)}</code>`,
    '',
    `🎯 <code>${esc(info.method)} ${esc(info.path.slice(0, 180))}</code>`,
    `🌐 ${esc(info.ip || 'unknown IP')} · 📍 ${esc([info.city, info.country].filter(Boolean).join(', ') || 'Unknown')} ${flag(info.country)}`,
    `🤖 ${esc((info.ua || 'no user agent').slice(0, 140))}`,
    info.extra ? `ℹ️ ${esc(info.extra)}` : null,
    '',
    '<i>Response: request blocked. Repeats from this source are grouped for 10 min.</i>',
  ].filter((l) => l !== null).join('\n')
  const body: Record<string, unknown> = {
    chat_id: process.env.TELEGRAM_CHAT_ID, text, parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    disable_notification: hushed || info.rule.severity !== 'High',
    reply_markup: info.ip ? { inline_keyboard: [[{ text: '🔎 AbuseIPDB', url: `https://www.abuseipdb.com/check/${encodeURIComponent(info.ip)}` }, { text: '🔍 GreyNoise', url: `https://viz.greynoise.io/ip/${encodeURIComponent(info.ip)}` }]] } : undefined,
  }
  if (thread) body.message_thread_id = thread
  await tg('sendMessage', body)
}
