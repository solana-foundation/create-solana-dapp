import { writeFileSync } from 'node:fs'
import { getPackageJson } from './get-package-json'
import { PackageManager } from './vendor/package-manager'

/**
 * Removes the `packageManager` field from the generated app's `package.json`
 * when it does not match the selected package manager.
 *
 * Templates can pin a `packageManager` (e.g. `pnpm@10.15.1`). Managers such as
 * pnpm and yarn error when they encounter an incompatible value, so a template
 * that pins a different manager than the one the user selected would otherwise
 * break installation (see #100).
 *
 * @param targetDirectory - The directory containing the generated app's `package.json`.
 * @param packageManager - The package manager the user selected.
 * @returns The removed `packageManager` value, or `undefined` if nothing was removed.
 */
export function removeIncompatiblePackageManager(
  targetDirectory: string,
  packageManager: PackageManager,
): string | undefined {
  const { contents, path } = getPackageJson(targetDirectory)
  const value = contents.packageManager
  if (!value) {
    return undefined
  }
  // `packageManager` is formatted as `<name>@<version>` (e.g. `pnpm@10.15.1`).
  const [name] = value.split('@')
  if (name === packageManager) {
    return undefined
  }
  const updated = { ...contents }
  delete updated.packageManager
  writeFileSync(path, `${JSON.stringify(updated, undefined, 2)}\n`)
  return value
}
