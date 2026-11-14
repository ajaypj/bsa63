import { createSHA256 } from 'hash-wasm'

export type HashMessage =
  | { type: 'progress'; loaded: number; total: number }
  | { type: 'done'; sha256: string }
  | { type: 'error'; message: string }

const CHUNK_SIZE = 8 * 1024 * 1024

self.onmessage = async (e: MessageEvent<{ file: File }>) => {
  const { file } = e.data
  try {
    const hasher = await createSHA256()
    hasher.init()
    for (let offset = 0; offset < file.size; offset += CHUNK_SIZE) {
      hasher.update(new Uint8Array(await file.slice(offset, offset + CHUNK_SIZE).arrayBuffer()))
      self.postMessage({ type: 'progress', loaded: Math.min(offset + CHUNK_SIZE, file.size), total: file.size } satisfies HashMessage)
    }
    self.postMessage({ type: 'done', sha256: hasher.digest('hex') } satisfies HashMessage)
  } catch (err) {
    self.postMessage({ type: 'error', message: err instanceof Error ? err.message : String(err) } satisfies HashMessage)
  }
}
