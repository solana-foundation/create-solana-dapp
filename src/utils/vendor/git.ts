/**
 * This file includes portions of code from the 'create-nx-workspace' package.
 * The original code can be found at:
 * https://github.com/nrwl/nx/blob/2c0a50c0d8f45f65c9a91e1426fc2e66a29af3bb/packages/create-nx-workspace/src/utils/git/git.ts
 *
 * This code is licensed under the MIT License:
 * MIT License
 * Copyright (c) 2017-2024 Narwhal Technologies Inc.
 *
 * The full MIT License is available in the LICENSE file at the root of this repository.
 */
import { log } from '@clack/prompts'
import { execSync, spawn, SpawnOptions } from 'node:child_process'

function runCheck(cmd: string): string | undefined {
  try {
    return execSync(cmd, { windowsHide: true }).toString().trim()
  } catch {
    return undefined
  }
}

function checkGitVersion(): string | undefined {
  return runCheck('git --version')?.match(/\d+\.\d+\.+\d+/)?.[0]
}

function checkGitUserName(): string | undefined {
  return runCheck('git config --global user.name') ?? 'bot'
}

function checkGitUserEmail(): string | undefined {
  return runCheck('git config --global user.email') ?? 'bot@example.com'
}

export async function initializeGitRepo(directory: string, verbose = false) {
  const name = checkGitUserName()
  const email = checkGitUserEmail()
  if (verbose) {
    log.warn(`Committing using name: ${name} and email: ${email}`)
  }

  const execute = (args: ReadonlyArray<string>, ignoreErrorStream = false) => {
    if (verbose) {
      log.warn(`Executing command: git ${args.join(' ')}`)
    }
    const outputStream = 'ignore'
    const errorStream = ignoreErrorStream ? 'ignore' : process.stderr
    const spawnOptions: SpawnOptions = {
      cwd: directory,
      env: {
        ...process.env,
        GIT_AUTHOR_EMAIL: email,
        GIT_AUTHOR_NAME: name,
        GIT_COMMITTER_EMAIL: email,
        GIT_COMMITTER_NAME: name,
      },
      shell: true,
      stdio: [process.stdin, outputStream, errorStream],
    }
    return new Promise<void>((resolve, reject) => {
      spawn('git', args, spawnOptions).on('close', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(code)
        }
      })
    })
  }
  const gitVersion = checkGitVersion()
  if (!gitVersion) {
    return
  }
  const insideRepo = await execute(['rev-parse', '--is-inside-work-tree'], true).then(
    () => true,
    () => false,
  )
  if (insideRepo) {
    log.warn('Directory is already under version control. Skipping initialization of git.')
    return
  }
  const defaultBase = 'main'
  const [gitMajor, gitMinor] = gitVersion.split('.')

  if (+gitMajor > 2 || (+gitMajor === 2 && +gitMinor >= 28)) {
    await execute(['init', '-b', defaultBase])
  } else {
    await execute(['init'])
    await execute(['checkout', '-b', defaultBase]) // Git < 2.28 doesn't support -b on git init.
  }
  await execute(['add', '.'])
  const message = 'chore: initial commit'
  await execute(['commit', `-m "${message}"`])
}
