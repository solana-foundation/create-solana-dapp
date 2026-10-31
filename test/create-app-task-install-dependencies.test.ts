import { existsSync } from 'node:fs'
import { access, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createAppTaskInstallDependencies } from '../src/utils/create-app-task-install-dependencies'
import type { GetArgsResult } from '../src/utils/get-args-result'
import { execAndWait } from '../src/utils/vendor/child-process-utils'
import { tasks } from '../src/utils/vendor/clack-tasks'
import * as packageManager from '../src/utils/vendor/package-manager'

const mockedFs = vi.hoisted(() => ({ disappearingPath: undefined as string | undefined }))

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>()
  return {
    ...actual,
    existsSync: vi.fn((path) => path === mockedFs.disappearingPath || actual.existsSync(path)),
  }
})

vi.mock('../src/utils/vendor/child-process-utils', () => ({
  execAndWait: vi.fn().mockResolvedValue({ code: 0, stdout: '' }),
}))

const temporaryDirectories: string[] = []

afterEach(async () => {
  mockedFs.disappearingPath = undefined
  vi.clearAllMocks()
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { force: true, recursive: true })))
})

describe('createAppTaskInstallDependencies', () => {
  it('skips package manager discovery when installation is disabled', async () => {
    const getCommand = vi.spyOn(packageManager, 'getPackageManagerCommand').mockImplementation(() => {
      throw new Error('Yarn is unavailable')
    })

    try {
      const task = createAppTaskInstallDependencies({ packageManager: 'yarn', skipInstall: true } as GetArgsResult)

      await expect(tasks([task])).resolves.toEqual([])
      expect(getCommand).not.toHaveBeenCalled()
      expect(execAndWait).not.toHaveBeenCalled()
    } finally {
      getCommand.mockRestore()
    }
  })

  it('still reports an unavailable package manager when installation runs', async () => {
    const getCommand = vi.spyOn(packageManager, 'getPackageManagerCommand').mockImplementation(() => {
      throw new Error('Yarn is unavailable')
    })

    try {
      const task = createAppTaskInstallDependencies({ packageManager: 'yarn', skipInstall: false } as GetArgsResult)

      await expect(task.task((value) => value)).rejects.toThrow('Yarn is unavailable')
      expect(execAndWait).not.toHaveBeenCalled()
    } finally {
      getCommand.mockRestore()
    }
  })

  it('removes lockfiles from other package managers without a shell command', async () => {
    const targetDirectory = await mkdtemp(join(tmpdir(), 'create-solana-dapp-install-'))
    temporaryDirectories.push(targetDirectory)
    const selectedLockFile = join(targetDirectory, 'package-lock.json')
    const staleLockFile = join(targetDirectory, 'pnpm-lock.yaml')
    await Promise.all([writeFile(selectedLockFile, ''), writeFile(staleLockFile, '')])

    const task = createAppTaskInstallDependencies({
      packageManager: 'npm',
      skipInstall: false,
      targetDirectory,
      verbose: false,
    } as GetArgsResult)

    await task.task((value) => value)

    expect(existsSync(selectedLockFile)).toBe(true)
    expect(existsSync(staleLockFile)).toBe(false)
    expect(execAndWait).toHaveBeenCalledOnce()
    expect(execAndWait).toHaveBeenCalledWith(expect.stringMatching(/^npm install /), targetDirectory)
  })

  it('continues installation when a stale lockfile disappears before removal', async () => {
    const targetDirectory = await mkdtemp(join(tmpdir(), 'create-solana-dapp-install-'))
    temporaryDirectories.push(targetDirectory)
    const selectedLockFile = join(targetDirectory, 'package-lock.json')
    const staleLockFile = join(targetDirectory, 'pnpm-lock.yaml')
    await writeFile(selectedLockFile, '')
    mockedFs.disappearingPath = staleLockFile

    const task = createAppTaskInstallDependencies({
      packageManager: 'npm',
      skipInstall: false,
      targetDirectory,
      verbose: false,
    } as GetArgsResult)

    await task.task((value) => value)

    await expect(access(selectedLockFile)).resolves.toBeUndefined()
    await expect(access(staleLockFile)).rejects.toThrow()
    expect(execAndWait).toHaveBeenCalledOnce()
    expect(execAndWait).toHaveBeenCalledWith(expect.stringMatching(/^npm install /), targetDirectory)
  })

  it('does not suppress unexpected lockfile removal errors', async () => {
    const targetDirectory = await mkdtemp(join(tmpdir(), 'create-solana-dapp-install-'))
    temporaryDirectories.push(targetDirectory)
    await mkdir(join(targetDirectory, 'pnpm-lock.yaml'))

    const task = createAppTaskInstallDependencies({
      packageManager: 'npm',
      skipInstall: false,
      targetDirectory,
      verbose: false,
    } as GetArgsResult)

    await expect(task.task((value) => value)).rejects.toThrow()
    expect(execAndWait).not.toHaveBeenCalled()
  })
})
