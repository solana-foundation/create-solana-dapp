import { log } from '@clack/prompts'
import { fs, vol } from 'memfs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GetArgsResult } from '../src/utils/get-args-result'
import { getPackageJson } from '../src/utils/get-package-json'
import { initScriptDelete } from '../src/utils/init-script-delete'
import { initScriptKey } from '../src/utils/init-script-schema'

vi.mock('node:fs')

vi.mock('@clack/prompts', () => ({
  log: {
    warn: vi.fn(),
  },
}))

describe('initScriptDelete', () => {
  const targetDirectory = '/template'
  const packageJsonPath = `${targetDirectory}/package.json`

  beforeEach(() => {
    vol.reset()
  })

  const baseArgs: GetArgsResult = {
    app: { name: 'test-app', version: '1.0.0' },
    dryRun: false,
    name: 'test-project',
    packageManager: 'npm',
    skipGit: false,
    skipInit: false,
    skipInstall: false,
    targetDirectory: '/template',
    template: { description: 'description', name: 'basic', repository: '/template' },
    verbose: true,
  }

  it('should remove the init script key from package.json', () => {
    const packageJsonContent = {
      [initScriptKey]: { someKey: 'someValue' },
      name: 'my-app',
    }

    fs.mkdirSync(targetDirectory, { recursive: true })
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent))

    initScriptDelete(baseArgs)

    const { contents: updatedContents, path: updatedPath } = getPackageJson(targetDirectory)

    expect(updatedPath).toBe(packageJsonPath)
    expect(updatedContents).not.toHaveProperty(initScriptKey)
  })

  it('should not throw error if init script key does not exist', () => {
    const packageJsonContent = {
      name: 'my-app',
    }

    fs.mkdirSync(targetDirectory, { recursive: true })
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent))

    initScriptDelete(baseArgs)

    const { contents: updatedContents, path: updatedPath } = getPackageJson(targetDirectory)

    expect(updatedPath).toBe(packageJsonPath)
    expect(updatedContents).toEqual(packageJsonContent)
  })

  it('should log message when verbose', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const packageJsonContent = {
      [initScriptKey]: { someKey: 'someValue' },
      name: 'my-app',
    }

    fs.mkdirSync(targetDirectory, { recursive: true })
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent))

    initScriptDelete(baseArgs)

    expect(log.warn).toHaveBeenCalledWith(`initScriptDelete: deleted ${initScriptKey} from package.json`)
    consoleLogSpy.mockRestore()
  })
})
