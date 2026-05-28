import { log } from '@clack/prompts'
import { join } from 'node:path'
import { ensureTargetPath } from './ensure-target-path'
import { GetArgsResult } from './get-args-result'
import { getPackageJson } from './get-package-json'
import { InitScriptRename } from './init-script-schema'
import { searchAndReplace } from './search-and-replace'
import { namesValues } from './vendor/names'

function compareReplacement(fromA: string, fromB: string): number {
  if (fromA < fromB) {
    return -1
  }
  if (fromA > fromB) {
    return 1
  }
  return 0
}

function getNameSegments(name: string): string[] {
  return name
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .split(/[^A-Za-z\d]+/)
    .filter(Boolean)
}

function toCompactName(name: string): string {
  return getNameSegments(name).join('').toLowerCase()
}

function toKebabName(name: string): string {
  return getNameSegments(name).join('-').toLowerCase()
}

function toPascalName(name: string): string {
  return getNameSegments(name)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join('')
}

function toSnakeName(name: string): string {
  return getNameSegments(name).join('_').toLowerCase()
}

function packageNameReplacementValues(from: string, to: string): { fromNames: string[]; toNames: string[] } {
  const replacements = new Map<string, string>()
  const variantReplacements = [
    [from, to],
    [toCompactName(from), toCompactName(to)],
    [toKebabName(from), toKebabName(to)],
    [toPascalName(from), toPascalName(to)],
    [toSnakeName(from), toSnakeName(to)],
  ]

  for (const [fromName, toName] of variantReplacements) {
    if (fromName && !replacements.has(fromName)) {
      replacements.set(fromName, toName)
    }
  }

  const sortedReplacements = [...replacements.entries()].sort(([fromA], [fromB]) => compareReplacement(fromA, fromB))

  return {
    fromNames: sortedReplacements.map(([fromName]) => fromName),
    toNames: sortedReplacements.map(([, toName]) => toName),
  }
}

export async function initScriptRename(args: GetArgsResult, rename?: InitScriptRename, verbose = false) {
  const tag = `initScriptRename`
  const { contents } = getPackageJson(args.targetDirectory)
  // Rename template from package.json to project name throughout the whole project
  if (contents.name) {
    if (args.verbose) {
      log.warn(`${tag}: renaming template name '${contents.name}' to project name '${args.name}'`)
    }
    const { fromNames, toNames } = packageNameReplacementValues(contents.name, args.name)
    await searchAndReplace(args.targetDirectory, fromNames, toNames, args.dryRun, verbose)
  }

  // Return early if there are no renames defined in the init script
  if (!rename) {
    if (args.verbose) {
      log.warn(`${tag}: no renames found`)
    }
    return
  }

  // Loop through each word in the rename object
  for (const from of Object.keys(rename)) {
    // Skip if the 'from' value matches the package.json name (already replaced above)
    if (from === contents.name) {
      if (args.verbose) {
        log.warn(`${tag}: skipping rename for '${from}' as it matches package.json name (already replaced)`)
      }
      continue
    }

    // Get the 'to' property from the rename object
    const to = rename[from].to.replace('{{name}}', args.name)

    // Get the name matrix for the 'from' and the 'to' value
    const fromNames = namesValues(from)
    const toNames = namesValues(to)

    for (const path of rename[from].paths) {
      const targetPath = join(args.targetDirectory, path)
      if (!(await ensureTargetPath(targetPath))) {
        log.error(`${tag}: target does not exist ${targetPath}`)
        continue
      }
      if (args.verbose) {
        log.warn(`${tag}: ${targetPath} -> ${fromNames.join('|')} -> ${toNames.join('|')}`)
      }
      await searchAndReplace(targetPath, fromNames, toNames, args.dryRun, args.verbose)
    }
  }

  if (args.verbose) {
    log.warn(`${tag}: done`)
  }
}
