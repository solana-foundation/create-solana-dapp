import { log } from '@clack/prompts'
import { GetArgsResult } from './get-args-result'
import { getPackageJson } from './get-package-json'
import { initScriptKey } from './init-script-schema'
import { taskFail } from './vendor/clack-tasks'
import { getPackageManagerVersion } from './vendor/package-manager'

export function initScriptPackageManager(args: GetArgsResult): void {
  const { contents } = getPackageJson(args.targetDirectory)
  const packageManager = contents[initScriptKey]?.packageManager

  if (!packageManager) {
    return
  }

  if ((args.packageManagerExplicit ?? true) && args.packageManager !== packageManager) {
    taskFail(`Template requires ${packageManager}, but ${args.packageManager} was explicitly selected`)
    return
  }

  try {
    getPackageManagerVersion(packageManager, args.targetDirectory)
  } catch (error) {
    if (args.verbose) {
      log.error(`Error checking ${packageManager} availability: ${error}`)
    }
    taskFail(`Template requires ${packageManager}, but ${packageManager} is not available`)
    return
  }

  args.packageManager = packageManager
}
