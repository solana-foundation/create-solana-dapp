import { log } from '@clack/prompts'
import { GetArgsResult } from './get-args-result'
import { getPackageJson } from './get-package-json'
import { SelectedTemplateOption } from './init-script-options'
import { execAndWait } from './vendor/child-process-utils'
import { Task, taskFail } from './vendor/clack-tasks'

/**
 * Runs the package.json scripts declared by the selected template options.
 *
 * This happens before dependencies are installed so a script that trims
 * package.json is reflected in the lockfile and node_modules, and before the
 * init script so any files it writes are still renamed.
 */
export function createAppTaskRunOptionScript(args: GetArgsResult, options: SelectedTemplateOption[]): Task {
  const selected = options.filter((option) => option.value.run)

  return {
    enabled: !args.skipInit && selected.length > 0,
    task: async (result) => {
      try {
        const { contents } = getPackageJson(args.targetDirectory)

        for (const option of selected) {
          const { run } = option.value
          if (!run) {
            continue
          }

          // The schema rejects shell metacharacters and quotes, so whitespace only separates tokens.
          const [script, ...scriptArguments] = run.trim().split(/\s+/)
          if (!contents.scripts?.[script]) {
            throw new Error(`Template option --${option.name} requires a "${script}" script in package.json`)
          }

          // Accept the npm-style separator used in template metadata, but do not forward it to
          // package managers that pass it literally to the script. Preserve any later separators.
          if (scriptArguments[0] === '--') {
            scriptArguments.shift()
          }
          // Bun consumes a leading script separator even after its own options have ended.
          if (args.packageManager === 'bun' && scriptArguments[0] === '--') {
            scriptArguments.unshift('--')
          }
          // End package-manager option parsing before the script name so flags reach the script.
          const command = ['--', script, ...scriptArguments].join(' ')

          if (args.verbose) {
            log.warn(`Running ${args.packageManager} run ${command}`)
          }

          const { stdout } = await execAndWait(`${args.packageManager} run ${command}`, args.targetDirectory)

          if (args.verbose && stdout.trim().length > 0) {
            log.warn(stdout.trim())
          }
        }

        return result({ message: `Ran ${selected.map((option) => `--${option.name}`).join(', ')}` })
      } catch (error) {
        taskFail(`Error running template option script: ${error}`)
      }
    },
    title: 'Running template option scripts',
  }
}
