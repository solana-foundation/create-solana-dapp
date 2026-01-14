import { log } from '@clack/prompts'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { initScriptVersion } from '../src/utils/init-script-version'
import { initScriptVersionCheck } from '../src/utils/init-script-version-check'

vi.mock('../src/utils/init-script-version-check')
vi.mock('@clack/prompts', () => ({
  log: {
    warn: vi.fn(),
  },
}))

describe('initScriptVersion', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return early if no versions are provided', async () => {
    await initScriptVersion(undefined)
    expect(initScriptVersionCheck).not.toHaveBeenCalled()
    expect(initScriptVersionCheck).not.toHaveBeenCalled()
    expect(initScriptVersionCheck).not.toHaveBeenCalled()
    expect(log.warn).not.toHaveBeenCalled()
  })

  it('should call initScriptVersionCheck with provided versions', async () => {
    const versions = {
      adb: '1.0.0',
      anchor: '2.0.0',
      solana: '3.0.0',
    }
    await initScriptVersion(versions)
    expect(initScriptVersionCheck).toHaveBeenCalledWith('adb', versions.adb, false)
    expect(initScriptVersionCheck).toHaveBeenCalledWith('anchor', versions.anchor, false)
    expect(initScriptVersionCheck).toHaveBeenCalledWith('solana', versions.solana, false)
  })

  it('should log verbose message if verbose is true with no versions', async () => {
    const tag = 'initScriptVersion'
    await initScriptVersion(undefined, true)
    expect(log.warn).toHaveBeenCalledWith(`${tag}: no versions found`)
  })

  it('should log verbose message if verbose is true after version checks', async () => {
    const versions = {
      adb: '1.0.0',
      anchor: '2.0.0',
      solana: '3.0.0',
    }
    const tag = 'initScriptVersion'
    await initScriptVersion(versions, true)
    expect(initScriptVersionCheck).toHaveBeenCalledWith('adb', versions.adb, true)
    expect(initScriptVersionCheck).toHaveBeenCalledWith('anchor', versions.anchor, true)
    expect(initScriptVersionCheck).toHaveBeenCalledWith('solana', versions.solana, true)
    expect(log.warn).toHaveBeenCalledWith(`${tag}: done`)
  })
})
