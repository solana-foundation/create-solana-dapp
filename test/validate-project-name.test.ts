import { fs, vol } from 'memfs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { projectNameSchema, validateProjectName } from '../src/utils/validate-project-name'

vi.mock('node:fs')

const invalidNameMessage =
  'Please enter a valid project name (lowercase letters, numbers, and single dashes, starting with a letter)'

describe('validateProjectName', () => {
  beforeEach(() => {
    vol.reset()
  })

  it.each(['a', 'app', 'my-app', 'my-app-2', 'web3'])('should accept %j', (name) => {
    expect(validateProjectName(name)).toBeUndefined()
  })

  it.each([
    ['a leading dash', '-app'],
    ['a leading digit', '9lives'],
    ['a scoped package name', '@scope/app'],
    ['a space', 'my app'],
    ['a trailing dash', 'app-'],
    ['a double dash', 'my--app'],
    ['a dot', 'my.app'],
    ['an underscore', 'my_app'],
    ['uppercase characters', 'My-App'],
  ])('should reject a name with %s (%j)', (_, name) => {
    expect(validateProjectName(name)).toBe(invalidNameMessage)
  })

  it('should reject an empty name', () => {
    expect(validateProjectName('')).toBe('Please enter at least 1 character')
  })

  it('should reject a name longer than 214 characters', () => {
    expect(validateProjectName('a'.repeat(215))).toBe('Please enter a name with at most 214 characters')
  })

  it('should accept a name of exactly 214 characters', () => {
    expect(validateProjectName('a'.repeat(214))).toBeUndefined()
  })

  it('should reject a valid name when the directory already exists', () => {
    fs.mkdirSync(join(process.cwd(), 'my-app'), { recursive: true })

    expect(validateProjectName('my-app')).toBe('Directory already exists')
  })
})

describe('projectNameSchema', () => {
  it('should be reusable as a plain zod schema', () => {
    expect(projectNameSchema.safeParse('my-app').success).toBe(true)
    expect(projectNameSchema.safeParse('My_App').success).toBe(false)
  })

  it('should not check the filesystem', () => {
    fs.mkdirSync(join(process.cwd(), 'my-app'), { recursive: true })

    expect(projectNameSchema.safeParse('my-app').success).toBe(true)
  })
})
