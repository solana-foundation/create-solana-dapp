import { log } from '@clack/prompts'
import { fs, vol } from 'memfs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GetArgsResult } from '../src/utils/get-args-result'
import { initScriptPackageManager } from '../src/utils/init-script-package-manager'
import { initScriptKey } from '../src/utils/init-script-schema'
import { getPackageManagerVersion } from '../src/utils/vendor/package-manager'

vi.mock('node:fs')
vi.mock('../src/utils/vendor/package-manager', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/utils/vendor/package-manager')>()),
  getPackageManagerVersion: vi.fn(),
}))
vi.mock('@clack/prompts', () => ({
  log: {
    error: vi.fn(),
  },
}))

describe('initScriptPackageManager', () => {
  const targetDirectory = '/template'
  const packageJsonPath = `${targetDirectory}/package.json`

  const baseArgs: GetArgsResult = {
    app: { name: 'test-app', version: '1.0.0' },
    dryRun: false,
    name: 'test-project',
    packageManager: 'npm',
    packageManagerExplicit: false,
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
    vi.mocked(getPackageManagerVersion).mockReturnValue('1.2.3')
  })

  it('should keep the selected package manager when the template does not require one', () => {
    writePackageJson()
    const args = { ...baseArgs }

    initScriptPackageManager(args)

    expect(args.packageManager).toBe('npm')
    expect(getPackageManagerVersion).not.toHaveBeenCalled()
  })

  it('should override the invoked package manager with the template requirement', () => {
    writePackageJson('bun')
    const args = { ...baseArgs }

    initScriptPackageManager(args)

    expect(args.packageManager).toBe('bun')
    expect(getPackageManagerVersion).toHaveBeenCalledWith('bun', targetDirectory)
  })

  it('should allow explicitly selecting the package manager required by the template', () => {
    writePackageJson('bun')
    const args = { ...baseArgs, packageManager: 'bun' as const, packageManagerExplicit: true }

    initScriptPackageManager(args)

    expect(args.packageManager).toBe('bun')
    expect(getPackageManagerVersion).toHaveBeenCalledWith('bun', targetDirectory)
  })

  it('should reject an explicitly selected package manager that conflicts with the template', () => {
    writePackageJson('bun')
    const args = { ...baseArgs, packageManagerExplicit: true }

    expect(() => initScriptPackageManager(args)).toThrow('Template requires bun, but npm was explicitly selected')
    expect(args.packageManager).toBe('npm')
    expect(getPackageManagerVersion).not.toHaveBeenCalled()
  })

  it('should treat an omitted selection flag as explicit for programmatic callers', () => {
    writePackageJson('bun')
    const args: GetArgsResult = { ...baseArgs }
    delete args.packageManagerExplicit

    expect(() => initScriptPackageManager(args)).toThrow('Template requires bun, but npm was explicitly selected')
    expect(args.packageManager).toBe('npm')
    expect(getPackageManagerVersion).not.toHaveBeenCalled()
  })

  it('should reject a template package manager that is not available', () => {
    writePackageJson('bun')
    vi.mocked(getPackageManagerVersion).mockImplementation(() => {
      throw new Error('command not found')
    })
    const args = { ...baseArgs }

    expect(() => initScriptPackageManager(args)).toThrow('Template requires bun, but bun is not available')
    expect(args.packageManager).toBe('npm')
  })

  it('should log the package manager error in verbose mode', () => {
    writePackageJson('bun')
    vi.mocked(getPackageManagerVersion).mockImplementation(() => {
      throw new Error('spawnSync /bin/sh ENOENT')
    })
    const args = { ...baseArgs, verbose: true }

    expect(() => initScriptPackageManager(args)).toThrow('Template requires bun, but bun is not available')
    expect(log.error).toHaveBeenCalledWith('Error checking bun availability: Error: spawnSync /bin/sh ENOENT')
  })

  function writePackageJson(packageManager?: string) {
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify({
        ...(packageManager ? { [initScriptKey]: { packageManager } } : {}),
        name: 'my-app',
      }),
    )
  }
})
