import { describe, expect, it } from 'vitest'
import { getVersionCommand, getVersionCommandNames } from '../src/utils/get-version-command'

describe('getVersionCommand', () => {
  it('should have the expected commands names', () => {
    expect(getVersionCommandNames()).toEqual(['adb', 'anchor', 'avm', 'rust', 'solana'])
  })

  it('should have correct structure for each command', () => {
    for (const name of getVersionCommandNames()) {
      const cmd = getVersionCommand(name)
      expect(cmd).toHaveProperty('command', expect.any(String))
      expect(cmd).toHaveProperty('name', expect.any(String))
      expect(cmd).toHaveProperty('regex', expect.any(RegExp))
    }
  })
})
