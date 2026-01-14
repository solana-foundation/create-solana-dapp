import { log } from '@clack/prompts'
import { GetArgsResult } from './get-args-result'
import { getPackageJson } from './get-package-json'
import { initScriptDelete } from './init-script-delete'
import { initScriptInstructions } from './init-script-instructions'
import { initScriptRename } from './init-script-rename'
import { initScriptKey } from './init-script-schema'
import { initScriptVersion } from './init-script-version'
import { Task, taskFail } from './vendor/clack-tasks'

export function createAppTaskRunInitScript(args: GetArgsResult): Task {
  return {
    enabled: !args.skipInit,
    task: async (result) => {
      try {
        const { contents } = getPackageJson(args.targetDirectory)
        const init = contents[initScriptKey]
        if (!init) {
          return result({ message: 'Init script not found' })
        }
        if (args.verbose) {
          log.warn(`Init script started`)
        }

        await initScriptVersion(init.versions, args.verbose)

        await initScriptRename(args, init.rename, args.verbose)

        const instructions: string[] = initScriptInstructions(init.instructions, args.verbose)
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
