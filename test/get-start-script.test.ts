import { describe, expect, it } from 'vitest'
import { getStartScript } from '../src/utils/get-start-script'

describe('getStartScript', () => {
  it('returns "dev" when scripts has a dev key', () => {
    const result = getStartScript({ dev: 'vite', start: 'node server.js' })
    expect(result).toBe('dev')
  })

  it('returns "start" when scripts has no dev but has start', () => {
    const result = getStartScript({ start: 'node server.js' })
    expect(result).toBe('start')
  })

  it('returns undefined when scripts is undefined', () => {
    const result = getStartScript(undefined)
    expect(result).toBeUndefined()
  })

  it('returns undefined when scripts has neither dev or start', () => {
    const result = getStartScript({ build: 'tsc' })
    expect(result).toBeUndefined()
  })
})
