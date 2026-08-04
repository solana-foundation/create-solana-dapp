import { log } from '@clack/prompts'
import { existsSync, rmSync } from 'node:fs'
import { createAppTaskCloneTemplate } from './create-app-task-clone-template'
import { createAppTaskInitializeGit } from './create-app-task-initialize-git'
import { createAppTaskInstallDependencies } from './create-app-task-install-dependencies'
import { createAppTaskInstallSkills } from './create-app-task-install-skills'
import { createAppTaskRunInitScript } from './create-app-task-run-init-script'
import { createAppTaskRunOptionScript } from './create-app-task-run-option-script'
import { createAppTaskRunSetup } from './create-app-task-run-setup'
import { type GetArgsResult } from './get-args-result'
import { getPackageJson } from './get-package-json'
import { getPackageJsonPath } from './get-package-json-path'
import { resolveInitScriptOptions } from './init-script-options'
import { initScriptPackageManager } from './init-script-package-manager'
import { initScriptKey } from './init-script-schema'
import { removeIncompatiblePackageManager } from './remove-incompatible-package-manager'
import { tasks } from './vendor/clack-tasks'

export type CreateAppArgs = GetArgsResult
export type CreateAppResult = string[]

export async function createApp(args: CreateAppArgs): Promise<CreateAppResult> {
  // A directory that was already there is not ours to remove when a task fails
  const targetExisted = existsSync(args.targetDirectory)

  try {
    const instructions = await tasks([
      // Clone the template to the target directory
      createAppTaskCloneTemplate(args),
    ])

    initScriptPackageManager(args)

    // Remove an incompatible `packageManager` field from the template's
    // package.json so the effective package manager can install. This runs
    // AFTER initScriptPackageManager so a template-configured package manager
    // takes precedence: args.packageManager already reflects the template's
    // choice here, and a matching pin is left in place. Runs during setup so
    // it applies even when install is skipped, and before the template option
    // scripts so they are not run through an incompatible package manager.
    if (existsSync(getPackageJsonPath(args.targetDirectory))) {
      const removedPackageManager = removeIncompatiblePackageManager(args.targetDirectory, args.packageManager)
      if (removedPackageManager) {
        log.warn(
          `Removed \`packageManager\` (${removedPackageManager}) from package.json as it does not match the selected package manager (${args.packageManager}); this may indicate potential incompatibilities with the template.`,
        )
      }
    }

    // Snapshot the init script and resolve the selected options before any template option script
    // runs, so the flags are validated before work is done and a script that rewrites package.json
    // cannot drop the renames and instructions the init script is meant to apply
    const { contents } = getPackageJson(args.targetDirectory)
    const init = contents[initScriptKey]
    const options = args.skipInit ? [] : resolveInitScriptOptions(init?.options, args.templateOptions ?? [])

    return [
      ...instructions,
      ...(await tasks([
        // Run the (optional) scripts declared by the selected template options
        createAppTaskRunOptionScript(args, options),
        // Install the dependencies
        createAppTaskInstallDependencies(args),
        // Run the (optional) setup script defined in package.json (e.g. build anchor program)
        createAppTaskRunSetup(args),
        // Install skills for AI coding agents
        createAppTaskInstallSkills(args),
        // Run the (optional) init script defined in package.json
        createAppTaskRunInitScript(args, init, options),
        // Initialize git repository
        createAppTaskInitializeGit(args),
      ])),
    ]
  } catch (error) {
    if (!targetExisted) {
      rmSync(args.targetDirectory, { force: true, recursive: true })
    }
    throw error
  }
}
