// test/init-script-rename-files.test.ts
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GetArgsResult } from '../src/utils/get-args-result'
import { initScriptRename } from '../src/utils/init-script-rename'
import { InitScriptRename } from '../src/utils/init-script-schema'

vi.mock('@clack/prompts', () => ({ log: { error: vi.fn(), warn: vi.fn() } }))

// Mirrors the layout of the `counter` templates from https://github.com/solana-foundation/templates
const templateName = 'gill-next-tailwind-counter'
const templateRename: InitScriptRename = { counter: { in: ['anchor', 'src'], to: '{{name}}' } }

async function listFiles(directory: string, root = directory): Promise<string[]> {
  const files: string[] = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name)
    files.push(...(entry.isDirectory() ? await listFiles(fullPath, root) : [relative(root, fullPath)]))
  }
  return files.sort()
}

describe('initScriptRename on the file system', () => {
  let tempDir: string

  async function writePackageJson(rename: InitScriptRename) {
    await writeFile(
      join(tempDir, 'package.json'),
      `${JSON.stringify({ 'create-solana-dapp': { rename }, name: templateName }, undefined, 2)}\n`,
    )
  }

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'init-script-rename-'))
    await mkdir(join(tempDir, 'anchor/programs/counter/src'), { recursive: true })
    await mkdir(join(tempDir, 'src/components/counter'), { recursive: true })
    await writePackageJson(templateRename)
    await writeFile(join(tempDir, 'anchor/programs/counter/Cargo.toml'), '[package]\nname = "counter"\n')
    await writeFile(join(tempDir, 'anchor/programs/counter/src/lib.rs'), '#[program]\npub mod counter {}\n')
    await writeFile(
      join(tempDir, 'src/components/counter/counter-ui.tsx'),
      "import { useCounterProgram } from './counter-data-access'\n\nexport function CounterCreate() {}\n",
    )
  })

  afterEach(async () => {
    await rm(tempDir, { force: true, recursive: true })
  })

  function argsFor(name: string): GetArgsResult {
    return {
      app: { name: 'create-solana-dapp', version: '0.0.0' },
      dryRun: false,
      name,
      packageManager: 'pnpm',
      skipGit: false,
      skipInit: false,
      skipInstall: false,
      targetDirectory: tempDir,
      template: { description: templateName, name: templateName, repository: templateName },
      verbose: false,
    }
  }

  it('should rename a template term that the project name contains', async () => {
    // https://github.com/solana-foundation/create-solana-dapp/issues/193
    // The project name contains the template term `counter`, so every replacement value contains
    // the search term. Nothing may be replaced twice.
    await initScriptRename(argsFor('mycountergill'), templateRename)

    expect(await listFiles(tempDir)).toStrictEqual([
      'anchor/programs/mycountergill/Cargo.toml',
      'anchor/programs/mycountergill/src/lib.rs',
      'package.json',
      'src/components/mycountergill/mycountergill-ui.tsx',
    ])
    expect(await readFile(join(tempDir, 'src/components/mycountergill/mycountergill-ui.tsx'), 'utf8')).toBe(
      "import { useMycountergillProgram } from './mycountergill-data-access'\n\nexport function MycountergillCreate() {}\n",
    )
  })

  it('should apply overlapping rename scopes in a single pass', async () => {
    // The package.json rename covers the whole project and this entry covers package.json again.
    // The template name contains the entry term, so the entry must not rewrite what the
    // package.json rename already replaced.
    const rename: InitScriptRename = { counter: { in: ['anchor', 'package.json'], to: '{{name}}' } }
    await writePackageJson(rename)

    await initScriptRename(argsFor('mycountergill'), rename)

    const contents = JSON.parse(await readFile(join(tempDir, 'package.json'), 'utf8'))
    expect(contents.name).toBe('mycountergill')
    expect(await readFile(join(tempDir, 'anchor/programs/mycountergill/Cargo.toml'), 'utf8')).toBe(
      '[package]\nname = "mycountergill"\n',
    )
  })

  it('should rename a template term that a project name does not contain', async () => {
    await initScriptRename(argsFor('journal'), templateRename)

    expect(await readFile(join(tempDir, 'src/components/journal/journal-ui.tsx'), 'utf8')).toBe(
      "import { useJournalProgram } from './journal-data-access'\n\nexport function JournalCreate() {}\n",
    )
  })
})
