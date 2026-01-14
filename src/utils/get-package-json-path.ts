import { join } from 'node:path'

export function getPackageJsonPath(directory: string): string {
  return join(directory, 'package.json')
}
