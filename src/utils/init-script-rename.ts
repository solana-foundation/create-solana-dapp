import { log } from '@clack/prompts'
import { join } from 'node:path'
import { ensureTargetPath } from './ensure-target-path'
import { GetArgsResult } from './get-args-result'
import { getPackageJson } from './get-package-json'
import { InitScriptRename } from './init-script-schema'
import { searchAndReplace } from './search-and-replace'
import { namesValues } from './vendor/names'

export async function initScriptRename(args: GetArgsResult, rename?: InitScriptRename, verbose = false) {
  const tag = `initScriptRename`
  const { contents } = getPackageJson(args.targetDirectory)
  // Rename template from package.json to project name throughout the whole project
  if (contents.name) {
    if (args.verbose) {
      log.warn(`${tag}: renaming template name '${contents.name}' to project name '${args.name}'`)
    }
    await searchAndReplace(args.targetDirectory, [contents.name], [args.name], false, verbose)
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

    // Deduplicate the arrays to prevent multiple replacements of the same pattern
    const uniqueFromNames = [...new Set(fromNames)]
    const uniqueToNames = [...new Set(toNames)]

    for (const path of rename[from].paths) {
      const targetPath = join(args.targetDirectory, path)
      if (!(await ensureTargetPath(targetPath))) {
        log.error(`${tag}: target does not exist ${targetPath}`)
        continue
      }
      if (args.verbose) {
        log.warn(`${tag}: ${targetPath} -> ${uniqueFromNames.join('|')} -> ${uniqueToNames.join('|')}`)
      }
      await searchAndReplace(targetPath, uniqueFromNames, uniqueToNames, args.dryRun, args.verbose)
    }
  }

  if (args.verbose) {
    log.warn(`${tag}: done`)
  }
}
