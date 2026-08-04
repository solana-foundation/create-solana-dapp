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

export const InitScriptSchemaRename = z.record(
  z.string(),
  z.object({
    // TODO: Rename 'paths' to 'in' (breaking change)
    paths: z.array(z.string()),
    to: z.string(),
  }),
)

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
export type InitScriptSkills = z.infer<typeof InitScriptSchemaSkills>
export type InitScriptVersions = z.infer<typeof InitScriptSchemaVersions>
