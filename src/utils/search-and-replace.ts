import { lstat, readdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const EXCLUDED_DIRECTORIES = new Set(['dist', 'coverage', 'node_modules', '.git', 'tmp'])

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)
}

function replaceAllLiterals(value: string, fromStrings: string[], toStrings: string[]): string {
  if (fromStrings.length === 0) {
    return value
  }

  const replacementMap = new Map(fromStrings.map((fromString, index) => [fromString, toStrings[index]]))
  const pattern = [...replacementMap.keys()]
    .sort((a, b) => b.length - a.length)
    .map((fromString) => escapeRegExp(fromString))
    .join('|')

  return value.replace(new RegExp(pattern, 'g'), (match) => replacementMap.get(match) ?? match)
}

export async function searchAndReplace(
  rootFolder: string,
  fromStrings: string[],
  toStrings: string[],
  isDryRun: boolean = false,
  isVerbose: boolean = false,
): Promise<void> {
  if (fromStrings.length !== toStrings.length) {
    throw new Error('fromStrings and toStrings arrays must have the same length')
  }

  async function processFile(filePath: string): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf8')
      let newContent = content

      newContent = replaceAllLiterals(content, fromStrings, toStrings)
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
        }
        for (const [index, fromStr] of fromStrings.entries()) {
          const count = (newContent.match(new RegExp(escapeRegExp(toStrings[index]), 'g')) || []).length
          if (count > 0 && isVerbose) {
            console.log(`  Replaced "${fromStr}" with "${toStrings[index]}" ${count} time(s)`)
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

  async function renamePaths(directoryPath: string): Promise<void> {
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
        let newName = entry.name

        newName = replaceAllLiterals(entry.name, fromStrings, toStrings)

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
          await renamePaths(entry.isDirectory() ? newPath : oldPath)
        }
      }
    } catch (error) {
      console.error(`Error renaming paths in ${directoryPath}:`, error)
    }
  }

  try {
    const rootStats = await lstat(rootFolder)
    if (rootStats.isFile()) {
      await processFile(rootFolder)
      if (isVerbose) {
        console.log(isDryRun ? 'Dry run completed' : 'Search and replace completed')
      }
      return
    }

    await processDirectory(rootFolder)
    await renamePaths(rootFolder)
    if (isVerbose) {
      console.log(isDryRun ? 'Dry run completed' : 'Search and replace completed')
    }
  } catch (error) {
    console.error('An error occurred:', error)
  }
}
