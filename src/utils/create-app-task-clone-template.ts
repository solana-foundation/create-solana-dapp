import { log } from '@clack/prompts'
import { downloadTemplate } from 'giget'
import { existsSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { GetArgsResult } from './get-args-result'
import { Task, taskFail } from './vendor/clack-tasks'

export function createAppTaskCloneTemplate(args: GetArgsResult): Task {
  return {
    task: async (result) => {
      const exists = existsSync(args.targetDirectory)

      if (exists) {
        taskFail(`Target directory ${args.targetDirectory} already exists`)
      }
      if (!args.template.id) {
        taskFail('No template id specified')
      }
      if (args.verbose) {
        log.warn(`Cloning template ${args.template.id} to ${args.targetDirectory}`)
      }
      try {
        const { dir } = await downloadTemplate(args.template.id, {
          dir: args.targetDirectory,
        })
        // make sure the dir is not empty
        const files = await readdir(dir)
        if (files.length === 0) {
          taskFail(`The template directory is empty. Please check the template id: ${args.template.id}`)
          return
        }

        return result({ message: `Cloned template to ${dir}` })
      } catch (error) {
        taskFail(`init: Error cloning the template: ${error}`)
      }
    },
    title: 'Cloning template',
  }
}
