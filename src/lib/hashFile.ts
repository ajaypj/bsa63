import type { Algorithm, HashMessage } from '../workers/hash.worker'
import { formatDateTimeIST } from './time'

export type { Algorithm }

export interface FileHash {
  name: string
  size: number
  type: string
  lastModified: string
  computedAt: string
  hashes: Partial<Record<Algorithm, string>>
}

export interface HashJob {
  promise: Promise<FileHash>
  cancel: () => void
}

export function hashFile(
  file: File,
  algorithms: Algorithm[],
  onProgress: (fraction: number) => void = () => {},
): HashJob {
  const worker = new Worker(new URL('../workers/hash.worker.ts', import.meta.url), { type: 'module' })
  const promise = new Promise<FileHash>((resolve, reject) => {
    worker.onmessage = (e: MessageEvent<HashMessage>) => {
      const msg = e.data
      if (msg.type === 'progress') {
        onProgress(msg.total === 0 ? 1 : msg.loaded / msg.total)
        return
      }
      worker.terminate()
      if (msg.type === 'error') {
        reject(new Error(msg.message))
        return
      }
      resolve({
        name: file.name,
        size: file.size,
        type: file.type || 'unknown',
        lastModified: formatDateTimeIST(new Date(file.lastModified)),
        computedAt: formatDateTimeIST(new Date()),
        hashes: msg.hashes,
      })
    }
    worker.onerror = (e) => {
      worker.terminate()
      reject(new Error(e.message))
    }
    worker.postMessage({ file, algorithms })
  })
  return { promise, cancel: () => worker.terminate() }
}
