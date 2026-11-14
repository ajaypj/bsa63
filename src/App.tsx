import { useState } from 'react'
import type { FileHash } from './lib/hashFile'
import { CertificateWizard } from './pages/CertificateWizard'
import { HashPage } from './pages/HashPage'

const TABS = [
  { id: 'hash', label: 'Generate Hash' },
  { id: 'certificate', label: 'Certificate' },
] as const

export default function App() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('hash')
  const [results, setResults] = useState<FileHash[]>([])
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="" className="h-8 w-8" />
            <div className="leading-tight">
              <div className="font-semibold tracking-tight">BSA63</div>
              <div className="text-xs text-slate-500">63 BSA (Old 65B) Certificate</div>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">Files never leave your device</span>
        </div>
      </header>
      <main className="mx-auto max-w-2xl space-y-5 px-4 py-6">
        <nav className="inline-flex rounded-xl bg-slate-200/70 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        {tab === 'hash' ? <HashPage results={results} setResults={setResults} /> : <CertificateWizard files={results} />}
        <footer className="pt-4 text-center text-xs text-slate-500">
          Not legal advice. A practising advocate should review certificates before filing.
        </footer>
      </main>
    </div>
  )
}
