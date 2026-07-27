import { log } from '@clack/prompts'
import { existsSync } from 'node:fs'
import { createAppTaskCloneTemplate } from './create-app-task-clone-template'
import { createAppTaskInitializeGit } from './create-app-task-initialize-git'
import { createAppTaskInstallDependencies } from './create-app-task-install-dependencies'
import { createAppTaskInstallDevSkill } from './create-app-task-install-dev-skill'
import { createAppTaskRunInitScript } from './create-app-task-run-init-script'
import { createAppTaskRunSetup } from './create-app-task-run-setup'
import { type GetArgsResult } from './get-args-result'
import { getPackageJsonPath } from './get-package-json-path'
import { initScriptPackageManager } from './init-script-package-manager'
import { removeIncompatiblePackageManager } from './remove-incompatible-package-manager'
import { tasks } from './vendor/clack-tasks'

export type CreateAppArgs = GetArgsResult
export type CreateAppResult = string[]

export async function createApp(args: CreateAppArgs): Promise<CreateAppResult> {
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
  // it applies even when install is skipped.
  if (existsSync(getPackageJsonPath(args.targetDirectory))) {
    const removedPackageManager = removeIncompatiblePackageManager(args.targetDirectory, args.packageManager)
    if (removedPackageManager) {
      log.warn(
        `Removed \`packageManager\` (${removedPackageManager}) from package.json as it does not match the selected package manager (${args.packageManager}); this may indicate potential incompatibilities with the template.`,
      )
    }
  }

  return [
    ...instructions,
    ...(await tasks([
      // Install the dependencies
      createAppTaskInstallDependencies(args),
      // Run the (optional) setup script defined in package.json (e.g. build anchor program)
      createAppTaskRunSetup(args),
      // Install skills for AI coding agents
      createAppTaskInstallDevSkill(args),
      // Run the (optional) init script defined in package.json
      createAppTaskRunInitScript(args),
      // Initialize git repository
      createAppTaskInitializeGit(args),
    ])),
  ]
}
