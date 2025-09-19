import { note } from '@clack/prompts'
import isInCi from 'is-in-ci'
import process from 'node:process'
import pico from 'picocolors'
import semverGt from 'semver/functions/gt.js'
import updateNotifier from 'update-notifier'
import { AppInfo } from './get-app-info'

export async function runVersionCheck({
  app: pkg,
  packageManager,
  verbose,
}: {
  app: AppInfo
  packageManager: string
  verbose: boolean
}) {
  if (isInCi || !process.stdout.isTTY || process.env.NODE_ENV === 'test') {
    console.log(`Version check skipped automatically`)
    return
  }
  const notifier = updateNotifier({ pkg, updateCheckInterval: 0 })
  const { current, latest } = await notifier.fetchInfo()
  const isCanary = current.startsWith('0.0.0-canary-')
  const isOutdated = semverGt(latest, current)
  const command = `${packageManager} create-solana-dapp${packageManager === 'yarn' ? '' : '@latest'}`

  if (verbose) {
    note(JSON.stringify({ command, current, isCanary, isOutdated, latest }, undefined, 2), 'Version check')
  }

  if (isOutdated && !isCanary) {
    const lines = [
      `Update available ${pico.dim(current)}${pico.reset(' → ')}${pico.green(latest)}`,
      `Run ${pico.cyan(command)} for the latest version.`,
      `Pass --skip-version-check to skip this check.`,
    ]

    notifier.notify({ defer: false, message: lines.join('\n') })
    process.exit(1)
  }
}
