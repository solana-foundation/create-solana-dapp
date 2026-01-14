import { describe, expect, it } from 'vitest'
import { VersionCommand } from '../src/utils/get-version-command'
import { getVersionUrls } from '../src/utils/get-version-urls'

describe('getVersionUrls', () => {
  it('should return install url for "adb"', () => {
    const urls = getVersionUrls('adb' as VersionCommand, '')
    expect(urls).toEqual({
      install:
        'https://docs.expo.dev/get-started/set-up-your-environment/?platform=android&device=physical&mode=development-build&buildEnv=local',
      update:
        'https://docs.expo.dev/get-started/set-up-your-environment/?platform=android&device=physical&mode=development-build&buildEnv=local',
    })
  })

  it('should return install and update urls for "anchor" with required version', () => {
    const requiredVersion = 'v0.20.1'
    const urls = getVersionUrls('anchor' as VersionCommand, requiredVersion)
    expect(urls).toEqual({
      install: 'https://www.anchor-lang.com/docs/installation',
      update: `https://www.anchor-lang.com/release-notes/${requiredVersion}`,
    })
  })

  it('should return install url for "solana"', () => {
    const urls = getVersionUrls('solana' as VersionCommand, '')
    expect(urls).toEqual({
      install: 'https://solana.com/docs/intro/installation',
      update: 'https://solana.com/docs/intro/installation',
    })
  })

  it('should return empty object for unknown command', () => {
    const urls = getVersionUrls('unknown' as VersionCommand, '')
    expect(urls).toEqual({})
  })
})
