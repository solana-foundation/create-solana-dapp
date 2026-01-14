import { log } from '@clack/prompts'
import { InitScriptVersions } from './init-script-schema'
import { initScriptVersionCheck } from './init-script-version-check'

export async function initScriptVersion(versions?: InitScriptVersions, verbose = false) {
  const tag = `initScriptVersion`
  if (!versions) {
    if (verbose) {
      log.warn(`${tag}: no versions found`)
    }
    return
  }
  await initScriptVersionCheck('adb', versions.adb, verbose)
  await initScriptVersionCheck('anchor', versions.anchor, verbose)
  await initScriptVersionCheck('solana', versions.solana, verbose)
  if (verbose) {
    log.warn(`${tag}: done`)
  }
}
