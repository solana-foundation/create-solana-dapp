import { z } from 'zod'
import { packageManagers } from './vendor/package-manager'

// This is the key used in package.json to store the init script
export const initScriptKey = 'create-solana-dapp'

export const InitScriptSchemaInstructions = z.array(z.string())

export const InitScriptSchemaPackageManager = z.enum(packageManagers)

export const InitScriptSchemaSkills = z.array(z.string())

export const InitScriptSchemaVersions = z.object({
  adb: z.string().optional(),
  anchor: z.string().optional(),
  solana: z.string().optional(),
})

export const InitScriptSchemaRenameEntry = z
  .object({
    in: z.array(z.string()).optional(),
    /** @deprecated Use `in` instead. Support for `paths` is removed in the next major version. */
    paths: z.array(z.string()).optional(),
    to: z.string(),
  })
  .check((payload) => {
    const { in: paths, paths: deprecatedPaths } = payload.value

    if (paths && deprecatedPaths) {
      payload.issues.push({
        code: 'custom',
        input: payload.value,
        message: `Use either 'in' or 'paths', not both ('paths' is deprecated, use 'in')`,
      })
      return
    }

    if (!paths && !deprecatedPaths) {
      payload.issues.push({
        code: 'custom',
        input: payload.value,
        message: `Missing 'in': list the paths to search for this rename`,
      })
    }
  })

export const InitScriptSchemaRename = z.record(z.string(), InitScriptSchemaRenameEntry)

export const InitScriptSchemaOption = z.object({
  default: z.boolean().optional(),
  description: z.string().optional(),
  group: z.string().min(1).optional(),
  instructions: InitScriptSchemaInstructions.optional(),
  rename: InitScriptSchemaRename.optional(),
})

export const InitScriptSchemaOptions = z.record(z.string().regex(/^[a-z][a-z0-9-]*$/), InitScriptSchemaOption)

export const InitScriptSchema = z.object({
  instructions: InitScriptSchemaInstructions.optional(),
  options: InitScriptSchemaOptions.optional(),
  packageManager: InitScriptSchemaPackageManager.optional(),
  rename: InitScriptSchemaRename.optional(),
  skills: InitScriptSchemaSkills.optional(),
  versions: InitScriptSchemaVersions.optional(),
})

export type InitScriptInstructions = z.infer<typeof InitScriptSchemaInstructions>
export type InitScriptOption = z.infer<typeof InitScriptSchemaOption>
export type InitScriptOptions = z.infer<typeof InitScriptSchemaOptions>
export type InitScriptPackageManager = z.infer<typeof InitScriptSchemaPackageManager>
export type InitScriptRename = z.infer<typeof InitScriptSchemaRename>
export type InitScriptRenameEntry = z.infer<typeof InitScriptSchemaRenameEntry>
export type InitScriptSkills = z.infer<typeof InitScriptSchemaSkills>
export type InitScriptVersions = z.infer<typeof InitScriptSchemaVersions>
