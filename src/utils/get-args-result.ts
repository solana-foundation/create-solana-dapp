import { AppInfo } from './get-app-info'
import { Template } from './template'
import { PackageManager } from './vendor/package-manager'

export interface GetArgsResult {
  app: AppInfo
  dryRun: boolean
  name: string
  packageManager: PackageManager
  packageManagerExplicit?: boolean
  skipGit: boolean
  skipInit: boolean
  skipInstall: boolean
  targetDirectory: string
  template: Template
  verbose: boolean
}
