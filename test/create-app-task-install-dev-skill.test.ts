import { log } from '@clack/prompts'
import { fs, vol } from 'memfs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAppTaskInstallDevSkill } from '../src/utils/create-app-task-install-dev-skill'
import { GetArgsResult } from '../src/utils/get-args-result'
import { initScriptKey } from '../src/utils/init-script-schema'
import { execAndWait } from '../src/utils/vendor/child-process-utils'

vi.mock('node:fs')
vi.mock('../src/utils/vendor/child-process-utils', () => ({
  execAndWait: vi.fn(),
}))
vi.mock('@clack/prompts', () => ({
  log: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

describe('createAppTaskInstallDevSkill', () => {
  const targetDirectory = '/template'
  const packageJsonPath = `${targetDirectory}/package.json`

  const baseArgs: GetArgsResult = {
    app: { name: 'test-app', version: '1.0.0' },
    dryRun: false,
    name: 'test-project',
    packageManager: 'npm',
    skipGit: false,
    skipInit: false,
    skipInstall: false,
    targetDirectory,
    template: { description: 'description', name: 'basic', repository: '/template' },
    verbose: false,
  }

  beforeEach(() => {
    vi.resetAllMocks()
    vol.reset()
    fs.mkdirSync(targetDirectory, { recursive: true })
    vi.mocked(execAndWait).mockResolvedValue({ code: 0, stdout: '' })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should install the default skill when skills is not set', async () => {
    writePackageJson()

    const result = await runTask()

    expect(result).toEqual({ message: 'Installed skill' })
    expect(execAndWait).toHaveBeenCalledWith(
      `npx -y skills add 'https://github.com/solana-foundation/solana-dev-skill' --skill "*" -y`,
      targetDirectory,
    )
  })

  it('should install configured skills instead of the default skill', async () => {
    writePackageJson({
      skills: ['https://github.com/example/alpha-skill', 'https://github.com/example/beta-skill'],
    })

    const result = await runTask()

    expect(result).toEqual({ message: 'Installed skills' })
    expect(execAndWait).toHaveBeenCalledTimes(2)
    expect(execAndWait).toHaveBeenNthCalledWith(
      1,
      `npx -y skills add 'https://github.com/example/alpha-skill' --skill "*" -y`,
      targetDirectory,
    )
    expect(execAndWait).toHaveBeenNthCalledWith(
      2,
      `npx -y skills add 'https://github.com/example/beta-skill' --skill "*" -y`,
      targetDirectory,
    )
  })

  it('should skip skill installation when skills is empty', async () => {
    writePackageJson({ skills: [] })

    const result = await runTask()

    expect(result).toEqual({ message: 'Skipped skill installation' })
    expect(execAndWait).not.toHaveBeenCalled()
  })

  it('should continue after a skill install fails', async () => {
    writePackageJson({
      skills: ['https://github.com/example/alpha-skill', 'https://github.com/example/beta-skill'],
    })
    vi.mocked(execAndWait).mockRejectedValueOnce(new Error('install failed'))

    const result = await runTask({ ...baseArgs, verbose: true })

    expect(result).toEqual({ message: 'Installed 1/2 skills' })
    expect(execAndWait).toHaveBeenCalledTimes(2)
    expect(log.error).toHaveBeenCalledWith(
      'Error installing skill https://github.com/example/alpha-skill: Error: install failed',
    )
  })

  it('should report when all skill installs fail', async () => {
    writePackageJson({
      skills: ['https://github.com/example/alpha-skill', 'https://github.com/example/beta-skill'],
    })
    vi.mocked(execAndWait).mockRejectedValue(new Error('install failed'))

    const result = await runTask()

    expect(result).toEqual({ message: 'Failed to install skills' })
  })

  it('should use Windows-compatible quotes on Windows', async () => {
    vi.spyOn(process, 'platform', 'get').mockReturnValue('win32')
    writePackageJson()

    await runTask()

    expect(execAndWait).toHaveBeenCalledWith(
      `npx -y skills add "https://github.com/solana-foundation/solana-dev-skill" --skill "*" -y`,
      targetDirectory,
    )
  })

  it('should disable the task when install is skipped', () => {
    const task = createAppTaskInstallDevSkill({ ...baseArgs, skipInstall: true })

    expect(task.enabled).toBe(false)
  })

  async function runTask(args = baseArgs) {
    return createAppTaskInstallDevSkill(args).task((value) => value)
  }

  function writePackageJson(init?: unknown) {
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify({
        ...(init === undefined ? {} : { [initScriptKey]: init }),
        name: 'my-app',
      }),
    )
  }
})
