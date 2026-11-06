const MILESTONES: { when: string; title: string; note: string; next?: boolean }[] = [
  { when: 'Origin', title: 'Freetown, Sierra Leone', note: 'Where it started' },
  { when: 'Sep 2023', title: 'BYU-Idaho', note: 'Started the B.S. in Cybersecurity' },
  { when: 'Mar 2025', title: 'CompTIA Security+', note: 'First security certification' },
  { when: 'Earned', title: 'Cisco CCNA', note: 'Routing, switching, VLANs, network security' },
  { when: 'Mar 2026', title: 'PenTest+ and TCM PSAA', note: 'Offense and SOC operations' },
  { when: '2026', title: 'BLUE SOC, FORTRESS, BLUE-X, PWEZA', note: 'Security and AI systems built' },
  { when: 'Dec 2026', title: 'B.S. Cybersecurity', note: 'Graduating from BYU-Idaho', next: true },
]

export default function Story() {
  return (
    <section id="story" className="wrap pb-16 pt-24 md:pb-20 md:pt-32">
      <div className="hud-frame grid gap-14 p-6 sm:p-10 md:p-14 lg:grid-cols-12 lg:gap-12">
        <span aria-hidden className="hud-corner tl" /><span aria-hidden className="hud-corner tr" />
        <span aria-hidden className="hud-corner bl" /><span aria-hidden className="hud-corner br" />

        <div className="lg:col-span-6">
          <p className="text-[clamp(18px,1.4vw,22px)] font-medium text-signal">My story</p>
          <h2 className="mt-3 font-display text-[clamp(38px,4.4vw,68px)] font-bold uppercase leading-[0.95]">
            Protecting systems means protecting <span className="title-accent">people</span>.
          </h2>
          <div className="mt-8 max-w-[56ch] space-y-5 text-[17px] leading-[1.75] text-snow/80">
            <p>
              I grew up in Freetown, Sierra Leone, where I saw how much everyday life depends on infrastructure that
              works. That is what pulled me into security: not compliance checkboxes, but keeping real systems running
              for real people.
            </p>
            <p>
              Today I am finishing my B.S. in Cybersecurity at BYU-Idaho and building the work to back it up: an
              AI-assisted SOC pipeline, an AWS security lab deployed with Terraform, and a PyTorch threat classifier.
              I use AI where it cuts analyst toil, and I keep a human approving every containment decision.
            </p>
          </div>
        </div>

        <ol className="journey lg:col-span-5 lg:col-start-8" aria-label="My journey">
          {MILESTONES.map((m) => (
            <li key={m.title} className={`journey-item ${m.next ? 'is-next' : ''}`}>
              <span aria-hidden className="journey-dot" />
              <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#6FD6FF]">{m.when}</p>
              <p className="mt-1 text-[18px] font-semibold leading-snug text-snow">{m.title}</p>
              <p className="mt-0.5 text-[15px] text-smoke">{m.note}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
