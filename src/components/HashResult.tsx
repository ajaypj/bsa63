import type { FileHash } from '../lib/hashFile'
import { useToast } from './Toast'

export function HashResult({ results, onRemove }: { results: FileHash[]; onRemove: (index: number) => void }) {
  const { show, toast } = useToast()

  async function copy(hash: string) {
    try {
      await navigator.clipboard.writeText(hash)
      show('Copied to clipboard')
    } catch {
      show('Copy failed — select the hash and copy manually')
    }
  }

  return (
    <div className="space-y-3">
      {results.map((r, i) => (
        <div key={`${r.name}-${r.computedAt}-${i}`} className="card">
          <div className="text-lg font-semibold break-all">{r.name}</div>
          <code className="mt-2 block rounded-xl bg-slate-50 p-4 font-mono text-sm break-all text-slate-700">
            {r.sha256}
          </code>
          <div className="mt-3 flex gap-2">
            <button className="btn-ghost" onClick={() => copy(r.sha256)}>
              Copy
            </button>
            <button className="btn-ghost text-red-700" onClick={() => onRemove(i)}>
              Remove
            </button>
          </div>
        </div>
      ))}
      {toast}
    </div>
  )
}
