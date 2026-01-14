import { log } from '@clack/prompts'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getVersion } from '../src/utils/get-version'
import { getVersionUrls } from '../src/utils/get-version-urls'
import { initScriptVersionCheck } from '../src/utils/init-script-version-check'
import { validateVersion } from '../src/utils/validate-version'

vi.mock('../src/utils/get-version')
vi.mock('../src/utils/validate-version')
vi.mock('../src/utils/get-version-urls')
vi.mock('@clack/prompts', () => ({
  log: {
    warn: vi.fn(),
  },
}))

describe('initScriptVersionCheck', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const versionCommand = 'adb'

  it('should return early if no required version is provided', async () => {
    await initScriptVersionCheck(versionCommand)
    expect(getVersion).not.toHaveBeenCalled()
    expect(validateVersion).not.toHaveBeenCalled()
    expect(log.warn).not.toHaveBeenCalled()
  })

  it('should log warning if adb version is not found', async () => {
    const required = '1.0.0'
    const installMock = 'Install URL'
    vi.mocked(getVersion).mockReturnValue(undefined)
    vi.mocked(validateVersion).mockReturnValue({ valid: false, version: undefined })
    vi.mocked(getVersionUrls).mockReturnValue({ install: installMock, update: undefined })
    await initScriptVersionCheck(versionCommand, required)
    expect(getVersion).toHaveBeenCalledWith(versionCommand)
    expect(validateVersion).toHaveBeenCalledWith({ required, version: undefined })
    expect(log.warn).toHaveBeenCalledWith(expect.stringContaining('Could not find adb version'))
    expect(log.warn).toHaveBeenCalledWith(expect.stringContaining(installMock))
  })

  it('should log warning if adb version does not satisfy the requirement', async () => {
    const required = '1.0.0'
    const version = '0.9.0'
    const updateMock = 'Update URL'
    vi.mocked(getVersion).mockReturnValue(version)
    vi.mocked(validateVersion).mockReturnValue({ valid: false, version })
    vi.mocked(getVersionUrls).mockReturnValue({ install: undefined, update: updateMock })
    await initScriptVersionCheck(versionCommand, required)
    expect(getVersion).toHaveBeenCalledWith(versionCommand)
    expect(validateVersion).toHaveBeenCalledWith({ required, version })
    expect(log.warn).toHaveBeenCalledWith(expect.stringContaining(`Found adb version ${version}`))
    expect(log.warn).toHaveBeenCalledWith(expect.stringContaining(updateMock))
  })

  it('should not log warning if adb version satisfies the requirement', async () => {
    const required = '1.0.0'
    const version = '1.0.0'
    vi.mocked(getVersion).mockReturnValue(version)
    vi.mocked(validateVersion).mockReturnValue({ valid: true, version })
    await initScriptVersionCheck(versionCommand, required)
    expect(getVersion).toHaveBeenCalledWith(versionCommand)
    expect(validateVersion).toHaveBeenCalledWith({ required, version })
    expect(log.warn).not.toHaveBeenCalled()
  })

  it('should log verbose message if verbose is true', async () => {
    const required = '1.0.0'
    const version = '1.0.0'
    vi.mocked(getVersion).mockReturnValue(version)
    vi.mocked(validateVersion).mockReturnValue({ valid: true, version })
    await initScriptVersionCheck(versionCommand, required, true)
    expect(getVersion).toHaveBeenCalledWith(versionCommand)
    expect(validateVersion).toHaveBeenCalledWith({ required, version })
    expect(log.warn).toHaveBeenCalledWith(
      `initScriptVersionCheck: required: ${required}, version: ${version}, valid: true`,
    )
  })

  it('should log error if an exception occurs', async () => {
    const required = '1.0.0'
    const error = new Error('Test error')
    vi.mocked(getVersion).mockImplementation(() => {
      throw error
    })
    await initScriptVersionCheck(versionCommand, required)
    expect(log.warn).toHaveBeenCalledWith(`Error ${error}`)
  })
})
