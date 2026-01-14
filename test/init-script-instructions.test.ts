import { log } from '@clack/prompts'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { initScriptInstructions } from '../src/utils/init-script-instructions'
import { InitScriptInstructions } from '../src/utils/init-script-schema'

vi.mock('@clack/prompts', () => ({
  log: {
    warn: vi.fn(),
  },
}))
describe('initScriptInstructions', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should log "no instructions found" and return empty array when instructions is undefined and verbose is true', () => {
    const result = initScriptInstructions(undefined, true)
    expect(log.warn).toHaveBeenCalledWith('initScriptInstructions: no instructions found')
    expect(result).toEqual([])
  })

  it('should not log and return empty array when instructions is undefined and verbose is false', () => {
    const result = initScriptInstructions(undefined, false)
    expect(log.warn).not.toHaveBeenCalled()
    expect(result).toEqual([])
  })

  it('should log "no instructions found" and return empty array when instructions is empty and verbose is true', () => {
    const instructions: InitScriptInstructions = []
    const result = initScriptInstructions(instructions, true)
    expect(log.warn).toHaveBeenCalledWith('initScriptInstructions: no instructions found')
    expect(result).toEqual([])
  })

  it('should not log and return empty array when instructions is empty and verbose is false', () => {
    const instructions: InitScriptInstructions = []
    const result = initScriptInstructions(instructions, false)
    expect(log.warn).not.toHaveBeenCalled()
    expect(result).toEqual([])
  })

  it('should log the number of instructions and return the instructions when instructions are provided and verbose is true', () => {
    const instructions: InitScriptInstructions = ['instr1', 'instr2']
    const result = initScriptInstructions(instructions, true)
    expect(log.warn).toHaveBeenCalledWith('initScriptInstructions: 2 instructions found')
    expect(result).toBe(instructions)
  })

  it('should not log and return the instructions when instructions are provided and verbose is false', () => {
    const instructions: InitScriptInstructions = ['instr1', 'instr2']
    const result = initScriptInstructions(instructions, false)
    expect(log.warn).not.toHaveBeenCalled()
    expect(result).toBe(instructions)
  })

  it('should not log and return empty array when instructions is undefined and verbose is not provided', () => {
    const result = initScriptInstructions(undefined)
    expect(log.warn).not.toHaveBeenCalled()
    expect(result).toEqual([])
  })

  it('should not log and return the instructions when instructions are provided and verbose is not provided', () => {
    const instructions: InitScriptInstructions = ['instr1', 'instr2']
    const result = initScriptInstructions(instructions)
    expect(log.warn).not.toHaveBeenCalled()
    expect(result).toBe(instructions)
  })
})
