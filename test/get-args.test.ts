import { intro, log, outro } from '@clack/prompts'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchTemplateData } from '../src/utils/fetch-template-data'
import { getArgs } from '../src/utils/get-args'
import { getPrompts } from '../src/utils/get-prompts'
import { runVersionCheck } from '../src/utils/run-version-check'
import type { Template } from '../src/utils/template'
import type { TemplateJsonTemplate } from '../src/utils/template-schema'

vi.mock('@clack/prompts', () => ({
  intro: vi.fn(),
  log: {
    error: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    warning: vi.fn(),
  },
  outro: vi.fn(),
}))

vi.mock('../src/utils/fetch-template-data', () => ({
  fetchTemplateData: vi.fn(),
}))

vi.mock('../src/utils/get-prompts', () => ({
  getPrompts: vi.fn(),
}))

vi.mock('node:process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:process')>()
  return {
    ...actual,
    exit: vi.fn((code?: number) => {
      throw new Error(`process.exit(${code})`)
    }),
  }
})

vi.mock('../src/utils/run-version-check', () => ({
  runVersionCheck: vi.fn(),
}))

const app = { name: 'create-solana-dapp', version: '0.0.0' }
const template: TemplateJsonTemplate = {
  description: 'Basic template',
  id: 'gh:solana-foundation/templates/basic',
  keywords: [],
  name: 'basic',
  path: 'kit/basic',
}

describe('getArgs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetchTemplateData).mockResolvedValue({ items: [], templates: [template] })
    vi.mocked(getPrompts).mockResolvedValue({})
  })

  it('parses --templates-url as a URL value instead of a positional argument', async () => {
    let promptName = ''
    let promptTemplate: Template | undefined
    const url = 'https://example.com/templates.json'
    vi.mocked(getPrompts).mockImplementation(({ options }) => {
      promptName = options.name
      promptTemplate = options.template
      return Promise.resolve({
        name: options.name || 'prompted-app',
      })
    })

    const args = await getArgs(
      ['node', 'create-solana-dapp', '--templates-url', url, '--template', 'basic', '--skip-version-check'],
      app,
      'pnpm',
    )

    expect(fetchTemplateData).toHaveBeenCalledWith({
      config: expect.any(Array),
      url,
      verbose: false,
    })
    expect(promptName).toBe('')
    expect(promptTemplate).toBe(template)
    expect(args.name).toBe('prompted-app')
    expect(args.packageManagerExplicit).toBe(false)
    expect(args.targetDirectory).toBe(`${process.cwd()}/prompted-app`)
    expect(runVersionCheck).not.toHaveBeenCalled()
  })

  it('keeps existing non-interactive CLI option parsing behavior', async () => {
    const args = await getArgs(
      [
        'node',
        'create-solana-dapp',
        'my-app',
        '--template',
        'basic',
        '--pnpm',
        '--skip-git',
        '--skip-init',
        '--skip-install',
        '--skip-version-check',
      ],
      app,
      'npm',
    )

    expect(args).toMatchObject({
      app,
      dryRun: false,
      name: 'my-app',
      packageManager: 'pnpm',
      packageManagerExplicit: true,
      skipGit: true,
      skipInit: true,
      skipInstall: true,
      targetDirectory: `${process.cwd()}/my-app`,
      template,
      verbose: false,
    })
    expect(fetchTemplateData).toHaveBeenCalledWith({
      config: expect.any(Array),
      url: expect.stringContaining('templates.json'),
      verbose: false,
    })
    expect(intro).toHaveBeenCalledWith(`${app.name} ${app.version}`)
    expect(log.error).not.toHaveBeenCalled()
    expect(outro).not.toHaveBeenCalled()
    expect(runVersionCheck).not.toHaveBeenCalled()
  })

  it('collects template-defined boolean flags without registering them globally', async () => {
    const args = await getArgs(
      ['node', 'create-solana-dapp', 'my-app', '--template', 'basic', '--llamacpp', '--skip-version-check'],
      app,
    )

    expect(args.name).toBe('my-app')
    expect(args.templateOptions).toEqual(['llamacpp'])
    expect(args.template).toBe(template)
  })

  it('rejects an invalid positional project name', async () => {
    const message =
      'Please enter a valid project name (lowercase letters, numbers, and single dashes, starting with a letter)'

    await expect(
      getArgs(['node', 'create-solana-dapp', 'My_App', '--template', 'basic', '--skip-version-check'], app),
    ).rejects.toThrow(message)

    expect(log.error).toHaveBeenCalledWith(message)
    expect(fetchTemplateData).not.toHaveBeenCalled()
    expect(getPrompts).not.toHaveBeenCalled()
  })

  it('rejects a positional project name whose directory already exists', async () => {
    // The 'test' directory exists in the repo root, which is the cwd when running vitest
    await expect(
      getArgs(['node', 'create-solana-dapp', 'test', '--template', 'basic', '--skip-version-check'], app),
    ).rejects.toThrow('Directory already exists')

    expect(log.error).toHaveBeenCalledWith('Directory already exists')
    expect(fetchTemplateData).not.toHaveBeenCalled()
    expect(getPrompts).not.toHaveBeenCalled()
  })

  it('skips project name validation for informational list commands', async () => {
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})

    await expect(
      getArgs(['node', 'create-solana-dapp', 'My_App', '--list-template-ids', '--skip-version-check'], app),
    ).rejects.toThrow('process.exit(0)')

    expect(log.error).not.toHaveBeenCalled()
    expect(consoleLog).toHaveBeenCalledWith(JSON.stringify([template.id]))

    consoleLog.mockRestore()
  })

  it('parses positional and registered arguments after a template-defined flag', async () => {
    const args = await getArgs(
      [
        'node',
        'create-solana-dapp',
        '--llamacpp',
        'my-app',
        '--skip-install',
        '--template',
        'basic',
        '--skip-version-check',
      ],
      app,
    )

    expect(args).toMatchObject({
      name: 'my-app',
      skipInstall: true,
      template,
      templateOptions: ['llamacpp'],
    })
  })
})
