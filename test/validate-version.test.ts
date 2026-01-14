import { describe, expect, it } from 'vitest'
import { validateVersion } from '../src/utils/validate-version'

describe('validateVersion', () => {
  it('should return valid true when version equals required', () => {
    const result = validateVersion({ required: '1.0.0', version: '1.0.0' })
    expect(result).toEqual({ valid: true, version: '1.0.0' })
  })

  it('should return valid true when version is greater than required', () => {
    const result = validateVersion({ required: '1.0.0', version: '1.1.0' })
    expect(result).toEqual({ valid: true, version: '1.1.0' })
  })

  it('should return valid false when version is less than required', () => {
    const result = validateVersion({ required: '1.0.0', version: '0.9.0' })
    expect(result).toEqual({ valid: false, version: '0.9.0' })
  })

  it('should return valid false when version is undefined', () => {
    const result = validateVersion({ required: '1.0.0', version: undefined })
    expect(result).toEqual({ valid: false, version: undefined })
  })

  it('should return valid false when version is invalid', () => {
    const result = validateVersion({ required: '1.0.0', version: 'invalid' })
    expect(result).toEqual({ valid: false, version: 'invalid' })
  })
})
