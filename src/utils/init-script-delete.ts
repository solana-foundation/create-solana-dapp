import { log } from '@clack/prompts'
import { writeFileSync } from 'node:fs'
import { GetArgsResult } from './get-args-result'
import { getPackageJson } from './get-package-json'
import { initScriptKey } from './init-script-schema'

export function initScriptDelete(args: GetArgsResult) {
  const tag = `initScriptDelete`
  const { contents, path } = getPackageJson(args.targetDirectory)
  delete contents[initScriptKey]
  writeFileSync(path, JSON.stringify(contents, undefined, 2) + '\n')
  if (args.verbose) {
    log.warn(`${tag}: deleted ${initScriptKey} from package.json`)
  }
}
