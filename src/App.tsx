import { useState } from 'react'
import type { FileHash } from './lib/hashFile'
import { CertificateWizard } from './pages/CertificateWizard'
import { HashPage } from './pages/HashPage'

export default function App() {
  const [tab, setTab] = useState<'hash' | 'certificate'>('hash')
  const [results, setResults] = useState<FileHash[]>([])
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-4">
      <h1 className="text-xl font-bold">Section 63 BSA Certificate Generator</h1>
      <nav className="flex gap-2">
        {(['hash', 'certificate'] as const).map((t) => (
          <button key={t} className={`rounded px-3 py-1 ${tab === t ? 'bg-slate-800 text-white' : 'border'}`} onClick={() => setTab(t)}>
            {t === 'hash' ? 'Hash generator' : 'Certificate'}
          </button>
        ))}
      </nav>
      {tab === 'hash' ? <HashPage results={results} setResults={setResults} /> : <CertificateWizard files={results} />}
      <footer className="text-xs text-slate-500">Not legal advice. A practising advocate should review certificates before filing.</footer>
    </main>
  )
}
