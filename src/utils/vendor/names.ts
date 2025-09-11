/**
 * This file includes portions of code from the 'create-nx-workspace' package.
 * The original code can be found at:
 * https://github.com/nrwl/nx/blob/2c0a50c0d8f45f65c9a91e1426fc2e66a29af3bb/packages/devkit/src/utils/names.ts
 *
 * This code is licensed under the MIT License:
 * MIT License
 * Copyright (c) 2017-2024 Narwhal Technologies Inc.
 *
 * The full MIT License is available in the LICENSE file at the root of this repository.
 *
 * Util function to generate different strings based off the provided name.
 *
 * Examples:
 *
 * ```typescript
 * names("my-name") // {name: 'my-name', className: 'MyName', propertyName: 'myName', constantName: 'MY_NAME', fileName: 'my-name'}
 * names("myName") // {name: 'myName', className: 'MyName', propertyName: 'myName', constantName: 'MY_NAME', fileName: 'my-name'}
 * ```
 * @param name
 */
export interface Names {
  className: string
  constantName: string
  fileName: string
  name: string
  propertyName: string
}

export function names(name: string): Names {
  return {
    className: toClassName(name),
    constantName: toConstantName(name),
    fileName: toFileName(name),
    name,
    propertyName: toPropertyName(name),
  }
}

export function namesValues(name: string): string[] {
  return Object.values(names(name))
}

/**
 * Hyphenated to UpperCamelCase
 */
function toClassName(str: string): string {
  return toCapitalCase(toPropertyName(str))
}

/**
 * Hyphenated to lowerCamelCase
 */
function toPropertyName(s: string): string {
  return s
    .replace(/([^\dA-Za-z])+(.)?/g, (_, __, chr) => (chr ? chr.toUpperCase() : ''))
    .replace(/[^\dA-Za-z]/g, '')
    .replace(/^([A-Z])/, (m) => m.toLowerCase())
}

/**
 * Hyphenated to CONSTANT_CASE
 */
function toConstantName(s: string): string {
  const normalizedS = s.toUpperCase() === s ? s.toLowerCase() : s
  return toFileName(toPropertyName(normalizedS))
    .replace(/([^\dA-Za-z])/g, '_')
    .toUpperCase()
}

/**
 * Upper camelCase to lowercase, hyphenated
 */
function toFileName(s: string): string {
  return s
    .replace(/([\da-z])([A-Z])/g, '$1_$2')
    .toLowerCase()
    .replace(/(?!^_)[ _]/g, '-')
}

/**
 * Capitalizes the first letter of a string
 */
function toCapitalCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
