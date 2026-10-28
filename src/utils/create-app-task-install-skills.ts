import { log } from '@clack/prompts'
import { renameSync } from 'node:fs'
import { GetArgsResult } from './get-args-result'
import { getPackageJson } from './get-package-json'
import { initScriptKey } from './init-script-schema'
import { CreateAppError, execAndWait } from './vendor/child-process-utils'
import { Task } from './vendor/clack-tasks'

const defaultSkills = ['https://github.com/solana-foundation/solana-dev-skill']

export function createAppTaskInstallSkills(args: GetArgsResult): Task {
  return {
    enabled: !args.skipInstall,
    task: async (result) => {
      const { contents } = getPackageJson(args.targetDirectory)
      const skills = contents[initScriptKey]?.skills ?? defaultSkills

      if (skills.length === 0) {
        return result({ message: 'Skipped skill installation' })
      }

      const failures = await installSkills(args, skills)
      const installed = skills.length - failures.length

      for (const { reason, skill } of failures) {
        log.warn(`Failed to install skill ${skill}: ${reason}`)
      }

      if (installed === 0) {
        return result({ message: 'Failed to install skills' })
      }

      if (failures.length > 0) {
        return result({ message: `Installed ${installed}/${skills.length} skills` })
      }

      return result({ message: `Installed ${skills.length === 1 ? 'skill' : 'skills'}` })
    },
    title: 'Installing skills',
  }
}

async function installSkills(args: GetArgsResult, skills: string[]) {
  const failures: { reason: string; skill: string }[] = []
  for (const [index, skill] of skills.entries()) {
    const reason = await installSkill(args, skill, index)
    if (reason !== undefined) {
      failures.push({ reason, skill })
    }
  }
  return failures
}

// Resolves to undefined when the install succeeds, or to the failure reason
async function installSkill(args: GetArgsResult, skill: string, index: number): Promise<string | undefined> {
  try {
    if (args.verbose) {
      log.warn(`Installing skill ${skill}`)
    }

    await execAndWait(`npx -y skills add ${shellQuote(skill)} --skill "*" -y`, args.targetDirectory)
    return undefined
  } catch (error) {
    return describeSkillInstallError(error, `${args.targetDirectory}.skill-${index + 1}.error.log`)
  }
}

// The skills CLI explains a failed install on stderr (e.g. a SKILL.md it can't parse), so the
// first line of that output is the reason; the log file written by execAndWait has the rest.
// execAndWait reuses one log file per directory, so it moves to logFile before the next install overwrites it.
function describeSkillInstallError(error: unknown, logFile: string): string {
  if (error instanceof CreateAppError) {
    renameSync(error.logFile, logFile)
    const firstLine = error.logMessage
      .split('\n')
      .find((line) => line.trim().length > 0)
      ?.trim()
    return firstLine ? `${firstLine} (full log: ${logFile})` : `see ${logFile}`
  }
  return `${error}`
}

function shellQuote(value: string) {
  if (process.platform === 'win32') {
    return `"${value.replaceAll('"', '""')}"`
  }

  return `'${value.replaceAll("'", String.raw`'\''`)}'`
}
