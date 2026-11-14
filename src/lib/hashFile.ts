import type { HashMessage } from '../workers/hash.worker'
import { formatDateTimeIST } from './time'

export interface FileHash {
  name: string
  size: number
  type: string
  lastModified: string
  computedAt: string
  sha256: string
}

export interface HashJob {
  promise: Promise<FileHash>
  cancel: () => void
}

export function hashFile(file: File, onProgress: (fraction: number) => void = () => {}): HashJob {
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
        sha256: msg.sha256,
      })
    }
    worker.onerror = (e) => {
      worker.terminate()
      reject(new Error(e.message))
    }
    worker.postMessage({ file })
  })
  return { promise, cancel: () => worker.terminate() }
}
