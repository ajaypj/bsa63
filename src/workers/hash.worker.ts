import { createMD5, createSHA1, createSHA256 } from 'hash-wasm'

export type Algorithm = 'sha256' | 'sha1' | 'md5'

export interface HashRequest {
  file: File
  algorithms: Algorithm[]
}

export type HashMessage =
  | { type: 'progress'; loaded: number; total: number }
  | { type: 'done'; hashes: Record<string, string> }
  | { type: 'error'; message: string }

const CHUNK_SIZE = 8 * 1024 * 1024

const factories = { sha256: createSHA256, sha1: createSHA1, md5: createMD5 }

self.onmessage = async (e: MessageEvent<HashRequest>) => {
  const { file, algorithms } = e.data
  try {
    const hashers = await Promise.all(algorithms.map((a) => factories[a]()))
    hashers.forEach((h) => h.init())
    for (let offset = 0; offset < file.size; offset += CHUNK_SIZE) {
      const chunk = new Uint8Array(await file.slice(offset, offset + CHUNK_SIZE).arrayBuffer())
      hashers.forEach((h) => h.update(chunk))
      self.postMessage({ type: 'progress', loaded: Math.min(offset + CHUNK_SIZE, file.size), total: file.size } satisfies HashMessage)
    }
    const hashes = Object.fromEntries(algorithms.map((a, i) => [a, hashers[i].digest('hex')]))
    self.postMessage({ type: 'done', hashes } satisfies HashMessage)
  } catch (err) {
    self.postMessage({ type: 'error', message: err instanceof Error ? err.message : String(err) } satisfies HashMessage)
  }
}
