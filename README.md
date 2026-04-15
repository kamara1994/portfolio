# 🔐 Joseph Allan Kamara — Portfolio Site

> Built with Next.js 14, Tailwind CSS, TypeScript, and Framer Motion
> Deep navy · Neon cyan · Mission-control aesthetic

---

## 🚀 Quick Start (Deploy in 5 minutes)

### 1. Install dependencies
```bash
npm install
```

### 2. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 3. Deploy to Vercel (Free)
```bash
npm install -g vercel
vercel
```
Or just drag the folder to [vercel.com](https://vercel.com) — it auto-detects Next.js.

---

## 📁 Folder Structure

```
portfolio/
├── app/
│   ├── layout.tsx        ← Root layout + custom cursor
│   ├── page.tsx          ← Main page (assembles all sections)
│   └── globals.css       ← All custom styles + effects
├── components/
│   ├── Nav.tsx           ← Sticky navigation
│   ├── Hero.tsx          ← Hero + matrix rain + typewriter + terminal
│   ├── Projects.tsx      ← 3D tilt project cards
│   ├── Skills.tsx        ← Skills grid
│   ├── Certs.tsx         ← Certifications with earned/in-progress badges
│   ├── Experience.tsx    ← Work history timeline
│   ├── About.tsx         ← Bio + stats sidebar
│   ├── Contact.tsx       ← Contact links + terminal email display
│   ├── Footer.tsx        ← Footer
│   └── ui/
│       ├── GlowOrbs.tsx  ← Animated background orbs + scan line
│       └── SectionHeader.tsx ← Reusable section headers
├── data/
│   ├── projects.ts       ← ✏️ EDIT YOUR PROJECTS HERE
│   └── index.ts          ← ✏️ EDIT SKILLS, CERTS, EXPERIENCE HERE
└── public/
    ├── profile/          ← 📸 DROP YOUR PHOTO HERE (joseph.jpg)
    ├── resume/           ← 📄 DROP YOUR RESUME PDF HERE
    ├── screenshots/      ← 🖼️ DROP PROJECT SCREENSHOTS HERE
    └── images/           ← 🖼️ OTHER IMAGES (badges, logos)
```

---

## ✏️ How to Customize

### Add your profile photo
→ Drop `joseph.jpg` into `/public/profile/`

### Add your resume
→ Drop `Joseph_Allan_Kamara_Resume.pdf` into `/public/resume/`

### Add project screenshots
→ Drop PNG files into `/public/screenshots/` (see README inside)

### Edit projects
→ Open `data/projects.ts` — all projects are defined here as objects

### Edit skills / certs / experience
→ Open `data/index.ts`

### Change your GitHub URL
→ Search the project for `joseph-allan-kamara` and replace with your actual GitHub username

### Change the ELITECOM live site URL
→ Open `data/projects.ts` and update the `demo` field for the elitecom project

---

## 🎨 Design System

| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#020818` | Page background |
| `--cyan` | `#00d4ff` | Primary accent |
| `--neon` | `#00f5d4` | Neon green-teal |
| `--purple` | `#818cf8` | Secondary accent |
| `--muted` | `#8899bb` | Body text |
| Font display | Orbitron | Headings |
| Font mono | Share Tech Mono | Code / labels |
| Font body | Outfit | Paragraphs |

---

## 🌐 After Deploying

1. Go to your Vercel dashboard → Settings → Domains
2. Add a custom domain like `josephkamara.dev` (cheap on Namecheap)
3. Add the live URL to every job application under "Websites"
4. Add it to your LinkedIn profile URL section
5. Add it to your resume header

---

## 📌 Content to Add Later
- [ ] Project screenshots (see `/public/screenshots/README.md`)
- [ ] Profile photo (see `/public/profile/README.md`)
- [ ] Resume PDF (see `/public/resume/README.md`)
- [ ] Real GitHub links for each project
- [ ] ELITECOM live site URL
- [ ] Credly badge images (optional)
