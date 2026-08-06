import { log } from '@clack/prompts'
import { downloadTemplate } from 'giget'
import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { corruptArchiveMessage, isCorruptArchiveError } from './corrupt-archive-error'
import { GetArgsResult } from './get-args-result'
import { Task, taskFail } from './vendor/clack-tasks'

/**
 * Downloads the template, retrying once when the cached tarball turns out to be
 * corrupt (#256).
 *
 * giget only re-downloads when the previous attempt is not reused: if a partial
 * tarball is already cached and the download errors, giget silently extracts the
 * partial file and `tar` fails with a zlib error. A second attempt re-runs the
 * download, which overwrites the poisoned cache entry when the network
 * cooperates; if it does not, the user gets an actionable message instead of a
 * bare `ZlibError`.
 */
async function downloadTemplateWithRetry(args: GetArgsResult) {
  try {
    return await downloadTemplate(args.template.id, { dir: args.targetDirectory })
  } catch (error) {
    if (!isCorruptArchiveError(error)) {
      throw error
    }
    if (args.verbose) {
      log.warn(`Cached template archive was corrupt, retrying download: ${error}`)
    }
    try {
      // `forceClean` clears the partially extracted target directory the failed
      // attempt may have left behind.
      return await downloadTemplate(args.template.id, { dir: args.targetDirectory, forceClean: true })
    } catch (retryError) {
      if (isCorruptArchiveError(retryError)) {
        throw new Error(corruptArchiveMessage(args.template.id))
      }
      throw retryError
    }
  }
}

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
        let dir: string

        // Check if this is a local template
        if (args.template.id.startsWith('local:')) {
          const localPath = args.template.id.replace('local:', '')

          if (args.verbose) {
            log.warn(`Copying local template from ${localPath}`)
          }

          // Create target directory
          mkdirSync(args.targetDirectory, { recursive: true })

          // Copy the local template
          cpSync(localPath, args.targetDirectory, {
            filter: (src) => {
              // Skip common build/dependency directories
              const skipDirs = ['node_modules', '.git', 'dist', 'target']
              return !skipDirs.some((dir) => src.includes(dir))
            },
            recursive: true,
          })

          dir = args.targetDirectory
        } else {
          dir = (await downloadTemplateWithRetry(args)).dir
        }

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
