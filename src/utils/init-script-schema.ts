import { z } from 'zod/v3'

// This is the key used in package.json to store the init script
export const initScriptKey = 'create-solana-dapp'

export const InitScriptSchemaInstructions = z.array(z.string())

export const InitScriptSchemaVersions = z.object({
  adb: z.string().optional(),
  anchor: z.string().optional(),
  solana: z.string().optional(),
})

export const InitScriptSchemaRename = z.record(
  z.object({
    // TODO: Rename 'paths' to 'in' (breaking change)
    paths: z.array(z.string()),
    to: z.string(),
  }),
)

export const InitScriptSchema = z.object({
  instructions: InitScriptSchemaInstructions.optional(),
  rename: InitScriptSchemaRename.optional(),
  versions: InitScriptSchemaVersions.optional(),
})

export type InitScriptInstructions = z.infer<typeof InitScriptSchemaInstructions>
export type InitScriptRename = z.infer<typeof InitScriptSchemaRename>
export type InitScriptVersions = z.infer<typeof InitScriptSchemaVersions>
