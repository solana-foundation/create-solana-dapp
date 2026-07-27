import { log } from '@clack/prompts'
import { GetArgsResult } from './get-args-result'
import { getPackageJson } from './get-package-json'
import { initScriptKey } from './init-script-schema'
import { execAndWait } from './vendor/child-process-utils'
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

      const installed = await installSkills(args, skills)

      if (installed === 0) {
        return result({ message: 'Failed to install skills' })
      }

      if (installed < skills.length) {
        return result({ message: `Installed ${installed}/${skills.length} skills` })
      }

      return result({ message: `Installed ${skills.length === 1 ? 'skill' : 'skills'}` })
    },
    title: 'Installing skills',
  }
}

async function installSkills(args: GetArgsResult, skills: string[]) {
  const installs: boolean[] = []
  for (const skill of skills) {
    installs.push(await installSkill(args, skill))
  }
  return installs.filter(Boolean).length
}

async function installSkill(args: GetArgsResult, skill: string) {
  try {
    if (args.verbose) {
      log.warn(`Installing skill ${skill}`)
    }

    await execAndWait(`npx -y skills add ${shellQuote(skill)} --skill "*" -y`, args.targetDirectory)
    return true
  } catch (error) {
    if (args.verbose) {
      log.error(`Error installing skill ${skill}: ${error}`)
    }
    return false
  }
}

function shellQuote(value: string) {
  if (process.platform === 'win32') {
    return `"${value.replaceAll('"', '""')}"`
  }

  return `'${value.replaceAll("'", String.raw`'\''`)}'`
}
