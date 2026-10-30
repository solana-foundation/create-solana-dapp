import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAppTaskCloneTemplate } from '../src/utils/create-app-task-clone-template'
import { GetArgsResult } from '../src/utils/get-args-result'

describe('createAppTaskCloneTemplate: local templates', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'csd-local-template-'))
  })

  afterEach(async () => {
    await rm(tempDir, { force: true, recursive: true })
  })

  async function cloneTemplate(source: string) {
    const targetDirectory = join(tempDir, 'app')
    const result = vi.fn()

    await createAppTaskCloneTemplate({
      targetDirectory,
      template: { id: `local:${source}` },
      verbose: false,
    } as GetArgsResult).task(result)

    expect(result).toHaveBeenCalledWith({ message: `Cloned template to ${targetDirectory}` })
    return targetDirectory
  }

  it('copies templates whose ancestor directory contains an excluded name', async () => {
    const source = join(tempDir, 'target-templates', 'example')
    await mkdir(source, { recursive: true })
    await writeFile(join(source, 'package.json'), '{"name":"example"}')

    const target = await cloneTemplate(source)

    expect(await readFile(join(target, 'package.json'), 'utf8')).toBe('{"name":"example"}')
  })

  it('preserves files and directories that only contain excluded names as substrings', async () => {
    const source = join(tempDir, 'template')
    const files = [
      '.gitignore',
      join('.github', 'workflows', 'ci.yml'),
      join('district', 'index.ts'),
      'retarget.ts',
      'node_modules-guide.md',
    ]
    await mkdir(join(source, '.github', 'workflows'), { recursive: true })
    await mkdir(join(source, 'district'))
    for (const file of files) {
      await writeFile(join(source, file), file)
    }

    const target = await cloneTemplate(source)

    for (const file of files) {
      expect(await readFile(join(target, file), 'utf8')).toBe(file)
    }
  })

  it('skips exact build and dependency directory names at any depth', async () => {
    const source = join(tempDir, 'template')
    const excludedDirectories = ['node_modules', '.git', 'dist', 'target']
    for (const parent of ['', 'nested']) {
      for (const name of excludedDirectories) {
        const directory = join(source, parent, name)
        await mkdir(directory, { recursive: true })
        await writeFile(join(directory, 'ignored.txt'), 'ignored')
      }
    }
    await writeFile(join(source, 'package.json'), '{}')

    const target = await cloneTemplate(source)

    expect(await readFile(join(target, 'package.json'), 'utf8')).toBe('{}')
    for (const parent of ['', 'nested']) {
      for (const name of excludedDirectories) {
        await expect(readFile(join(target, parent, name, 'ignored.txt'))).rejects.toMatchObject({ code: 'ENOENT' })
      }
    }
  })

  it('copies an explicitly selected template named dist', async () => {
    const source = join(tempDir, 'dist')
    await mkdir(source)
    await writeFile(join(source, 'package.json'), '{}')

    const target = await cloneTemplate(source)

    expect(await readFile(join(target, 'package.json'), 'utf8')).toBe('{}')
  })
})
