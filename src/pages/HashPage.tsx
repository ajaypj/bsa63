import { useRef, useState } from 'react'
import { FileDrop } from '../components/FileDrop'
import { HashResult } from '../components/HashResult'
import { download } from '../lib/download'
import { hashFile, type FileHash, type HashJob } from '../lib/hashFile'
import { buildHashReportPdf } from '../lib/hashReport'

interface Props {
  results: FileHash[]
  setResults: (r: FileHash[]) => void
}

export function HashPage({ results, setResults }: Props) {
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [expected, setExpected] = useState('')
  const [verdict, setVerdict] = useState<{ ok: boolean; text: string } | null>(null)
  const job = useRef<HashJob | null>(null)

  async function run(files: File[]) {
    setError('')
    setVerdict(null)
    const out: FileHash[] = []
    try {
      for (const file of files) {
        setProgress(0)
        job.current = hashFile(file, setProgress)
        out.push(await job.current.promise)
      }
      setResults([...results, ...out])
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      job.current = null
      setProgress(null)
    }
  }

  function cancel() {
    job.current?.cancel()
    setError('Cancelled')
    setProgress(null)
  }

  /** Replace the list after a removal; reset the verify box once no files remain. */
  function update(next: FileHash[]) {
    setResults(next)
    setVerdict(null)
    if (next.length === 0) setExpected('')
  }

  function verify() {
    const wanted = expected.trim().toLowerCase()
    const hit = results.find((r) => r.sha256 === wanted)
    setVerdict(hit ? { ok: true, text: `Match: ${hit.name}` } : { ok: false, text: 'No match with any hashed file' })
  }

  return (
    <div className="space-y-5">
      <FileDrop onFiles={run} />
      {progress !== null && (
        <div className="card flex items-center gap-3">
          <progress className="h-2 flex-1 accent-brand-600" value={progress} max={1} />
          <button className="btn-ghost" onClick={cancel}>
            Cancel
          </button>
        </div>
      )}
      {error && <p className="text-sm text-red-700">{error}</p>}
      <HashResult
        results={results}
        onRemove={(i) => update(results.filter((_, idx) => idx !== i))}
      />
      {results.length > 0 && (
        <>
          <div className="card space-y-3">
            <div className="text-lg font-semibold">Verify hash</div>
            <input
              className="field font-mono"
              placeholder="Paste the expected SHA-256 hash"
              value={expected}
              onChange={(e) => {
                setExpected(e.target.value)
                setVerdict(null)
              }}
            />
            <button className="btn-primary" disabled={!expected.trim()} onClick={verify}>
              Verify
            </button>
            {verdict && <p className={`text-base font-medium ${verdict.ok ? 'text-emerald-700' : 'text-red-700'}`}>{verdict.text}</p>}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="btn-primary"
              onClick={async () => download(await buildHashReportPdf(results), 'hash-report.pdf', 'application/pdf')}
            >
              Download Report
            </button>
            <button className="btn-ghost" onClick={() => update([])}>
              Clear
            </button>
          </div>
        </>
      )}
    </div>
  )
}
