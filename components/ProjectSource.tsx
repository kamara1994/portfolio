'use client'
import { useState } from 'react'
import samples from '@/data/project-source-samples.json'
import type { Project } from '@/data/projects'

type Sample = { title: string; description: string; path: string; language: string; start: number; source: string; code: string }
const catalog: Record<string, Sample[]> = samples

// Render source as escaped React text, not executable HTML.
const tokenPattern = /(\/\/.*$|\/\*.*?\*\/|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`|\b(?:async|await|const|let|function|return|export|import|from|if|else|try|catch|finally|new|for|of|interface|type|throw|true|false|null|undefined)\b|\b\d+(?:\.\d+)?\b)/g
function Highlight({ line }: { line: string }) {
  return <>{line.split(tokenPattern).map((part, i) => {
    if (i % 2 === 0) return part
    const color = part.startsWith('/') ? 'text-slate-400' : /^['"`]/.test(part) ? 'text-emerald-300' : /^\d/.test(part) ? 'text-amber-300' : 'text-sky-300'
    return <span key={i} className={color}>{part}</span>
  })}</>
}

export default function ProjectSource({ project }: { project: Project }) {
  const available = catalog[project.id] ?? []
  const [index, setIndex] = useState(0)
  const [copyStatus, setCopyStatus] = useState('')
  const selected = available[index]
  async function copyCode() {
    if (!selected) return
    try {
      await navigator.clipboard.writeText(selected.code)
      setCopyStatus('Copied')
    } catch {
      setCopyStatus('Select the code to copy manually.')
    }
  }
  return (
    <section id="source-code" aria-label="Source code" className="scroll-mt-28 min-w-0 space-y-5">
      <h2 className="font-display text-[32px] font-bold uppercase leading-none">Source code</h2>
      <p className="text-[16px] leading-relaxed text-smoke">
        {selected ? 'Selected, verified excerpts from the original project files. These are samples, not the complete application.' : project.sourceAccess === 'private' ? 'The repository is private. Public code excerpts have not been approved for release.' : 'Source files have not been verified for public display. The case study documents the implementation.'}
      </p>
      {selected && (
        <div className="min-w-0 overflow-hidden rounded-lg border border-line bg-[#10151e]">
          <div className="flex flex-wrap gap-2 border-b border-line p-3" aria-label="Choose source file">
            {available.map((sample, i) => (
              <button key={sample.source} type="button" aria-pressed={i === index} onClick={() => { setIndex(i); setCopyStatus('') }} className={`rounded border px-3 py-2 text-sm ${i === index ? 'border-signal text-signal' : 'border-line text-smoke hover:text-snow'}`}>{sample.title}</button>
            ))}
          </div>
          <div className="space-y-2 border-b border-line p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="break-all font-mono text-xs text-slate-300">{selected.path}</span>
              <button type="button" className="rounded border border-line px-3 py-2 text-sm text-snow hover:text-signal" onClick={copyCode}>Copy code</button>
            </div>
            <p className="text-sm text-smoke">{selected.description}</p>
            <span aria-live="polite" className="text-sm text-signal">{copyStatus}</span>
          </div>
          <pre tabIndex={0} aria-label={selected.title + ' source code'} className="max-h-[440px] overflow-auto p-4 text-[13px] leading-6 text-slate-200"><code className="block w-max min-w-full">{selected.code.split('\n').map((line, i) => <span key={i} className="block"><span aria-hidden="true" className="mr-4 inline-block w-8 select-none text-right text-slate-500">{selected.start + i}</span><Highlight line={line} />{'\n'}</span>)}</code></pre>
          <div className="border-t border-line p-4">
            <a href={selected.source} target="_blank" rel="noopener noreferrer" className="text-sm text-signal hover:underline">View original file on GitHub</a>
          </div>
        </div>
      )}
      {project.github && <a href={project.github} target="_blank" rel="noopener noreferrer" className="btn-ghost inline-flex">Full GitHub repository</a>}
    </section>
  )
}
