import { cancel } from '@clack/prompts'
import * as process from 'node:process'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { main } from '../src/index'
import { createApp } from '../src/utils/create-app'
import { getAppInfo } from '../src/utils/get-app-info'
import { getArgs } from '../src/utils/get-args'

vi.mock('@clack/prompts', () => ({
  cancel: vi.fn(),
  log: {
    warn: vi.fn(),
  },
  note: vi.fn(),
  outro: vi.fn(),
}))
vi.mock('node:process', async (importOriginal) => ({
  ...(await importOriginal<typeof import('node:process')>()),
  exit: vi.fn((code) => {
    throw new Error(`process.exit(${code})`)
  }),
}))
vi.mock('../src/utils/create-app', () => ({
  createApp: vi.fn(),
}))
vi.mock('../src/utils/get-app-info', () => ({
  getAppInfo: vi.fn(),
}))
vi.mock('../src/utils/get-args', () => ({
  getArgs: vi.fn(),
}))
vi.mock('../src/utils/vendor/package-manager', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/utils/vendor/package-manager')>()),
  detectInvokedPackageManager: vi.fn(() => 'npm'),
}))

describe('main', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getAppInfo).mockReturnValue({ name: 'test-app', version: '1.0.0' })
    vi.mocked(getArgs).mockResolvedValue({
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
    })
  })

  it.each([
    'Template requires bun, but bun is not installed',
    'Template requires bun, but npm was explicitly selected',
  ])('should exit with a non-zero code when %s', async (message) => {
    vi.mocked(createApp).mockRejectedValue(new Error(message))

    await expect(main(['node', 'create-solana-dapp'])).rejects.toThrow('process.exit(1)')

    expect(cancel).toHaveBeenCalledWith(`Error: ${message}`)
    expect(process.exit).toHaveBeenCalledWith(1)
  })
})
