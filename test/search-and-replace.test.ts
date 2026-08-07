// test/search-and-replace.test.ts
import mockFs from 'mock-fs'
import { access, mkdir, mkdtemp, readdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { searchAndReplace, searchAndReplaceScopes } from '../src/utils/search-and-replace'

describe('searchAndReplace', () => {
  let tempDir: string

  beforeEach(async () => {
    // Create a temporary directory for each test
    tempDir = await mkdtemp(join(tmpdir(), 'search-replace-test-'))

    // Create a test file structure
    await mkdir(join(tempDir, 'subdir'))
    await writeFile(join(tempDir, 'file1.txt'), 'Hello world')
    await writeFile(join(tempDir, 'subdir', 'file2.txt'), 'Hello universe')
    await writeFile(join(tempDir, 'oldname.txt'), 'Old content')
  })

  afterEach(async () => {
    // Clean up the temporary directory after each test
    await rm(tempDir, { force: true, recursive: true })
  })

  it('should replace content and rename files in dry run mode without making changes', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log')

    await searchAndReplace(tempDir, ['Hello', 'oldname'], ['Hi', 'newname'], true, true)

    // Verify that no actual changes were made
    expect(await readFile(join(tempDir, 'file1.txt'), 'utf8')).toBe('Hello world')
    expect(await readFile(join(tempDir, 'subdir', 'file2.txt'), 'utf8')).toBe('Hello universe')
    expect(await readFile(join(tempDir, 'oldname.txt'), 'utf8')).toBe('Old content')

    // Check that the correct log messages were printed
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[Dry Run] File modified: '))
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[Dry Run] Renamed:'))
    expect(consoleLogSpy).toHaveBeenCalledWith('Dry run completed')

    consoleLogSpy.mockRestore()
  })

  it('should replace content and rename files in actual run mode', async () => {
    await searchAndReplace(tempDir, ['Hello', 'oldname'], ['Hi', 'newname'], false, true)

    // Check that the content in the files has been modified
    expect(await readFile(join(tempDir, 'file1.txt'), 'utf8')).toBe('Hi world')
    expect(await readFile(join(tempDir, 'subdir', 'file2.txt'), 'utf8')).toBe('Hi universe')
    expect(await readFile(join(tempDir, 'newname.txt'), 'utf8')).toBe('Old content')

    // Verify that the old file was renamed
    await expect(access(join(tempDir, 'oldname.txt'))).rejects.toThrow()
  })

  it('should replace content when the target is an individual file', async () => {
    const filePath = join(tempDir, 'file1.txt')

    await searchAndReplace(filePath, ['Hello'], ['Hi'])

    expect(await readFile(filePath, 'utf8')).toBe('Hi world')
  })

  it('should treat search values as literal strings', async () => {
    await writeFile(join(tempDir, 'foo.bar.txt'), 'foo.bar fooXbar')
    await writeFile(join(tempDir, 'fooXbar.txt'), 'fooXbar')

    await searchAndReplace(tempDir, ['foo.bar'], ['baz'], false, false)

    expect(await readFile(join(tempDir, 'baz.txt'), 'utf8')).toBe('baz fooXbar')
    expect(await readFile(join(tempDir, 'fooXbar.txt'), 'utf8')).toBe('fooXbar')
    await expect(access(join(tempDir, 'foo.bar.txt'))).rejects.toThrow()
  })

  it('should not replace inside text it just replaced', async () => {
    // https://github.com/solana-foundation/create-solana-dapp/issues/193
    // The template term is `counter` and the project is named `mycountergill`, so every
    // replacement value contains the term we are searching for. Each substitution must be
    // applied to the original content only, never to the output of an earlier substitution.
    await writeFile(join(tempDir, 'counter-ui.tsx'), "import { useCounterProgram } from './counter-data-access'\n")

    await searchAndReplace(
      tempDir,
      ['Counter', 'COUNTER', 'counter'],
      ['Mycountergill', 'MYCOUNTERGILL', 'mycountergill'],
    )

    expect(await readFile(join(tempDir, 'mycountergill-ui.tsx'), 'utf8')).toBe(
      "import { useMycountergillProgram } from './mycountergill-data-access'\n",
    )
  })

  it('should apply a duplicated substitution only once', async () => {
    // `namesValues()` returns five positional variants, and for a single lowercase word three of
    // them are identical. Repeating a substitution must not compound it.
    await writeFile(join(tempDir, 'counter.json'), '{"metadata":{"name":"counter"}}\n')

    await searchAndReplace(
      tempDir,
      ['counter', 'counter', 'counter'],
      ['mycountergill', 'mycountergill', 'mycountergill'],
    )

    expect(await readdir(tempDir)).toContain('mycountergill.json')
    expect(await readFile(join(tempDir, 'mycountergill.json'), 'utf8')).toBe('{"metadata":{"name":"mycountergill"}}\n')
  })

  it('should not let one substitution feed the next', async () => {
    await writeFile(join(tempDir, 'names.txt'), 'counter gill\n')

    await searchAndReplace(tempDir, ['counter', 'gill'], ['counter-gill', 'gill-sdk'])

    expect(await readFile(join(tempDir, 'names.txt'), 'utf8')).toBe('counter-gill gill-sdk\n')
  })

  it('should prefer the longest match when two search values overlap', async () => {
    await writeFile(join(tempDir, 'anchor.toml'), 'gill-next-tailwind-counter counter\n')

    await searchAndReplace(
      tempDir,
      ['counter', 'gill-next-tailwind-counter'],
      ['mycountergill', 'mycountergill-workspace'],
    )

    expect(await readFile(join(tempDir, 'anchor.toml'), 'utf8')).toBe('mycountergill-workspace mycountergill\n')
  })

  describe('searchAndReplaceScopes', () => {
    it('should apply overlapping scopes in a single pass', async () => {
      // The wide scope replaces a value that contains the narrow scope's search value
      await mkdir(join(tempDir, 'anchor'))
      await writeFile(join(tempDir, 'package.json'), '{"name":"gill-next-tailwind-counter"}\n')
      await writeFile(join(tempDir, 'anchor', 'Anchor.toml'), 'counter = "..."\n')

      await searchAndReplaceScopes([
        { fromStrings: ['gill-next-tailwind-counter'], path: tempDir, toStrings: ['mycountergill'] },
        { fromStrings: ['counter'], path: join(tempDir, 'package.json'), toStrings: ['mycountergill'] },
      ])

      expect(await readFile(join(tempDir, 'package.json'), 'utf8')).toBe('{"name":"mycountergill"}\n')
      expect(await readFile(join(tempDir, 'anchor', 'Anchor.toml'), 'utf8')).toBe('counter = "..."\n')
    })

    it('should let the narrowest scope win for the same search value', async () => {
      await mkdir(join(tempDir, 'app'))
      await writeFile(join(tempDir, 'app', 'model.json'), '{"model":"__MODEL__"}\n')
      await writeFile(join(tempDir, 'root.json'), '{"model":"__MODEL__"}\n')

      await searchAndReplaceScopes([
        { fromStrings: ['__MODEL__'], path: tempDir, toStrings: ['default-model'] },
        { fromStrings: ['__MODEL__'], path: join(tempDir, 'app'), toStrings: ['selected-model'] },
      ])

      expect(await readFile(join(tempDir, 'app', 'model.json'), 'utf8')).toBe('{"model":"selected-model"}\n')
      expect(await readFile(join(tempDir, 'root.json'), 'utf8')).toBe('{"model":"default-model"}\n')
    })

    it('should process a scope that explicitly targets a path inside an excluded directory', async () => {
      await mkdir(join(tempDir, 'tmp'))
      await writeFile(join(tempDir, 'tmp', 'config.json'), 'Hello excluded')

      await searchAndReplaceScopes([
        { fromStrings: ['Hello'], path: tempDir, toStrings: ['Hi'] },
        { fromStrings: ['Hello'], path: join(tempDir, 'tmp', 'config.json'), toStrings: ['Hey'] },
      ])

      // The explicit scope opts the excluded path in, and the narrower scope wins
      expect(await readFile(join(tempDir, 'tmp', 'config.json'), 'utf8')).toBe('Hey excluded')
      expect(await readFile(join(tempDir, 'file1.txt'), 'utf8')).toBe('Hi world')
    })

    it('should keep replacing other scopes when one does not exist', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await searchAndReplaceScopes([
        { fromStrings: ['Hello'], path: join(tempDir, 'missing'), toStrings: ['Hi'] },
        { fromStrings: ['Hello'], path: join(tempDir, 'file1.txt'), toStrings: ['Hi'] },
      ])

      expect(await readFile(join(tempDir, 'file1.txt'), 'utf8')).toBe('Hi world')
      expect(consoleErrorSpy).toHaveBeenCalledWith('An error occurred:', expect.any(Error))

      consoleErrorSpy.mockRestore()
    })
  })

  it('should exclude directories like node_modules and .git from processing', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log')

    // Create excluded directories
    await mkdir(join(tempDir, 'node_modules'))
    await mkdir(join(tempDir, '.git'))

    await searchAndReplace(tempDir, ['Hello'], ['Hi'], true, true)

    // Check that the excluded directories were logged and skipped
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Skipping excluded directory:'))

    consoleLogSpy.mockRestore()
  })

  it('should handle symbolic links and skip them', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log')

    // Create a symbolic link to a file
    const symlinkPath = join(tempDir, 'symlink.txt')
    await symlink(join(tempDir, 'file1.txt'), symlinkPath)

    await searchAndReplace(tempDir, ['Hello'], ['Hi'], true, true)

    // Check that the symbolic link was skipped
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Skipping symbolic link:'))

    consoleLogSpy.mockRestore()
  })

  it('should log replacement counts for each substitution', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log')

    await searchAndReplace(tempDir, ['Hello', 'Old'], ['Hi', 'New'], false, true)

    // Check that log shows correct counts for replacements
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Replaced "Hello" with "Hi" 1 time(s)'))
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Replaced "Old" with "New" 1 time(s)'))

    consoleLogSpy.mockRestore()
  })

  it('should handle errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Mock the file system and simulate an error for readFile
    mockFs({
      [tempDir]: {
        'file1.txt': mockFs.file({
          content: 'Hello world',
          mode: 0o000, // No read permissions, to trigger an error
        }),
      },
    })

    // Run searchAndReplace and expect it to handle the error without throwing
    await searchAndReplace(tempDir, ['Hello'], ['Hi'], false, true)

    // Verify that an error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error processing file'), expect.any(Error))

    // Restore the mocked file system and the console spy
    mockFs.restore()
    consoleErrorSpy.mockRestore()
  })
})
