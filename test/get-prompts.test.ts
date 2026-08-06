import { select, text } from '@clack/prompts'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GetArgsResult } from '../src/utils/get-args-result'
import { getPrompts } from '../src/utils/get-prompts'
import type { Template } from '../src/utils/template'
import type { MenuItem, TemplateJsonTemplate } from '../src/utils/template-schema'

// Keep the real `group` so the prompt order is actually exercised, and stub the individual prompts
vi.mock('@clack/prompts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@clack/prompts')>()
  return {
    ...actual,
    cancel: vi.fn(),
    log: { success: vi.fn() },
    select: vi.fn(),
    text: vi.fn(),
  }
})

const template: TemplateJsonTemplate = {
  description: 'A minimal template for building a Solana mobile app',
  id: 'gh:solana-mobile/templates/mobile/expo-kit-minimal',
  keywords: [],
  name: 'expo-kit-minimal',
  path: 'mobile/expo-kit-minimal',
}

const items: MenuItem[] = [
  {
    description: 'Solana Mobile Templates',
    id: 'solana-mobile',
    name: 'Solana Mobile',
    templates: [template],
  },
]

function getOptions(overrides: Partial<GetArgsResult> = {}): GetArgsResult {
  return {
    app: { name: 'create-solana-dapp', version: '0.0.0' },
    dryRun: false,
    name: '',
    packageManager: 'npm',
    skipGit: false,
    skipInit: false,
    skipInstall: false,
    targetDirectory: '',
    template: undefined as unknown as Template,
    verbose: false,
    ...overrides,
  }
}

function getTextOptions(call = 0) {
  return vi.mocked(text).mock.calls[call][0]
}

describe('getPrompts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('asks for the template before the name and pre-fills the name with the template name', async () => {
    vi.mocked(select).mockResolvedValueOnce(items[0]).mockResolvedValueOnce(template)
    vi.mocked(text).mockResolvedValueOnce(template.name)

    const result = await getPrompts({ items, options: getOptions() })

    expect(vi.mocked(select).mock.calls[0][0].message).toBe('Select a group')
    expect(vi.mocked(select).mock.calls[1][0].message).toBe('Select a template')
    expect(getTextOptions().message).toBe('Enter project name')
    // Both selects resolve before the name prompt is ever rendered
    expect(vi.mocked(text).mock.invocationCallOrder[0]).toBeGreaterThan(vi.mocked(select).mock.invocationCallOrder[1])
    expect(getTextOptions().initialValue).toBe('expo-kit-minimal')
    expect(result).toEqual({ name: 'expo-kit-minimal', template })
  })

  it('pre-fills the name with a template passed on the command line', async () => {
    vi.mocked(text).mockResolvedValueOnce(template.name)

    await getPrompts({ items, options: getOptions({ template }) })

    expect(select).not.toHaveBeenCalled()
    expect(getTextOptions().initialValue).toBe('expo-kit-minimal')
  })

  it('does not prompt for a name that was passed on the command line', async () => {
    vi.mocked(select).mockResolvedValueOnce(items[0]).mockResolvedValueOnce(template)

    const result = await getPrompts({ items, options: getOptions({ name: 'my-app' }) })

    expect(text).not.toHaveBeenCalled()
    expect(result).toEqual({ name: 'my-app', template })
  })

  // `findTemplate` keeps the raw reference as the name for external and local templates
  it.each([
    ['an external template', 'solana-labs/dapp-kit', 'dapp-kit'],
    ['a qualified external template', 'gh:solana-labs/dapp-kit', 'dapp-kit'],
    ['a relative local template', './my-template', 'my-template'],
    ['a parent-relative local template', '../shared/my-template', 'my-template'],
    ['an absolute local template', '/Users/bee/dev/my-template', 'my-template'],
    ['a trailing slash', 'solana-labs/dapp-kit/', 'dapp-kit'],
  ])('pre-fills the name with the last path segment of %s', async (_, name, expected) => {
    vi.mocked(text).mockResolvedValueOnce(expected)

    await getPrompts({ items, options: getOptions({ template: { ...template, name } }) })

    expect(getTextOptions().initialValue).toBe(expected)
  })

  it.each([
    ['a segment that is not a usable directory name', './my.template'],
    ['a path with no usable segment', '../'],
  ])('leaves the name empty rather than proposing %s', async (_, name) => {
    vi.mocked(text).mockResolvedValueOnce('my-app')

    await getPrompts({ items, options: getOptions({ template: { ...template, name } }) })

    expect(getTextOptions().initialValue).toBeUndefined()
  })
})
