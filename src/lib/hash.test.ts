import { createSHA256 } from 'hash-wasm'
import { describe, expect, it } from 'vitest'
import { formatDateIST, formatTimeIST } from './time'

const VECTORS = {
  '': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  abc: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
}

describe('sha256 vectors', () => {
  it.each(Object.entries(VECTORS))('matches published value for %j', async (input, want) => {
    expect(await (await createSHA256()).init().update(input).digest('hex')).toBe(want)
  })

  it('handles one million a (chunked)', async () => {
    const h = await createSHA256()
    h.init()
    const chunk = 'a'.repeat(1000)
    for (let i = 0; i < 1000; i++) h.update(chunk)
    expect(h.digest('hex')).toBe('cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0')
  })
})

describe('IST formatting', () => {
  it('formats date and 24h time', () => {
    const d = new Date('2026-01-05T20:05:00Z') // 01:35 IST on 6 Jan
    expect(formatDateIST(d)).toBe('06/01/2026')
    expect(formatTimeIST(d)).toBe('01:35')
  })
})
