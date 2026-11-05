import { fs, vol } from 'memfs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAppTaskRunOptionScript } from '../src/utils/create-app-task-run-option-script'
import { GetArgsResult } from '../src/utils/get-args-result'
import { SelectedTemplateOption } from '../src/utils/init-script-options'
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

describe('createAppTaskRunOptionScript', () => {
  const targetDirectory = '/template'

  const args: GetArgsResult = {
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

  const resetProject: SelectedTemplateOption = {
    name: 'reset-project',
    value: { run: 'reset-project -- --yes' },
  }

  function writePackageJson(scripts: Record<string, string>) {
    fs.mkdirSync(targetDirectory, { recursive: true })
    fs.writeFileSync(`${targetDirectory}/package.json`, JSON.stringify({ name: 'template', scripts }))
  }

  beforeEach(() => {
    vi.resetAllMocks()
    vol.reset()
  })

  it('is disabled when no selected option declares a script', () => {
    const task = createAppTaskRunOptionScript(args, [{ name: 'keep-example', value: { instructions: ['Keep it'] } }])

    expect(task.enabled).toBe(false)
  })

  it('is disabled when the init script is skipped', () => {
    const task = createAppTaskRunOptionScript({ ...args, skipInit: true }, [resetProject])

    expect(task.enabled).toBe(false)
  })

  it.each([
    ['npm', 'npm run -- reset-project --yes'],
    ['pnpm', 'pnpm run -- reset-project --yes'],
    ['yarn', 'yarn run -- reset-project --yes'],
    ['bun', 'bun run -- reset-project --yes'],
  ] as const)('runs the declared script with %s', async (packageManager, expectedCommand) => {
    writePackageJson({ 'reset-project': 'node ./scripts/reset-project.js' })
    vi.mocked(execAndWait).mockResolvedValue({ code: 0, stdout: '' })

    const task = createAppTaskRunOptionScript({ ...args, packageManager }, [resetProject])
    const result = await task.task((value) => value)

    expect(execAndWait).toHaveBeenCalledWith(expectedCommand, targetDirectory)
    expect(result).toEqual({ message: 'Ran --reset-project' })
  })

  it.each([
    ['npm', 'npm run -- reset-project -- --yes'],
    ['pnpm', 'pnpm run -- reset-project -- --yes'],
    ['yarn', 'yarn run -- reset-project -- --yes'],
    ['bun', 'bun run -- reset-project -- -- --yes'],
  ] as const)('preserves a literal script separator with %s', async (packageManager, expectedCommand) => {
    writePackageJson({ 'reset-project': 'node ./scripts/reset-project.js' })
    vi.mocked(execAndWait).mockResolvedValue({ code: 0, stdout: '' })

    const task = createAppTaskRunOptionScript({ ...args, packageManager }, [
      { name: 'reset-project', value: { run: 'reset-project -- -- --yes' } },
    ])
    await task.task((value) => value)

    expect(execAndWait).toHaveBeenCalledWith(expectedCommand, targetDirectory)
  })

  it('collapses whitespace in the run value so the arguments reach the shell as one command', async () => {
    writePackageJson({ 'reset-project': 'node ./scripts/reset-project.js' })
    vi.mocked(execAndWait).mockResolvedValue({ code: 0, stdout: '' })

    // A newline would otherwise end the command and run the arguments as a second one
    const task = createAppTaskRunOptionScript(args, [
      { name: 'reset-project', value: { run: ' reset-project\t--\n--yes  --force ' } },
    ])
    await task.task((value) => value)

    expect(execAndWait).toHaveBeenCalledWith('npm run -- reset-project --yes --force', targetDirectory)
  })

  it('fails when the template does not declare the script', async () => {
    writePackageJson({ build: 'next build' })

    const task = createAppTaskRunOptionScript(args, [resetProject])

    await expect(task.task((value) => value)).rejects.toThrow(
      'Template option --reset-project requires a "reset-project" script in package.json',
    )
    expect(execAndWait).not.toHaveBeenCalled()
  })
})
