import { log } from '@clack/prompts'
import { join } from 'node:path'
import { ensureTargetPath } from './ensure-target-path'
import { GetArgsResult } from './get-args-result'
import { getPackageJson } from './get-package-json'
import { InitScriptRename, InitScriptRenameEntry } from './init-script-schema'
import { SearchAndReplaceScope, searchAndReplaceScopes } from './search-and-replace'
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

function toDisplayName(name: string): string {
  return getNameSegments(name)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(' ')
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

function renameEntryPaths(entry: InitScriptRenameEntry): string[] {
  // `paths` is the deprecated spelling of `in`; the schema guarantees exactly one of them is set
  return entry.in ?? entry.paths ?? []
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

function initScriptRenameReplacementValues(from: string, to: string): { fromNames: string[]; toNames: string[] } {
  const replacements = new Map<string, string>()
  const fromNames = namesValues(from)
  const toNames = namesValues(to)

  for (const [index, fromName] of fromNames.entries()) {
    let toName = toNames[index]
    if (fromName === from) {
      toName = /\s/.test(from) ? toDisplayName(to) : to
    }
    if (!replacements.has(fromName)) {
      replacements.set(fromName, toName)
    }
  }

  return {
    fromNames: [...replacements.keys()],
    toNames: [...replacements.values()],
  }
}

function projectRenameScope(args: GetArgsResult): SearchAndReplaceScope | undefined {
  const { contents } = getPackageJson(args.targetDirectory)
  if (!contents.name) {
    return undefined
  }
  if (args.verbose) {
    log.warn(`initScriptRename: renaming template name '${contents.name}' to project name '${args.name}'`)
  }
  const { fromNames, toNames } = packageNameReplacementValues(contents.name, args.name)

  return { fromStrings: fromNames, path: args.targetDirectory, toStrings: toNames }
}

export async function initScriptRenameEntryScopes(
  args: GetArgsResult,
  rename?: InitScriptRename,
): Promise<SearchAndReplaceScope[]> {
  const tag = `initScriptRename`
  if (!rename) {
    if (args.verbose) {
      log.warn(`${tag}: no renames found`)
    }
    return []
  }

  const deprecated = Object.keys(rename).filter((from) => rename[from].paths)
  if (deprecated.length > 0) {
    log.warn(
      `${tag}: 'paths' is deprecated and is removed in the next major version, use 'in' instead: ${deprecated.join(', ')}`,
    )
  }

  const scopes: SearchAndReplaceScope[] = []

  for (const from of Object.keys(rename)) {
    const to = rename[from].to.replace('{{name}}', args.name)
    const { fromNames, toNames } = initScriptRenameReplacementValues(from, to)

    for (const path of renameEntryPaths(rename[from])) {
      const targetPath = join(args.targetDirectory, path)
      if (!(await ensureTargetPath(targetPath))) {
        log.error(`${tag}: target does not exist ${targetPath}`)
        continue
      }
      if (args.verbose) {
        log.warn(`${tag}: ${targetPath} -> ${fromNames.join('|')} -> ${toNames.join('|')}`)
      }
      scopes.push({ fromStrings: fromNames, path: targetPath, toStrings: toNames })
    }
  }

  return scopes
}

export async function initScriptRename(
  args: GetArgsResult,
  rename?: InitScriptRename,
  verbose = false,
  optionScopes: SearchAndReplaceScope[] = [],
) {
  const tag = `initScriptRename`
  const { contents } = getPackageJson(args.targetDirectory)
  let entries = rename

  if (contents.name && rename?.[contents.name]) {
    const { [contents.name]: _packageName, ...remainingRename } = rename
    if (args.verbose) {
      log.warn(`${tag}: skipping rename for '${contents.name}' as it matches package.json name`)
    }
    entries = remainingRename
  }

  const projectScope = projectRenameScope(args)
  const scopes = [
    ...(projectScope ? [projectScope] : []),
    ...(await initScriptRenameEntryScopes(args, entries)),
    // Last so that a term selected by a template option wins over the same term in `rename`
    ...optionScopes,
  ]

  // Every scope is applied in a single pass per file so that one rename never rewrites the output
  // of another. See https://github.com/solana-foundation/create-solana-dapp/issues/193
  await searchAndReplaceScopes(scopes, args.dryRun, args.verbose || verbose)

  if (rename && args.verbose) {
    log.warn(`${tag}: done`)
  }
}
