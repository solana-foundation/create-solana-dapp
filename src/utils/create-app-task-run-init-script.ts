import { log } from '@clack/prompts'
import { join } from 'node:path'
import { bold, yellow } from 'picocolors'
import { ensureTargetPath } from './ensure-target-path'
import { GetArgsResult } from './get-args-result'
import { deleteInitScript, getInitScript, InitScript } from './get-init-script'
import { searchAndReplace } from './search-and-replace'
import { validateAnchorVersion, validateSolanaVersion } from './validate-version'
import { Task, taskFail } from './vendor/clack-tasks'
import { namesValues } from './vendor/names'

export function createAppTaskRunInitScript(args: GetArgsResult): Task {
  return {
    enabled: !args.skipInit,
    title: 'Running init script',
    task: async (result) => {
      try {
        const init = getInitScript(args.targetDirectory)
        if (!init) {
          return result({ message: 'Repository does not have an init script' })
        }
        if (args.verbose) {
          log.warn(`Running init script`)
        }

        await initCheckVersion(init)
        if (args.verbose) {
          log.warn(`initCheckVersion done`)
        }
        await initRename(args, init, args.verbose)
        if (args.verbose) {
          log.warn(`initRename done`)
        }

        const instructions: string[] = (initInstructions(init) ?? [])
          ?.filter(Boolean)
          .map((msg) => msg.replace('{pm}', args.packageManager))

        if (args.verbose) {
          log.warn(`initInstructions done`)
        }
        deleteInitScript(args.targetDirectory)
        if (args.verbose) {
          log.warn(`deleteInitScript done`)
        }
        return result({ message: 'Executed init script', instructions })
      } catch (error) {
        taskFail(`init: Error running init script: ${error}`)
      }
    },
  }
}

async function initRename(args: GetArgsResult, init: InitScript, verbose: boolean) {
  const projectContainsTemplateName = args.name.includes(args.template.name)
  // Rename template to project name throughout the whole project
  await searchAndReplace(
    args.targetDirectory,
    projectContainsTemplateName ? [] : [`template-${args.template.name}`, args.template.name],
    projectContainsTemplateName ? [] : [args.name, args.name],
    false,
    verbose,
  )

  // Return early if there are no renames defined in the init script
  if (!init?.rename) {
    return
  }
  if (args.verbose) {
    log.warn(`initRename: Found renames in init script`)
    console.log(init.rename)
  }
  let renameCount = 0

  // Loop through each word in the rename object
  for (const from of Object.keys(init.rename)) {
    renameCount += 1
    if (args.verbose) {
      log.warn(`initRename: [${renameCount}] Processing ${from}`)
    }
    // Get the 'to' property from the rename object
    const to = init.rename[from].to.replace('{{name}}', args.name.replace(/-/g, ''))
    if (args.verbose) {
      log.warn(`initRename: [${renameCount}] from ${from} to ${to}`)
    }

    // Get the name matrix for the 'from' and the 'to' value
    const fromNames = namesValues(from)
    const toNames = namesValues(to)

    if (args.verbose) {
      log.warn(`initRename: [${renameCount}] fromNames: ${fromNames.join(', ')}`)
      log.warn(`initRename: [${renameCount}] ..toNames: ${toNames.join(', ')}`)
    }

    for (const path of init.rename[from].paths) {
      if (args.verbose) {
        log.warn(`initRename: [${renameCount}]  => Processing path ${path}`)
      }
      const targetPath = join(args.targetDirectory, path)
      if (!(await ensureTargetPath(targetPath))) {
        console.error(`init-script.rename: target does not exist ${targetPath}`)
        continue
      }
      if (args.verbose) {
        log.warn(`initRename: [${renameCount}]  => Searching and replacing ${fromNames.join(', ')} in ${targetPath}`)
      }
      await searchAndReplace(join(args.targetDirectory, path), fromNames, toNames, args.dryRun, args.verbose)
      if (args.verbose) {
        log.warn(`initRename: [${renameCount}]  => Done`)
      }
    }
    if (args.verbose) {
      log.warn(`initRename: [${renameCount}] Done`)
    }
  }
}

async function initCheckVersion(init: InitScript) {
  if (init?.versions?.anchor) {
    await initCheckVersionAnchor(init.versions.anchor)
  }
  if (init?.versions?.solana) {
    await initCheckVersionSolana(init.versions.solana)
  }
}

async function initCheckVersionAnchor(requiredVersion: string) {
  try {
    const { required, valid, version } = validateAnchorVersion(requiredVersion)
    if (!version) {
      log.warn(
        [
          bold(yellow(`Could not find Anchor version. Please install Anchor.`)),
          'https://www.anchor-lang.com/docs/installation',
        ].join(' '),
      )
    } else if (!valid) {
      log.warn(
        [
          yellow(`Found Anchor version ${version}. Expected Anchor version ${required}.`),
          'https://www.anchor-lang.com/release-notes/0.30.1',
        ].join(' '),
      )
    }
  } catch (error_) {
    log.warn(`Error ${error_}`)
  }
}

async function initCheckVersionSolana(requiredVersion: string) {
  try {
    const { required, valid, version } = validateSolanaVersion(requiredVersion)
    if (!version) {
      log.warn(
        [
          bold(yellow(`Could not find Solana version. Please install Solana.`)),
          'https://docs.solana.com/cli/install-solana-cli-tools',
        ].join(' '),
      )
    } else if (!valid) {
      log.warn(
        [
          yellow(`Found Solana version ${version}. Expected Solana version ${required}.`),
          'https://docs.solana.com/cli/install-solana-cli-tools',
        ].join(' '),
      )
    }
  } catch (error_) {
    log.warn(`Error ${error_}`)
  }
}

function initInstructions(init: InitScript) {
  return init?.instructions?.length === 0 ? [] : init?.instructions
}
