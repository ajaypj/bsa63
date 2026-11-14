import { createMD5, createSHA1, createSHA256 } from 'hash-wasm'
import { describe, expect, it } from 'vitest'
import { formatDateIST, formatTimeIST } from './time'

const VECTORS = {
  '': {
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    sha1: 'da39a3ee5e6b4b0d3255bfef95601890afd80709',
    md5: 'd41d8cd98f00b204e9800998ecf8427e',
  },
  abc: {
    sha256: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    sha1: 'a9993e364706816aba3e25717850c26c9cd0d89d',
    md5: '900150983cd24fb0d6963f7d28e17f72',
  },
}

describe('hash vectors', () => {
  it.each(Object.entries(VECTORS))('matches published values for %j', async (input, want) => {
    expect(await (await createSHA256()).init().update(input).digest('hex')).toBe(want.sha256)
    expect(await (await createSHA1()).init().update(input).digest('hex')).toBe(want.sha1)
    expect(await (await createMD5()).init().update(input).digest('hex')).toBe(want.md5)
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
