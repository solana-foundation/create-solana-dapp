import { z } from 'zod/v3'

// This is the key used in package.json to store the init script
export const initScriptKey = 'create-solana-dapp'

export const InitScriptSchemaInstructions = z.array(z.string())

export const InitScriptSchemaVersions = z.object({
  adb: z.string().optional(),
  anchor: z.string().optional(),
  solana: z.string().optional(),
})

const InitScriptSchemaRenameEntryBase = z.object({
  // Accept alias `in` for backward/forward compatibility and normalize to `paths`
  in: z.array(z.string()).optional(),
  paths: z.array(z.string()).optional(),
  to: z.string(),
})

export const InitScriptSchemaRename = z.record(InitScriptSchemaRenameEntryBase).transform((input) => {
  // Normalize entries: if `in` is provided, move to `paths`
  const normalized: Record<string, { paths: string[]; to: string }> = {}
  for (const key of Object.keys(input)) {
    const entry = input[key] as { in?: string[]; paths?: string[]; to: string }
    const paths = entry.paths ?? entry.in ?? []
    normalized[key] = { paths, to: entry.to }
  }
  return normalized
})

export const InitScriptSchema = z.object({
  instructions: InitScriptSchemaInstructions.optional(),
  rename: InitScriptSchemaRename.optional(),
  versions: InitScriptSchemaVersions.optional(),
})

export type InitScriptInstructions = z.infer<typeof InitScriptSchemaInstructions>
export type InitScriptRename = z.infer<typeof InitScriptSchemaRename>
export type InitScriptVersions = z.infer<typeof InitScriptSchemaVersions>
