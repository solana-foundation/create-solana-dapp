import { log } from '@clack/prompts'
import pico from 'picocolors'
import { getVersion } from './get-version'
import { VersionCommand } from './get-version-command'
import { getVersionUrls } from './get-version-urls'
import { validateVersion } from './validate-version'

export async function initScriptVersionCheck(versionCommand: VersionCommand, required?: string, verbose = false) {
  const tag = `initScriptVersionCheck`
  if (!required) {
    return
  }
  try {
    const { valid, version } = validateVersion({ required, version: getVersion(versionCommand) })
    if (verbose) {
      log.warn(`${tag}: required: ${required}, version: ${version ?? '*none*'}, valid: ${valid}`)
    }
    if (version && valid) {
      // All good
      return
    }

    const { install, update } = getVersionUrls(versionCommand, required)

    if (!version) {
      log.warn(
        [
          pico.bold(pico.yellow(`Could not find ${versionCommand} version. Please install ${versionCommand}.`)),
          install?.replace('{required}', required),
        ].join(' '),
      )
      return
    }
    if (!valid) {
      log.warn(
        [
          pico.yellow(`Found ${versionCommand} version ${version}. Expected ${versionCommand} version ${required}.`),
          update?.replace('{required}', required),
        ].join(' '),
      )
      return
    }
  } catch (error_) {
    log.warn(`Error ${error_}`)
  }
}
