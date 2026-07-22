import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp } from '../src/utils/create-app'
import { createAppTaskInstallDependencies } from '../src/utils/create-app-task-install-dependencies'
import { GetArgsResult } from '../src/utils/get-args-result'
import { initScriptPackageManager } from '../src/utils/init-script-package-manager'
import { tasks } from '../src/utils/vendor/clack-tasks'

vi.mock('../src/utils/create-app-task-install-dependencies', () => ({
  createAppTaskInstallDependencies: vi.fn((args: GetArgsResult) => ({
    task: vi.fn(),
    title: `Installing via ${args.packageManager}`,
  })),
}))
vi.mock('../src/utils/init-script-package-manager', () => ({
  initScriptPackageManager: vi.fn(),
}))
vi.mock('../src/utils/vendor/clack-tasks', () => ({
  taskFail: vi.fn(),
  tasks: vi.fn(),
}))

describe('createApp', () => {
  const args: GetArgsResult = {
    app: { name: 'test-app', version: '1.0.0' },
    dryRun: false,
    name: 'test-project',
    packageManager: 'npm',
    packageManagerExplicit: false,
    skipGit: false,
    skipInit: false,
    skipInstall: false,
    targetDirectory: '/template',
    template: { description: 'description', name: 'basic', repository: '/template' },
    verbose: false,
  }

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should resolve the template package manager after cloning and before creating install tasks', async () => {
    vi.mocked(tasks).mockResolvedValueOnce(['clone instruction']).mockResolvedValueOnce(['remaining instruction'])
    vi.mocked(initScriptPackageManager).mockImplementation((args) => {
      args.packageManager = 'bun'
    })

    const result = await createApp({ ...args })

    expect(vi.mocked(tasks).mock.calls[0][0]).toHaveLength(1)
    expect(vi.mocked(tasks).mock.calls[0][0][0].title).toBe('Cloning template')
    expect(initScriptPackageManager).toHaveBeenCalledOnce()
    expect(createAppTaskInstallDependencies).toHaveBeenCalledWith(expect.objectContaining({ packageManager: 'bun' }))
    expect(vi.mocked(tasks).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(initScriptPackageManager).mock.invocationCallOrder[0],
    )
    expect(vi.mocked(initScriptPackageManager).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(createAppTaskInstallDependencies).mock.invocationCallOrder[0],
    )
    expect(result).toEqual(['clone instruction', 'remaining instruction'])
  })
})
