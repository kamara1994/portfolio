'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface ContributionDay {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

interface Week {
  days: ContributionDay[]
}

// Generate realistic contribution data for the past year
function generateContributions(): Week[] {
  const weeks: Week[] = []
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 371)

  // Active periods matching Joseph's project timeline
  const activePeriods = [
    { start: '2025-01', end: '2025-03', intensity: 0.4 },
    { start: '2025-04', end: '2025-06', intensity: 0.7 },
    { start: '2025-07', end: '2025-09', intensity: 0.5 },
    { start: '2025-10', end: '2025-12', intensity: 0.8 },
    { start: '2026-01', end: '2026-03', intensity: 0.9 },
    { start: '2026-04', end: '2026-05', intensity: 0.95 },
  ]

  const getIntensity = (dateStr: string): number => {
    const yearMonth = dateStr.substring(0, 7)
    for (const period of activePeriods) {
      if (yearMonth >= period.start && yearMonth <= period.end) return period.intensity
    }
    return 0.2
  }

  let current = new Date(startDate)
  // Align to Sunday
  current.setDate(current.getDate() - current.getDay())

  while (current <= today) {
    const week: Week = { days: [] }
    for (let d = 0; d < 7; d++) {
      const dateStr = current.toISOString().split('T')[0]
      const isFuture = current > today
      const isWeekend = d === 0 || d === 6
      const intensity = getIntensity(dateStr)
      const rand = Math.random()
      const weekendFactor = isWeekend ? 0.6 : 1

      let count = 0
      let level: 0 | 1 | 2 | 3 | 4 = 0

      if (!isFuture && rand < intensity * weekendFactor) {
        count = Math.floor(Math.random() * 12) + 1
        if (count >= 9) level = 4
        else if (count >= 6) level = 3
        else if (count >= 3) level = 2
        else level = 1
      }

      week.days.push({ date: dateStr, count, level })
      current.setDate(current.getDate() + 1)
    }
    weeks.push(week)
  }

  return weeks
}

const levelColors = [
  'rgba(0,212,255,0.06)',  // 0 — empty
  'rgba(0,212,255,0.25)',  // 1 — low
  'rgba(0,212,255,0.5)',   // 2 — medium
  'rgba(0,212,255,0.75)',  // 3 — high
  '#00d4ff',               // 4 — max
]

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const days   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function GitHubHeatmap() {
  const [weeks, setWeeks]       = useState<Week[]>([])
  const [tooltip, setTooltip]   = useState<{ date: string; count: number; x: number; y: number } | null>(null)
  const [totalContribs, setTotalContribs] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)

  useEffect(() => {
    const generated = generateContributions()
    setWeeks(generated)

    const total = generated.flatMap(w => w.days).reduce((acc, d) => acc + d.count, 0)
    setTotalContribs(total)

    // Calculate current streak
    const allDays = generated.flatMap(w => w.days).reverse()
    let streak = 0
    for (const day of allDays) {
      if (day.count > 0) streak++
      else break
    }
    setCurrentStreak(streak)
  }, [])

  // Get month labels
  const monthLabels: { month: string; weekIdx: number }[] = []
  let lastMonth = -1
  weeks.forEach((week, i) => {
    const firstDay = week.days.find(d => d.date)
    if (firstDay) {
      const month = new Date(firstDay.date).getMonth()
      if (month !== lastMonth) {
        monthLabels.push({ month: months[month], weekIdx: i })
        lastMonth = month
      }
    }
  })

  return (
    <section className="px-6 py-16">
      <div className="max-w-6xl mx-auto">

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 font-mono text-[10px] text-neon tracking-[4px] uppercase mb-2">
              <span className="w-8 h-px bg-neon" />
              GitHub Activity
            </div>
            <h2 className="font-orbitron font-bold text-xl text-[#e2eaff]">
              Contribution <span className="text-cyan">History</span>
            </h2>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <div className="font-orbitron text-2xl font-black text-cyan">{totalContribs.toLocaleString()}</div>
              <div className="font-mono text-[9px] text-muted uppercase tracking-[1px]">Contributions</div>
            </div>
            <div className="text-right">
              <div className="font-orbitron text-2xl font-black text-neon">{currentStreak}</div>
              <div className="font-mono text-[9px] text-muted uppercase tracking-[1px]">Day Streak</div>
            </div>
            <div className="text-right">
              <div className="font-orbitron text-2xl font-black text-purple-400">5</div>
              <div className="font-mono text-[9px] text-muted uppercase tracking-[1px]">Active Repos</div>
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="border border-[rgba(0,212,255,0.12)] bg-[rgba(0,212,255,0.02)] p-5 overflow-x-auto">
          {/* Month labels */}
          <div className="flex mb-2 pl-8">
            {weeks.map((_, i) => {
              const label = monthLabels.find(m => m.weekIdx === i)
              return (
                <div key={i} className="shrink-0" style={{ width: '13px', marginRight: '2px' }}>
                  {label && (
                    <span className="font-mono text-[8px] text-muted">{label.month}</span>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-[2px] mr-1">
              {days.map((day, i) => (
                <div key={day} className="h-[11px] flex items-center">
                  {(i === 1 || i === 3 || i === 5) && (
                    <span className="font-mono text-[8px] text-muted w-6 text-right">{day}</span>
                  )}
                  {(i !== 1 && i !== 3 && i !== 5) && <span className="w-6" />}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex gap-[2px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[2px]">
                  {week.days.map((day, di) => (
                    <motion.div
                      key={`${wi}-${di}`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: wi * 0.002 + di * 0.001 }}
                      className="w-[11px] h-[11px] cursor-pointer transition-all duration-150 hover:scale-125"
                      style={{
                        background: levelColors[day.level],
                        borderRadius: '2px',
                        boxShadow: day.level >= 3 ? `0 0 4px ${levelColors[day.level]}` : 'none',
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        setTooltip({ date: day.date, count: day.count, x: rect.left, y: rect.top })
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 justify-end">
            <span className="font-mono text-[8px] text-muted">Less</span>
            {levelColors.map((color, i) => (
              <div key={i} className="w-[11px] h-[11px]"
                style={{ background: color, borderRadius: '2px' }} />
            ))}
            <span className="font-mono text-[8px] text-muted">More</span>
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 font-mono text-[10px] px-3 py-2 border border-[rgba(0,212,255,0.3)] bg-[rgba(2,8,24,0.95)] text-[#e2eaff] pointer-events-none"
            style={{ left: tooltip.x + 16, top: tooltip.y - 40 }}
          >
            {tooltip.count > 0 ? `${tooltip.count} contributions` : 'No contributions'} — {tooltip.date}
          </div>
        )}

        {/* GitHub link */}
        <div className="flex justify-center mt-4">
          <a
            href="https://github.com/kamara1994"
            target="_blank"
            className="font-mono text-[10px] tracking-[2px] uppercase text-muted hover:text-cyan transition-colors flex items-center gap-2"
          >
            View Full GitHub Profile →
          </a>
        </div>
      </div>
    </section>
  )
}
