import { getVersionCommand, VersionCommand } from './get-version-command'
import { parseVersion } from './parse-version'

export function getVersion(command: VersionCommand): string | undefined {
  const cmd = getVersionCommand(command)
  if (!cmd) {
    throw new Error(`Unknown command ${command}`)
  }

  try {
    return parseVersion(cmd.command, cmd.regex)
  } catch {
    return undefined
  }
}
