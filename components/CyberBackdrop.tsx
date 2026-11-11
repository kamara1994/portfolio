/**
 * Faded cybersecurity backdrop for the footer: a perspective grid, a network
 * map of linked nodes with a few live pulses, and faint
 * packet-log text. Pure SVG, so it is crisp at any width and costs no request.
 */
const NODES: [number, number][] = [
  [80, 70], [210, 140], [330, 60], [460, 170], [600, 90], [720, 200], [860, 80], [990, 160], [1120, 70], [1260, 150], [1380, 90],
  [140, 250], [380, 280], [560, 300], [800, 290], [1040, 280], [1240, 260], [1400, 240],
]
const LINKS: [number, number][] = [
  [0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [1, 11], [3, 12], [12, 13], [13, 5], [5, 14],
  [14, 7], [7, 15], [15, 16], [16, 9], [16, 17], [2, 4], [6, 8],
]
const LIVE = [3, 5, 7, 13, 15]
const LOG = [
  '10.0.4.17 → 172.16.2.8  TCP 443  ALLOW',
  'alert: brute-force pattern  sev=high  triage→analyst',
  'cloudwatch: metric filter match  alarm=OK→ALARM',
  '192.168.1.40 → 10.0.0.5  UDP 53  INSPECT',
  'classifier: phishing suspected  action=hold for analyst review',
  'sns: notification delivered  topic=security-alerts',
]

export default function CyberBackdrop() {
  return (
    <div aria-hidden className="cyber-backdrop">
      <svg viewBox="0 0 1440 340" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <defs>
          <linearGradient id="cb-link" x1="0" x2="1">
            <stop stopColor="#4CC9FF" stopOpacity="0" />
            <stop offset=".5" stopColor="#6FA8FF" stopOpacity=".55" />
            <stop offset="1" stopColor="#A78BFA" stopOpacity="0" />
          </linearGradient>
          <pattern id="cb-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0H0V48" fill="none" stroke="#7FA6FF" strokeOpacity=".09" strokeWidth="1" />
          </pattern>
          <radialGradient id="cb-hub" cx=".5" cy=".5" r=".5">
            <stop stopColor="#4CC9FF" stopOpacity=".22" />
            <stop offset="1" stopColor="#4CC9FF" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="1440" height="340" fill="url(#cb-grid)" />
        <circle cx="720" cy="170" r="230" fill="url(#cb-hub)" />

        {/* Packet log, very faint */}
        <g fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="11" fill="#8FB8FF" fillOpacity=".09">
          {LOG.map((l, i) => (
            <text key={i} x={i % 2 ? 1030 : 40} y={36 + i * 52}>{l}</text>
          ))}
        </g>

        {/* Network map */}
        <g stroke="url(#cb-link)" strokeWidth="1">
          {LINKS.map(([a, b], i) => (
            <line key={i} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} />
          ))}
        </g>
        <g fill="#9CC7F0" fillOpacity=".5">
          {NODES.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.2" />)}
        </g>
        {LIVE.map((n, i) => (
          <circle key={n} className="cb-pulse" cx={NODES[n][0]} cy={NODES[n][1]} r="3" style={{ animationDelay: `${i * 1.1}s` }} />
        ))}

      </svg>
    </div>
  )
}
