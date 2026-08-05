import { existsSync } from 'node:fs'

// Checks the shape of a name without touching the filesystem, for callers that want to propose a
// name rather than accept one. Keep this in sync with the first check in `validateProjectName`.
export function isValidProjectNameFormat(name: string): boolean {
  return /^[\w-]+$/i.test(name)
}

export function validateProjectName(name: string): string | undefined {
  // Name must be a valid directory name
  if (!isValidProjectNameFormat(name)) {
    return 'Please enter a valid directory name (alphanumeric characters and dashes only)'
  }
  // Name must be at least 1 character long
  if (name.length === 0) {
    return 'Please enter at least 1 character'
  }
  // Check if the directory already exists
  if (existsSync(name)) {
    return 'Directory already exists'
  }
}
