import { log } from '@clack/prompts'
import { GetArgsResult } from './get-args-result'
import { initScriptDelete } from './init-script-delete'
import { initScriptInstructions } from './init-script-instructions'
import { initScriptOptions, SelectedTemplateOption } from './init-script-options'
import { initScriptRename } from './init-script-rename'
import { InitScript } from './init-script-schema'
import { initScriptVersion } from './init-script-version'
import { Task, taskFail } from './vendor/clack-tasks'

/**
 * Applies the init script.
 *
 * The init script and the selected options are both snapshotted before the
 * template option scripts run, so a script that rewrites package.json cannot
 * drop the transformations this task is meant to apply.
 */
export function createAppTaskRunInitScript(
  args: GetArgsResult,
  init: InitScript | undefined,
  options: SelectedTemplateOption[],
): Task {
  return {
    enabled: !args.skipInit,
    task: async (result) => {
      try {
        if (!init) {
          return result({ message: 'Init script not found' })
        }
        if (args.verbose) {
          log.warn(`Init script started`)
        }

        await initScriptVersion(init.versions, args.verbose)

        const optionInstructions = await initScriptOptions(args, options)

        await initScriptRename(args, init.rename, args.verbose)

        const instructions: string[] = initScriptInstructions(
          [...optionInstructions, ...(init.instructions ?? [])],
          args.verbose,
        )
          ?.filter(Boolean)
          .map((msg) => msg.replace('{pm}', args.packageManager))

        initScriptDelete(args)
        return result({ instructions, message: 'Init script done' })
      } catch (error) {
        taskFail(`Error running init script: ${error}`)
      }
    },
    title: 'Running init script',
  }
}
