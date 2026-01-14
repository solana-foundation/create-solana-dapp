import { describe, expect, it } from 'vitest'
import { InitScriptSchema } from '../src/utils/init-script-schema'

describe('InitScriptSchema - rename alias', () => {
  const parseRename = (rename: unknown) => InitScriptSchema.parse({ rename }).rename

  it('should accept `in` alias and normalize to `paths`', () => {
    const parsed = parseRename({ example: { in: ['some/path/to/file'], to: '{{name}}Example' } } as unknown)

    // @ts-expect-error normalized by schema transform
    expect(parsed.example.in).toBeUndefined()
    expect(parsed?.example.paths).toEqual(['some/path/to/file'])
    expect(parsed?.example.to).toBe('{{name}}Example')
  })

  it('should accept `paths` field without changes', () => {
    const parsed = parseRename({ example: { paths: ['some/path/to/file'], to: '{{name}}Example' } })

    expect(parsed?.example.paths).toEqual(['some/path/to/file'])
    expect(parsed?.example.to).toBe('{{name}}Example')
  })

  it('should prioritize `paths` over `in` when both provided', () => {
    const entry = { in: ['path/from/in'], paths: ['path/from/paths'], to: '{{name}}Example' } as unknown
    const parsed = parseRename({ example: entry })

    expect(parsed?.example.paths).toEqual(['path/from/paths'])
  })

  it('should handle empty arrays', () => {
    const parsed = parseRename({ example: { in: [], to: '{{name}}Example' } } as unknown)

    expect(parsed?.example.paths).toEqual([])
  })

  it('should handle mixed `in` and `paths` usage', () => {
    const rename = {
      example1: { in: ['some/path/to/file1'], to: '{{name}}Example1' },
      example2: { paths: ['some/path/to/file2'], to: '{{name}}Example2' },
    } as unknown
    const parsed = parseRename(rename)

    expect(parsed?.example1.paths).toEqual(['some/path/to/file1'])
    expect(parsed?.example2.paths).toEqual(['some/path/to/file2'])
  })
})
