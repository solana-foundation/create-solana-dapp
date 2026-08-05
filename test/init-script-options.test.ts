import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GetArgsResult } from '../src/utils/get-args-result'
import { initScriptOptions, resolveInitScriptOptions } from '../src/utils/init-script-options'
import { initScriptRenameEntries } from '../src/utils/init-script-rename'
import { InitScriptOptions } from '../src/utils/init-script-schema'

vi.mock('../src/utils/init-script-rename', () => ({
  initScriptRenameEntries: vi.fn(),
}))

const options: InitScriptOptions = {
  llamacpp: {
    group: 'engine',
    instructions: ['Start llama.cpp'],
    rename: {
      __MODEL__: { in: ['request.json'], to: 'local-model' },
    },
  },
  ollama: {
    default: true,
    group: 'engine',
    instructions: ['Start Ollama'],
    rename: {
      __MODEL__: { in: ['request.json'], to: 'qwen3:0.6b' },
    },
  },
}

const args: GetArgsResult = {
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

describe('resolveInitScriptOptions', () => {
  it('selects the group default when no flag is requested', () => {
    expect(resolveInitScriptOptions(options, []).map((option) => option.name)).toEqual(['ollama'])
  })

  it('replaces the group default with the requested option', () => {
    expect(resolveInitScriptOptions(options, ['llamacpp']).map((option) => option.name)).toEqual(['llamacpp'])
  })

  it('rejects unknown and conflicting options', () => {
    expect(() => resolveInitScriptOptions(options, ['unknown'])).toThrow(
      'Template does not support --unknown. Available options: --llamacpp, --ollama.',
    )
    expect(() => resolveInitScriptOptions(options, ['ollama', 'llamacpp'])).toThrow(
      'Template options --ollama and --llamacpp are mutually exclusive',
    )
  })
})

describe('initScriptOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('applies selected renames and returns selected instructions', async () => {
    const instructions = await initScriptOptions({ ...args, templateOptions: ['llamacpp'] }, options)

    expect(initScriptRenameEntries).toHaveBeenCalledWith(expect.any(Object), options.llamacpp.rename)
    expect(instructions).toEqual(['Start llama.cpp'])
  })
})
