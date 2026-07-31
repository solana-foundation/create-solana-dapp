import { Command } from 'commander'

const templateOptionPattern = /^--([a-z][a-z0-9-]*)$/

export interface ExtractTemplateOptionFlagsResult {
  argv: string[]
  templateOptions: string[]
}

/**
 * Separates template-defined boolean flags from the arguments Commander knows.
 *
 * Template flags are validated after the selected template has been cloned and
 * its package metadata is available.
 */
export function extractTemplateOptionFlags(command: Command, argv: string[]): ExtractTemplateOptionFlagsResult {
  const unknown = command.parseOptions(argv.slice(2)).unknown
  if (unknown.length === 0) {
    return { argv, templateOptions: [] }
  }

  const templateOptions = unknown.map((arg) => {
    const match = templateOptionPattern.exec(arg)
    if (!match) {
      throw new Error(`Template options must be boolean long flags such as --ollama; received "${arg}".`)
    }
    return match[1]
  })

  const remainingUnknown = new Map<string, number>()
  for (const arg of unknown) {
    remainingUnknown.set(arg, (remainingUnknown.get(arg) ?? 0) + 1)
  }

  const knownArgv = argv.filter((arg, index) => {
    if (index < 2) {
      return true
    }
    const count = remainingUnknown.get(arg) ?? 0
    if (count === 0) {
      return true
    }
    remainingUnknown.set(arg, count - 1)
    return false
  })

  return {
    argv: knownArgv,
    templateOptions: [...new Set(templateOptions)],
  }
}
