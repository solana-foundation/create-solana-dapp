import { log } from '@clack/prompts'
import { GetArgsResult } from './get-args-result'
import { execAndWait } from './vendor/child-process-utils'
import { Task } from './vendor/clack-tasks'

export function createAppTaskInstallDevSkill(args: GetArgsResult): Task {
  return {
    enabled: !args.skipInstall,
    task: async (result) => {
      try {
        if (args.verbose) {
          log.warn(`Installing Solana dev skill`)
        }
        await execAndWait(
          'npx -y skills add https://github.com/solana-foundation/solana-dev-skill --skill "*" -y',
          args.targetDirectory,
        )
        return result({ message: 'Installed Solana dev skill' })
      } catch (error) {
        if (args.verbose) {
          log.error(`Error installing Solana dev skill: ${error}`)
        }
        // Non-fatal: skip if it fails
        return result({ message: 'Skipped Solana dev skill installation' })
      }
    },
    title: 'Installing Solana dev skill',
  }
}
