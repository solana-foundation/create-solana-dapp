import * as childProcess from 'node:child_process'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { parseVersion } from '../src/utils/parse-version'

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}))

describe('parseVersion', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should parse version correctly', () => {
    ;(childProcess.execSync as any).mockReturnValue('Version 1.2.3\n')
    const version = parseVersion('some command', /Version (\d+\.\d+\.\d+)/)
    expect(version).toBe('1.2.3')
    expect(childProcess.execSync).toHaveBeenCalledWith('some command', { stdio: ['ignore', 'pipe', 'ignore'] })
  })

  it('should throw error if regex does not match', () => {
    ;(childProcess.execSync as any).mockReturnValue('Invalid output\n')
    expect(() => parseVersion('some command', /Version (\d+\.\d+\.\d+)/)).toThrow(
      'Unable to parse version: Invalid output',
    )
  })
})
