import type { FileHash } from '../lib/hashFile'

interface Props {
  results: FileHash[]
  expected: string
}

function CopyButton({ value }: { value: string }) {
  return (
    <button className="ml-2 rounded border px-1 text-xs" onClick={() => navigator.clipboard.writeText(value)}>
      Copy
    </button>
  )
}

export function HashResult({ results, expected }: Props) {
  const wanted = expected.trim().toLowerCase()
  return (
    <div className="space-y-4">
      {results.map((r) => (
        <div key={`${r.name}-${r.computedAt}`} className="rounded border p-3">
          <div className="font-semibold break-all">{r.name}</div>
          <div className="text-sm text-slate-600">
            {r.size} bytes · {r.type} · modified {r.lastModified} · hashed {r.computedAt}
          </div>
          {Object.entries(r.hashes).map(([algo, hash = '']) => (
            <div key={algo} className="mt-1 text-sm">
              <span className="font-medium">{algo.toUpperCase()}</span>{' '}
              <code className="break-all">{hash}</code>
              <CopyButton value={hash} />
              {wanted && <span className="ml-2">{hash === wanted ? '✅ match' : '❌ no match'}</span>}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
