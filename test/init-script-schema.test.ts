import { describe, expect, it } from 'vitest'
import { InitScriptSchema, InitScriptSchemaRename } from '../src/utils/init-script-schema'

describe('InitScriptSchema - rename entries', () => {
  const parseRename = (rename: unknown) => InitScriptSchema.parse({ rename }).rename

  it('should accept `in`', () => {
    const parsed = parseRename({ example: { in: ['some/path/to/file'], to: '{{name}}Example' } })

    expect(parsed?.example.in).toEqual(['some/path/to/file'])
    expect(parsed?.example.to).toBe('{{name}}Example')
  })

  it('should accept the deprecated `paths`', () => {
    const parsed = parseRename({ example: { paths: ['some/path/to/file'], to: '{{name}}Example' } })

    expect(parsed?.example.paths).toEqual(['some/path/to/file'])
    expect(parsed?.example.in).toBeUndefined()
  })

  it('should accept an empty array', () => {
    const parsed = parseRename({ example: { in: [], to: '{{name}}Example' } })

    expect(parsed?.example.in).toEqual([])
  })

  it('should accept `in` and the deprecated `paths` in separate entries', () => {
    const parsed = parseRename({
      example1: { in: ['some/path/to/file1'], to: '{{name}}Example1' },
      example2: { paths: ['some/path/to/file2'], to: '{{name}}Example2' },
    })

    expect(parsed?.example1.in).toEqual(['some/path/to/file1'])
    expect(parsed?.example2.paths).toEqual(['some/path/to/file2'])
  })

  it('should reject an entry using both `in` and `paths`', () => {
    const result = InitScriptSchemaRename.safeParse({
      example: { in: ['path/from/in'], paths: ['path/from/paths'], to: '{{name}}Example' },
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe(
      `Use either 'in' or 'paths', not both ('paths' is deprecated, use 'in')`,
    )
  })

  it('should reject an entry with neither `in` nor `paths`', () => {
    const result = InitScriptSchemaRename.safeParse({ example: { to: '{{name}}Example' } })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe(`Missing 'in': list the paths to search for this rename`)
  })

  it('should reject an entry without `to`', () => {
    expect(InitScriptSchemaRename.safeParse({ example: { in: ['some/path/to/file'] } }).success).toBe(false)
  })
})
