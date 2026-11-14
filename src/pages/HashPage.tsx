import { useRef, useState } from 'react'
import { FileDrop } from '../components/FileDrop'
import { HashResult } from '../components/HashResult'
import { download } from '../lib/download'
import { hashFile, type Algorithm, type FileHash, type HashJob } from '../lib/hashFile'
import { buildHashReportPdf, hashReportCsv, hashReportJson } from '../lib/hashReport'

const OPTIONAL_ALGORITHMS: Algorithm[] = ['sha1', 'md5']

interface Props {
  results: FileHash[]
  setResults: (r: FileHash[]) => void
}

export function HashPage({ results, setResults }: Props) {
  const [optional, setOptional] = useState<Algorithm[]>([])
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [expected, setExpected] = useState('')
  const job = useRef<HashJob | null>(null)

  async function run(files: File[]) {
    const algorithms: Algorithm[] = ['sha256', ...optional]
    setError('')
    const out: FileHash[] = []
    try {
      for (const file of files) {
        setProgress(0)
        job.current = hashFile(file, algorithms, setProgress)
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

  return (
    <div className="space-y-4">
      <p className="rounded bg-emerald-50 p-2 text-sm">Files are processed on your device and never uploaded.</p>
      <div className="flex gap-4 text-sm">
        <span>SHA-256 (always)</span>
        {OPTIONAL_ALGORITHMS.map((a) => (
          <label key={a}>
            <input
              type="checkbox"
              checked={optional.includes(a)}
              onChange={(e) => setOptional(e.target.checked ? [...optional, a] : optional.filter((x) => x !== a))}
            />{' '}
            {a.toUpperCase()}
          </label>
        ))}
      </div>
      <FileDrop onFiles={run} />
      {progress !== null && (
        <div className="flex items-center gap-2">
          <progress className="flex-1" value={progress} max={1} />
          <button className="rounded border px-2" onClick={cancel}>
            Cancel
          </button>
        </div>
      )}
      {error && <p className="text-red-700">{error}</p>}
      <input
        className="w-full rounded border p-2 text-sm"
        placeholder="Verify: paste expected hash"
        value={expected}
        onChange={(e) => setExpected(e.target.value)}
      />
      <HashResult results={results} expected={expected} />
      {results.length > 0 && (
        <div className="flex flex-wrap gap-2 text-sm">
          <button
            className="rounded bg-slate-800 px-3 py-1 text-white"
            onClick={async () => download(await buildHashReportPdf(results), 'hash-report.pdf', 'application/pdf')}
          >
            Hash report PDF
          </button>
          <button className="rounded border px-3 py-1" onClick={() => download(hashReportCsv(results), 'hash-report.csv', 'text/csv')}>
            CSV
          </button>
          <button className="rounded border px-3 py-1" onClick={() => download(hashReportJson(results), 'hash-report.json', 'application/json')}>
            JSON
          </button>
          <button className="rounded border px-3 py-1" onClick={() => setResults([])}>
            Clear
          </button>
        </div>
      )}
    </div>
  )
}
