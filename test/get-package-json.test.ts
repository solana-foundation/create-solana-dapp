import { fs, vol } from 'memfs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getPackageJson } from '../src/utils/get-package-json'

vi.mock('node:fs')

describe('getPackageJson', () => {
  const targetDirectory = '/template'
  const path = `${targetDirectory}/package.json`

  beforeEach(() => {
    vol.reset()
  })

  it('should throw an error when package.json does not exist', () => {
    expect(() => getPackageJson(targetDirectory)).toThrow('No package.json found')
  })

  it('should throw an error when package.json is empty', () => {
    fs.mkdirSync(targetDirectory)
    fs.writeFileSync(path, '')

    expect(() => getPackageJson(targetDirectory)).toThrow('Error loading package.json')
  })

  it('should throw an error when package.json cannot be parsed', () => {
    fs.mkdirSync(targetDirectory)
    fs.writeFileSync(path, 'invalid json')

    expect(() => getPackageJson(targetDirectory)).toThrow('Unexpected token \'i\', "invalid json" is not valid JSON')
  })

  it('should throw an error when package.json does not match schema', () => {
    fs.mkdirSync(targetDirectory)
    fs.writeFileSync(path, JSON.stringify({ scripts: 'data' }))

    expect(() => getPackageJson(targetDirectory)).toThrow(`Invalid package.json: [
  {
    "code": "invalid_type",
    "expected": "object",
    "received": "string",
    "path": [
      "scripts"
    ],
    "message": "Expected object, received string"
  }
]`)
  })

  it('should return package.json content when file exists', () => {
    const contents = { scripts: { dev: 'vite', start: 'node server.js' } }

    fs.mkdirSync(targetDirectory)
    fs.writeFileSync(path, JSON.stringify(contents))

    expect(getPackageJson(targetDirectory)).toEqual({ contents, path })
  })

  it('should return package.json content with only a name', () => {
    const contents = { name: 'my-app' }

    fs.mkdirSync(targetDirectory)
    fs.writeFileSync(path, JSON.stringify(contents))

    expect(getPackageJson(targetDirectory)).toEqual({ contents, path })
  })

  it('should return package.json content a and parse name, scripts ignoring other fields', () => {
    const contents = { name: 'my-app', scripts: { dev: 'vite', start: 'node server.js' }, version: '1.0.0' }

    fs.mkdirSync(targetDirectory)
    fs.writeFileSync(path, JSON.stringify(contents))

    expect(getPackageJson(targetDirectory)).toEqual({ contents, path })
  })
})
