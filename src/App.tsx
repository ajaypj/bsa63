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
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="" className="h-11 w-11" />
            <div className="leading-tight">
              <div className="text-xl font-semibold tracking-tight">BSA63</div>
              <div className="text-sm text-slate-500">63BSA (Old 65B) Certificate</div>
            </div>
          </div>
          <span className="hidden rounded-full bg-emerald-50 px-4 py-1.5 text-sm text-emerald-700 sm:inline">100% Private and Secure</span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <nav className="inline-flex rounded-2xl bg-slate-200/70 p-1.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`rounded-xl px-5 py-2 text-base font-medium transition ${tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        {tab === 'hash' ? <HashPage results={results} setResults={setResults} /> : <CertificateWizard files={results} />}
        <footer className="pt-4 text-center text-sm text-slate-500">
          Not legal advice. A practising advocate should review certificates before filing.
        </footer>
      </main>
    </div>
  )
}
