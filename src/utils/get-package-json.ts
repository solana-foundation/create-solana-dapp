import { existsSync, readFileSync } from 'node:fs'
import { z } from 'zod/v3'
import { getPackageJsonPath } from './get-package-json-path'
import { initScriptKey, InitScriptSchema } from './init-script-schema'

export function getPackageJson(targetDirectory: string): { contents: PackageJson; path: string } {
  const path = getPackageJsonPath(targetDirectory)
  const exists = existsSync(path)
  if (!exists) {
    throw new Error('No package.json found')
  }

  const contents = readFileSync(path, 'utf8')
  if (!contents) {
    throw new Error('Error loading package.json')
  }

  const parsed = PackageJsonSchema.safeParse(JSON.parse(contents))
  if (!parsed.success) {
    throw new Error(`Invalid package.json: ${parsed.error.message}`)
  }

  return { contents: parsed.data, path }
}

const PackageJsonSchema = z
  .object({
    [initScriptKey]: InitScriptSchema.optional(),
    name: z.string().optional(),
    scripts: z.record(z.string()).optional(),
  })
  .passthrough()

export type PackageJson = z.infer<typeof PackageJsonSchema>
