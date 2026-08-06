import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAppTaskRunInitScript } from '../src/utils/create-app-task-run-init-script'
import { GetArgsResult } from '../src/utils/get-args-result'
import { initScriptDelete } from '../src/utils/init-script-delete'
import { initScriptOptions } from '../src/utils/init-script-options'
import { initScriptRename } from '../src/utils/init-script-rename'
import { InitScript } from '../src/utils/init-script-schema'
import { initScriptVersion } from '../src/utils/init-script-version'

vi.mock('../src/utils/init-script-delete', () => ({ initScriptDelete: vi.fn() }))
vi.mock('../src/utils/init-script-options', () => ({ initScriptOptions: vi.fn() }))
vi.mock('../src/utils/init-script-rename', () => ({ initScriptRename: vi.fn() }))
vi.mock('../src/utils/init-script-version', () => ({ initScriptVersion: vi.fn() }))
vi.mock('@clack/prompts', () => ({
  log: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

describe('createAppTaskRunInitScript', () => {
  const args: GetArgsResult = {
    app: { name: 'test-app', version: '1.0.0' },
    dryRun: false,
    name: 'test-project',
    packageManager: 'pnpm',
    skipGit: false,
    skipInit: false,
    skipInstall: false,
    targetDirectory: '/template',
    template: { description: 'description', name: 'basic', repository: '/template' },
    verbose: false,
  }

  const init: InitScript = {
    instructions: ['Run {pm} install'],
    rename: { placeholder: { in: ['src'], to: 'test-project' } },
  }

  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(initScriptOptions).mockResolvedValue(['Option instruction'])
  })

  it('is skipped when the init script is skipped', () => {
    expect(createAppTaskRunInitScript({ ...args, skipInit: true }, init, []).enabled).toBe(false)
  })

  it('reports nothing to do when the template has no init script', async () => {
    const result = await createAppTaskRunInitScript(args, undefined, []).task((value) => value)

    expect(result).toEqual({ message: 'Init script not found' })
    expect(initScriptRename).not.toHaveBeenCalled()
  })

  /**
   * The option scripts run before this task and may rewrite package.json, so the init script has to
   * come from the snapshot taken before they ran rather than from disk. Nothing is written to the
   * mocked filesystem here: a task that reads package.json again would throw instead.
   */
  it('applies the snapshot without reading package.json again', async () => {
    const result = await createAppTaskRunInitScript(args, init, [])

    const value = await result.task((input) => input)

    expect(initScriptVersion).toHaveBeenCalledWith(init.versions, false)
    expect(initScriptRename).toHaveBeenCalledWith(args, init.rename, false)
    expect(initScriptDelete).toHaveBeenCalledWith(args)
    expect(value).toEqual({
      instructions: ['Option instruction', 'Run pnpm install'],
      message: 'Init script done',
    })
  })
})
