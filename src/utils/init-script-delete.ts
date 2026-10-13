import { log } from '@clack/prompts'
import { writeFileSync } from 'node:fs'
import { GetArgsResult } from './get-args-result'
import { getPackageJson } from './get-package-json'
import { initScriptKey } from './init-script-schema'

// Template catalog metadata, read from the templates repo, not from the scaffolded project
const templateCatalogKeys = ['description', 'displayName', 'keywords', 'usecase']

export function initScriptDelete(args: GetArgsResult) {
  const tag = `initScriptDelete`
  const { contents, path } = getPackageJson(args.targetDirectory)
  for (const key of [initScriptKey, ...templateCatalogKeys]) {
    delete contents[key]
  }
  writeFileSync(path, JSON.stringify(contents, undefined, 2) + '\n')
  if (args.verbose) {
    log.warn(`${tag}: deleted ${initScriptKey} and template catalog fields from package.json`)
  }
}
