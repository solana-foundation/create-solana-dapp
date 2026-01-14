import { getVersion } from './get-version'
import { getVersionCommand, getVersionCommandNames } from './get-version-command'

export function listVersions() {
  console.log(`Installed versions:`)
  for (const command of getVersionCommandNames()) {
    const cmd = getVersionCommand(command)
    console.log(`  ${cmd.name}: ${getVersion(command) ?? 'not installed'}`)
  }
}
