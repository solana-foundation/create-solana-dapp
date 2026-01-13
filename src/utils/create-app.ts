import { createAppTaskCloneTemplate } from './create-app-task-clone-template'
import { createAppTaskInitializeGit } from './create-app-task-initialize-git'
import { createAppTaskInstallDependencies } from './create-app-task-install-dependencies'
import { createAppTaskRunInitScript } from './create-app-task-run-init-script'
import { createAppTaskRunSetup } from './create-app-task-run-setup'
import { GetArgsResult } from './get-args-result'
import { tasks } from './vendor/clack-tasks'

export async function createApp(args: GetArgsResult) {
  return tasks([
    // Clone the template to the target directory
    createAppTaskCloneTemplate(args),
    // Install the dependencies
    createAppTaskInstallDependencies(args),
    // Run the (optional) setup script defined in package.json (e.g. build anchor program)
    createAppTaskRunSetup(args),
    // Run the (optional) init script defined in package.json
    createAppTaskRunInitScript(args),
    // Initialize git repository
    createAppTaskInitializeGit(args),
  ])
}
