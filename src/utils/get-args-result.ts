import { AppInfo } from './get-app-info'
import { Template } from './template'
import { PackageManager } from './vendor/package-manager'

export interface GetArgsResult {
  app: AppInfo
  dryRun: boolean
  name: string
  packageManager: PackageManager
  /** Treated as true when omitted by programmatic callers. */
  packageManagerExplicit?: boolean
  skipGit: boolean
  skipInit: boolean
  skipInstall: boolean
  targetDirectory: string
  template: Template
  /** Boolean template-defined flags selected on the command line. */
  templateOptions?: string[]
  verbose: boolean
}
