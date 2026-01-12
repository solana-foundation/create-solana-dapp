import { log } from '@clack/prompts'
import { GetArgsResult } from './get-args-result'
import { getPackageJson } from './get-package-json'
import { execAndWait } from './vendor/child-process-utils'
import { Task, taskFail } from './vendor/clack-tasks'

export function createAppTaskRunSetup(args: GetArgsResult): Task {
  return {
    enabled: !args.skipInstall,
    task: async (result) => {
      try {
        const { contents } = getPackageJson(args.targetDirectory)

        if (!contents.scripts?.setup) {
          return result({ message: 'No setup script found' })
        }

        if (args.verbose) {
          log.warn(`Running setup script`)
        }

        const runCommand = `${args.packageManager} run setup`
        await execAndWait(runCommand, args.targetDirectory)

        return result({ message: 'Setup complete' })
      } catch (error) {
        taskFail(`Error running setup script: ${error}`)
      }
    },
    title: 'Running setup (building program, generating client)',
  }
}
