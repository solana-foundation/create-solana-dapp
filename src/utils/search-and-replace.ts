import { lstat, readdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join, relative, resolve, sep } from 'node:path'

const EXCLUDED_DIRECTORIES = new Set(['dist', 'coverage', 'node_modules', '.git', 'tmp'])

/** A set of substitutions and the file or directory they apply to. */
export interface SearchAndReplaceScope {
  fromStrings: string[]
  path: string
  toStrings: string[]
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)
}

/**
 * Combine every substitution into a single alternation so that each match is taken from the
 * original value. Replacing one term at a time feeds the output of one substitution into the next,
 * which compounds any replacement value that contains the term it replaces.
 * See https://github.com/solana-foundation/create-solana-dapp/issues/193
 */
function createReplacer(replacements: Map<string, string>): (value: string) => string {
  // Longest first so the most specific term wins when two terms match in the same position
  const searchValues = [...replacements.keys()]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length || a.localeCompare(b))

  if (searchValues.length === 0) {
    return (value) => value
  }

  const regex = new RegExp(searchValues.map((value) => escapeRegExp(value)).join('|'), 'g')

  return (value) => value.replace(regex, (match) => replacements.get(match) ?? match)
}

function isWithinPath(parent: string, child: string): boolean {
  return child === parent || child.startsWith(parent.endsWith(sep) ? parent : `${parent}${sep}`)
}

export async function searchAndReplace(
  rootFolder: string,
  fromStrings: string[],
  toStrings: string[],
  isDryRun: boolean = false,
  isVerbose: boolean = false,
): Promise<void> {
  await searchAndReplaceScopes([{ fromStrings, path: rootFolder, toStrings }], isDryRun, isVerbose)
}

export async function searchAndReplaceScopes(
  scopes: SearchAndReplaceScope[],
  isDryRun: boolean = false,
  isVerbose: boolean = false,
): Promise<void> {
  for (const scope of scopes) {
    if (scope.fromStrings.length !== scope.toStrings.length) {
      throw new Error('fromStrings and toStrings arrays must have the same length')
    }
  }

  const resolvedScopes = scopes.map((scope) => ({ ...scope, path: resolve(scope.path) }))

  /**
   * Every substitution that applies to a path, from the widest scope to the narrowest, so that a
   * scope targeting an individual file wins over one targeting the whole project.
   */
  function replacementsFor(path: string): Map<string, string> {
    const replacements = new Map<string, string>()

    for (const scope of resolvedScopes
      .filter((scope) => isWithinPath(scope.path, path))
      .sort((a, b) => a.path.length - b.path.length)) {
      for (const [index, fromString] of scope.fromStrings.entries()) {
        if (fromString) {
          replacements.set(fromString, scope.toStrings[index])
        }
      }
    }

    return replacements
  }

  async function processFile(filePath: string): Promise<void> {
    const replacements = replacementsFor(filePath)
    if (replacements.size === 0) {
      return
    }

    try {
      const content = await readFile(filePath, 'utf8')
      let newContent = createReplacer(replacements)(content)

      // Make sure we maintain the possible newline at the end of the file
      if (content.endsWith('\n') && !newContent.endsWith('\n')) {
        newContent += '\n'
      }

      if (content !== newContent) {
        if (!isDryRun) {
          await writeFile(filePath, newContent, 'utf8')
        }
        if (isVerbose) {
          console.log(`${isDryRun ? '[Dry Run] ' : ''}File modified: ${filePath}`)
          for (const [fromString, toString] of replacements) {
            const count = (newContent.match(new RegExp(escapeRegExp(toString), 'g')) || []).length
            if (count > 0) {
              console.log(`  Replaced "${fromString}" with "${toString}" ${count} time(s)`)
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error)
    }
  }

  async function processDirectory(directoryPath: string): Promise<void> {
    try {
      const entries = await readdir(directoryPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = join(directoryPath, entry.name)

        if (EXCLUDED_DIRECTORIES.has(entry.name)) {
          if (isVerbose) {
            console.log(`Skipping excluded directory: ${fullPath}`)
          }
          continue
        }

        if (entry.isSymbolicLink()) {
          if (isVerbose) {
            console.log(`Skipping symbolic link: ${fullPath}`)
          }
        } else if (entry.isDirectory()) {
          await processDirectory(fullPath)
        } else if (entry.isFile()) {
          await processFile(fullPath)
        } else {
          if (isVerbose) {
            console.log(`Skipping unknown file type: ${fullPath}`)
          }
        }
      }
    } catch (error) {
      console.error(`Error processing directory ${directoryPath}:`, error)
    }
  }

  /**
   * Renames happen after the contents are replaced, so entries are matched on the path they had
   * before any of their parent directories were renamed.
   */
  async function renamePaths(directoryPath: string, originalDirectoryPath: string): Promise<void> {
    try {
      const entries = await readdir(directoryPath, { withFileTypes: true })

      for (const entry of entries) {
        if (EXCLUDED_DIRECTORIES.has(entry.name)) {
          if (isVerbose) {
            console.log(`Skipping excluded directory for renaming: ${join(directoryPath, entry.name)}`)
          }
          continue
        }

        const oldPath = join(directoryPath, entry.name)
        const originalPath = join(originalDirectoryPath, entry.name)
        const newName = createReplacer(replacementsFor(originalPath))(entry.name)
        const newPath = join(directoryPath, newName)

        if (oldPath !== newPath) {
          if (!isDryRun) {
            await rename(oldPath, newPath)
          }
          if (isVerbose) {
            console.log(`${isDryRun ? '[Dry Run] ' : ''}Renamed: ${oldPath} -> ${newPath}`)
          }
        }

        if (entry.isDirectory()) {
          await renamePaths(isDryRun ? oldPath : newPath, originalPath)
        }
      }
    } catch (error) {
      console.error(`Error renaming paths in ${directoryPath}:`, error)
    }
  }

  /** Whether a walk starting at `parent` reaches `child` without entering an excluded directory. */
  function isReachableFrom(parent: string, child: string): boolean {
    return relative(parent, child)
      .split(sep)
      .every((segment) => !EXCLUDED_DIRECTORIES.has(segment))
  }

  /**
   * Walk each scope that is not already covered by a wider one, so no file is visited twice. A
   * scope inside an excluded directory keeps its own walk: explicitly targeting a path opts it in,
   * while the wider walk still skips the excluded directory.
   */
  const rootPaths = [...new Set(resolvedScopes.map((scope) => scope.path))].filter(
    (path, _index, paths) =>
      !paths.some((other) => other !== path && isWithinPath(other, path) && isReachableFrom(other, path)),
  )

  for (const rootPath of rootPaths) {
    // Each scope is walked on its own so that an unreadable one does not skip the others
    try {
      const rootStats = await lstat(rootPath)

      if (rootStats.isFile()) {
        await processFile(rootPath)
        continue
      }

      await processDirectory(rootPath)
      await renamePaths(rootPath, rootPath)
    } catch (error) {
      console.error('An error occurred:', error)
    }
  }

  if (isVerbose) {
    console.log(isDryRun ? 'Dry run completed' : 'Search and replace completed')
  }
}
