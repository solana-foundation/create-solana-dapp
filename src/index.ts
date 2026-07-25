import { cancel, log, note, outro } from '@clack/prompts'
import * as process from 'node:process'
import { createApp } from './utils/create-app'
import { finalNote } from './utils/final-note'
import { getAppInfo } from './utils/get-app-info'
import { getArgs } from './utils/get-args'
import { detectInvokedPackageManager } from './utils/vendor/package-manager'

export { createApp } from './utils/create-app'
export type { CreateAppArgs, CreateAppResult } from './utils/create-app'
export { fetchTemplateData } from './utils/fetch-template-data'
export type { FetchTemplateDataArgs, FetchTemplateDataResult } from './utils/fetch-template-data'
export { finalNote } from './utils/final-note'
export type { FinalNoteArgs } from './utils/final-note'
export { getAppInfo } from './utils/get-app-info'
export type { AppInfo } from './utils/get-app-info'
export { getArgs } from './utils/get-args'
export type { GetArgsResult } from './utils/get-args-result'
export { listTemplateIds } from './utils/list-template-ids'
export { listTemplates } from './utils/list-templates'
export { listVersions } from './utils/list-versions'
export type { Template } from './utils/template'
export type {
  MenuConfig,
  MenuConfigItem,
  MenuItem,
  TemplateJson,
  TemplateJsonGroup,
  TemplateJsonTemplate,
} from './utils/template-schema'
export { validateProjectName } from './utils/validate-project-name'
export { detectInvokedPackageManager } from './utils/vendor/package-manager'
export type { PackageManager } from './utils/vendor/package-manager'

export async function main(argv: string[]) {
  // Get the invoked package manager
  const pm = detectInvokedPackageManager()

  // Get app info from package.json
  const app = getAppInfo()

  try {
    // Get the result from the command line and prompts
    const args = await getArgs(argv, app, pm)

    if (args.dryRun) {
      note(JSON.stringify(args, undefined, 2), 'Arguments')
      outro('🚀 Dry run was used, no changes were made')
      return
    }

    if (args.verbose) {
      log.warn(`Verbose output enabled`)
      console.warn(args)
    }

    // Create the app
    const instructions = await createApp(args)

    note(
      finalNote({ ...args, instructions, target: args.targetDirectory.replace(process.cwd(), '.') }),
      'Installation successful',
    )

    outro('Good luck with your project!')
  } catch (error) {
    cancel(`${error}`)
    process.exit(1)
  }
}
