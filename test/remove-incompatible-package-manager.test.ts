import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { GetArgsResult } from '../src/utils/get-args-result'
import { initScriptPackageManager } from '../src/utils/init-script-package-manager'
import { initScriptKey } from '../src/utils/init-script-schema'
import { removeIncompatiblePackageManager } from '../src/utils/remove-incompatible-package-manager'

describe('removeIncompatiblePackageManager', () => {
  let dir: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'csd-pm-'))
  })

  afterEach(() => {
    rmSync(dir, { force: true, recursive: true })
  })

  function writePackageJson(pkg: Record<string, unknown>) {
    writeFileSync(join(dir, 'package.json'), JSON.stringify(pkg, undefined, 2))
  }

  function readPackageJson(): Record<string, unknown> {
    return JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
  }

  it('removes `packageManager` when it does not match the selected package manager', () => {
    writePackageJson({ name: 'demo', packageManager: 'pnpm@10.15.1' })
    const removed = removeIncompatiblePackageManager(dir, 'npm')
    expect(removed).toBe('pnpm@10.15.1')
    expect(readPackageJson()).not.toHaveProperty('packageManager')
    expect(readPackageJson().name).toBe('demo')
    // The rewritten file keeps a trailing newline (insert_final_newline).
    expect(readFileSync(join(dir, 'package.json'), 'utf8').endsWith('\n')).toBe(true)
  })

  it('keeps `packageManager` when its name matches the selected package manager', () => {
    writePackageJson({ name: 'demo', packageManager: 'pnpm@10.15.1' })
    const removed = removeIncompatiblePackageManager(dir, 'pnpm')
    expect(removed).toBeUndefined()
    expect(readPackageJson().packageManager).toBe('pnpm@10.15.1')
  })

  it('does nothing when there is no `packageManager` field', () => {
    writePackageJson({ name: 'demo' })
    const removed = removeIncompatiblePackageManager(dir, 'yarn')
    expect(removed).toBeUndefined()
    expect(readPackageJson()).not.toHaveProperty('packageManager')
  })
})

describe('template-configured package manager precedence (#258)', () => {
  let dir: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'csd-pm-precedence-'))
  })

  afterEach(() => {
    rmSync(dir, { force: true, recursive: true })
  })

  it('keeps a pin matching the template-configured package manager, even when another manager was selected', () => {
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify(
        {
          [initScriptKey]: { packageManager: 'pnpm' },
          name: 'demo',
          packageManager: 'pnpm@10.15.1',
        },
        undefined,
        2,
      ),
    )
    // Mirrors the ordering in createApp: the template override runs first,
    // then the removal compares against the *effective* package manager.
    const args = {
      packageManager: 'npm',
      packageManagerExplicit: false,
      targetDirectory: dir,
    } as GetArgsResult
    initScriptPackageManager(args)
    expect(args.packageManager).toBe('pnpm')
    const removed = removeIncompatiblePackageManager(dir, args.packageManager)
    expect(removed).toBeUndefined()
    const contents = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
    expect(contents.packageManager).toBe('pnpm@10.15.1')
  })

  it('still removes a pin that conflicts with the effective package manager when the template configures none', () => {
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({ name: 'demo', packageManager: 'yarn@4.0.0' }, undefined, 2),
    )
    const args = {
      packageManager: 'npm',
      packageManagerExplicit: false,
      targetDirectory: dir,
    } as GetArgsResult
    initScriptPackageManager(args)
    expect(args.packageManager).toBe('npm')
    const removed = removeIncompatiblePackageManager(dir, args.packageManager)
    expect(removed).toBe('yarn@4.0.0')
  })
})
