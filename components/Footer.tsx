import { GITHUB, LINKEDIN, EMAIL } from './Contact'

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="wrap flex flex-col gap-4 py-10 text-[14px] text-smoke md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Joseph Allan Kamara</p>
        <ul className="flex gap-8">
          <li><a className="hover:text-snow" href={GITHUB} target="_blank" rel="noopener">GitHub</a></li>
          <li><a className="hover:text-snow" href={LINKEDIN} target="_blank" rel="noopener">LinkedIn</a></li>
          <li><a className="hover:text-snow" href={`mailto:${EMAIL}`}>Email</a></li>
        </ul>
      </div>
    </footer>
  )
}
