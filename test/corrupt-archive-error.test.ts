import { homedir, tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  corruptArchiveMessage,
  isCorruptArchiveError,
  templateCacheDirectory,
} from '../src/utils/corrupt-archive-error'

describe('isCorruptArchiveError', () => {
  it('detects the zlib error tar throws for a truncated tarball', () => {
    // The exact shape reported in #256.
    const error = Object.assign(new Error('zlib: unexpected end of file'), { name: 'ZlibError' })
    expect(isCorruptArchiveError(error)).toBe(true)
  })

  it('detects tar and zlib error codes', () => {
    expect(isCorruptArchiveError(Object.assign(new Error('bad archive'), { code: 'TAR_BAD_ARCHIVE' }))).toBe(true)
    expect(isCorruptArchiveError(Object.assign(new Error('buffer error'), { code: 'Z_BUF_ERROR' }))).toBe(true)
    expect(isCorruptArchiveError(Object.assign(new Error('data error'), { code: 'Z_DATA_ERROR' }))).toBe(true)
  })

  it('detects a non-gzip payload', () => {
    expect(isCorruptArchiveError(new Error('not a gzip file'))).toBe(true)
  })

  it('ignores unrelated failures', () => {
    expect(isCorruptArchiveError(new Error('Destination /tmp/app already exists.'))).toBe(false)
    expect(isCorruptArchiveError(Object.assign(new Error('offline'), { code: 'ENOTFOUND' }))).toBe(false)
    expect(isCorruptArchiveError(undefined)).toBe(false)
  })
})

describe('templateCacheDirectory', () => {
  const platform = process.platform
  const xdgCacheHome = process.env.XDG_CACHE_HOME

  afterEach(() => {
    Object.defineProperty(process, 'platform', { value: platform })
    if (xdgCacheHome === undefined) {
      delete process.env.XDG_CACHE_HOME
    } else {
      process.env.XDG_CACHE_HOME = xdgCacheHome
    }
    vi.unstubAllEnvs()
  })

  it('uses the temp directory on Windows, matching giget', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' })
    expect(templateCacheDirectory()).toBe(resolve(tmpdir(), 'giget'))
  })

  it('honours XDG_CACHE_HOME elsewhere', () => {
    Object.defineProperty(process, 'platform', { value: 'linux' })
    process.env.XDG_CACHE_HOME = '/custom/cache'
    expect(templateCacheDirectory()).toBe(resolve('/custom/cache', 'giget'))
  })

  it('falls back to the home cache directory', () => {
    Object.defineProperty(process, 'platform', { value: 'linux' })
    delete process.env.XDG_CACHE_HOME
    expect(templateCacheDirectory()).toBe(resolve(homedir(), '.cache/giget'))
  })
})

describe('corruptArchiveMessage', () => {
  it('names the template and the directory to clear', () => {
    const message = corruptArchiveMessage('gh:solana-foundation/templates/nextjs-anchor')
    expect(message).toContain('gh:solana-foundation/templates/nextjs-anchor')
    expect(message).toContain(templateCacheDirectory())
  })
})
