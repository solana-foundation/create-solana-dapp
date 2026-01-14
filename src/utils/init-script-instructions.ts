import { log } from '@clack/prompts'
import { InitScriptInstructions } from './init-script-schema'

export function initScriptInstructions(instructions?: InitScriptInstructions, verbose = false): string[] {
  const tag = `initScriptInstructions`
  if (!instructions || instructions.length === 0) {
    if (verbose) {
      log.warn(`${tag}: no instructions found`)
    }
    return []
  }
  if (verbose) {
    log.warn(`${tag}: ${instructions.length} instructions found`)
  }
  return instructions
}
