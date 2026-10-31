import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createAppTaskRunOptionScript } from '../src/utils/create-app-task-run-option-script'
import type { GetArgsResult } from '../src/utils/get-args-result'

const temporaryDirectories: string[] = []

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { force: true, recursive: true })))
})

describe('template option script arguments', () => {
  it.each([
    ['npm', 'reset-project -- --yes', ['--yes']],
    ['npm', 'reset-project --yes', ['--yes']],
    ['pnpm', 'reset-project -- --yes', ['--yes']],
    ['pnpm', 'reset-project --yes', ['--yes']],
    ['npm', 'reset-project -- -- --yes', ['--', '--yes']],
    ['pnpm', 'reset-project -- -- --yes', ['--', '--yes']],
  ] as const)('preserves script arguments with %s run %s', async (packageManager, run, expectedArguments) => {
    const targetDirectory = await mkdtemp(join(tmpdir(), 'create-solana-dapp-option-'))
    temporaryDirectories.push(targetDirectory)
    await writeFile(
      join(targetDirectory, 'package.json'),
      JSON.stringify({
        name: 'option-arguments-fixture',
        private: true,
        scripts: { 'reset-project': 'node receive.cjs' },
      }),
    )
    await writeFile(
      join(targetDirectory, 'receive.cjs'),
      `const { parseArgs } = require('node:util');
const { writeFileSync } = require('node:fs');
const { values } = parseArgs({ options: { yes: { type: 'boolean' } }, strict: true, allowPositionals: true });
writeFileSync('received.json', JSON.stringify({ argv: process.argv.slice(2), yes: values.yes }));
`,
    )

    const task = createAppTaskRunOptionScript(
      { packageManager, skipInit: false, targetDirectory, verbose: false } as GetArgsResult,
      [{ name: 'reset-project', value: { run } }],
    )
    await task.task((value) => value)

    expect(JSON.parse(await readFile(join(targetDirectory, 'received.json'), 'utf8'))).toEqual({
      argv: expectedArguments,
      ...(expectedArguments.length === 1 ? { yes: true } : {}),
    })
  })
})
