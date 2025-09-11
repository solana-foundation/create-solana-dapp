import { log } from '@clack/prompts'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ensureTargetPath } from '../src/utils/ensure-target-path'
import { GetArgsResult } from '../src/utils/get-args-result'
import { getPackageJson } from '../src/utils/get-package-json'
import { initScriptRename } from '../src/utils/init-script-rename'
import { searchAndReplace } from '../src/utils/search-and-replace'
import { namesValues } from '../src/utils/vendor/names'

vi.mock('../src/utils/ensure-target-path')
vi.mock('../src/utils/get-package-json')
vi.mock('../src/utils/search-and-replace')
vi.mock('../src/utils/vendor/names')
vi.mock('@clack/prompts', () => ({
  log: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

describe('initScriptRename', () => {
  const packageJsonName = 'template-project'

  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(getPackageJson).mockReturnValue({
      contents: { name: packageJsonName },
      path: `${baseArgs.targetDirectory}/package.json`,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    consoleErrorSpy.mockClear()
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
    verbose: false,
  }

  it('should rename the project based on package.json name', async () => {
    const args = { ...baseArgs }

    await initScriptRename(args)

    expect(searchAndReplace).toHaveBeenCalledWith(args.targetDirectory, [packageJsonName], [args.name], false, false)
  })

  it('should return early if no rename object is provided', async () => {
    const args = { ...baseArgs }

    await initScriptRename(args, undefined)

    expect(searchAndReplace).toHaveBeenCalledTimes(1)
    expect(log.warn).not.toHaveBeenCalled()
  })

  it('should perform search and replace based on rename instructions', async () => {
    const args = { ...baseArgs, verbose: true }
    const rename = {
      example: {
        paths: ['some/path/to/file'],
        to: '{{name}}Example',
      },
    }
    const exampleNames = ['Example']
    const newNameExamples = ['newprojectExample']
    vi.mocked(namesValues).mockImplementation((name) => (name === 'example' ? exampleNames : newNameExamples))
    vi.mocked(ensureTargetPath).mockResolvedValue(true)

    await initScriptRename(args, rename)

    expect(searchAndReplace).toHaveBeenCalledWith(
      expect.stringContaining('some/path/to/file'),
      exampleNames,
      newNameExamples,
      args.dryRun,
      args.verbose,
    )
  })

  it('should log a message when verbose and no rename object is provided', async () => {
    const args: GetArgsResult = { ...baseArgs, verbose: true }
    await initScriptRename(args, undefined)
    expect(log.warn).toHaveBeenCalledWith('initScriptRename: no renames found')
  })

  it('should log a message for each rename operation when verbose', async () => {
    const args = { ...baseArgs, verbose: true }
    const rename = {
      example: {
        paths: ['some/path/to/file'],
        to: '{{name}}Example',
      },
    }

    const exampleNames = ['Example']
    const newNameExamples = ['testprojectExample']
    vi.mocked(namesValues).mockImplementation((name) => (name === 'example' ? exampleNames : newNameExamples))
    vi.mocked(ensureTargetPath).mockResolvedValue(true)

    await initScriptRename(args, rename)

    expect(log.warn).toHaveBeenCalledWith(
      expect.stringContaining('initScriptRename: /template/some/path/to/file -> Example -> testprojectExample'),
    )
    expect(log.warn).toHaveBeenCalledWith('initScriptRename: done')
  })

  it('should log an error if a target path in rename does not exist', async () => {
    const args = { ...baseArgs, verbose: true }
    const rename = {
      example: {
        paths: ['nonexistent/path/to/file'],
        to: '{{name}}Example',
      },
    }

    vi.mocked(namesValues).mockReturnValue(['Example'])
    vi.mocked(ensureTargetPath).mockResolvedValue(false) // Simulate nonexistent path

    await initScriptRename(args, rename)

    expect(log.error).toHaveBeenCalledWith(`initScriptRename: target does not exist /template/nonexistent/path/to/file`)
    //been called once for the package.json rename
    expect(searchAndReplace).toHaveBeenCalledTimes(1)
  })
})
