import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getPackageJsonPath } from '../src/utils/get-package-json-path'

describe('getPackageJsonPath', () => {
  it.each(['/project', '/project/subdir', '/project/', '', 'src', '.', '..', '/project with spaces'])(
    'returns correct path for %s',
    (input) => {
      const expected = join(input, 'package.json')
      const result = getPackageJsonPath(input)
      expect(result).toBe(expected)
    },
  )
})
