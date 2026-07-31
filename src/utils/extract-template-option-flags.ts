import { Command } from 'commander'

const templateOptionPattern = /^--([a-z][a-z0-9-]*)$/

export interface ExtractTemplateOptionFlagsResult {
  readonly argv: string[]
  readonly templateOptions: string[]
}

/**
 * Separates template-defined boolean flags from the arguments Commander knows.
 *
 * Template flags are validated after the selected template has been cloned and
 * its package metadata is available.
 */
export function extractTemplateOptionFlags(command: Command, argv: string[]): ExtractTemplateOptionFlagsResult {
  const knownArgv = argv.slice(0, 2)
  const templateOptions = new Set<string>()
  let preserveNextArgument = false
  let positionalOnly = false

  for (const arg of argv.slice(2)) {
    if (positionalOnly || preserveNextArgument) {
      knownArgv.push(arg)
      preserveNextArgument = false
      continue
    }

    if (arg === '--') {
      positionalOnly = true
      knownArgv.push(arg)
      continue
    }

    const knownOption = findKnownOption(command, arg)
    if (knownOption) {
      knownArgv.push(arg)
      preserveNextArgument = knownOption.required && !hasInlineValue(knownOption.long, knownOption.short, arg)
      continue
    }

    if (!arg.startsWith('-')) {
      knownArgv.push(arg)
      continue
    }

    const match = templateOptionPattern.exec(arg)
    if (!match) {
      throw new Error(`Template options must be boolean long flags such as --ollama; received "${arg}".`)
    }
    templateOptions.add(match[1])
  }

  return {
    argv: knownArgv,
    templateOptions: [...templateOptions],
  }
}

function findKnownOption(command: Command, arg: string) {
  const longFlag = arg.startsWith('--') ? arg.split('=', 1)[0] : undefined
  const shortFlag = arg.startsWith('-') && !arg.startsWith('--') ? arg.slice(0, 2) : undefined
  return command.options.find(
    (option) =>
      (longFlag !== undefined && option.long === longFlag) || (shortFlag !== undefined && option.short === shortFlag),
  )
}

function hasInlineValue(longFlag: string | undefined, shortFlag: string | undefined, arg: string): boolean {
  if (longFlag !== undefined && arg.startsWith('--')) {
    return arg.startsWith(`${longFlag}=`)
  }
  return shortFlag !== undefined && arg.startsWith(shortFlag) && arg !== shortFlag
}
