import { homedir, tmpdir } from 'node:os'
import { resolve } from 'node:path'

/**
 * Detects the errors thrown when the template tarball giget hands to `tar` is
 * truncated or otherwise not a valid gzip archive.
 *
 * giget caches every template tarball. When a download is interrupted it leaves
 * a partial file behind, and on the next run its download error handler falls
 * back to that cached file instead of failing, so the corrupt archive is
 * extracted and `tar` reports a low-level zlib failure (see #256).
 */
export function isCorruptArchiveError(error: unknown): boolean {
  const code = (error as { code?: unknown })?.code
  if (code === 'TAR_BAD_ARCHIVE' || code === 'Z_BUF_ERROR' || code === 'Z_DATA_ERROR') {
    return true
  }
  const name = (error as { name?: unknown })?.name
  const message = `${(error as { message?: unknown })?.message ?? error}`
  return name === 'ZlibError' || /zlib|unexpected end of file|not a gzip|invalid distance/i.test(message)
}

/**
 * The directory giget caches template tarballs in.
 *
 * Mirrors giget's own resolution so the recovery hint we print points at the
 * directory the user actually needs to clear.
 */
export function templateCacheDirectory(): string {
  if (process.platform === 'win32') {
    return resolve(tmpdir(), 'giget')
  }
  return process.env.XDG_CACHE_HOME ? resolve(process.env.XDG_CACHE_HOME, 'giget') : resolve(homedir(), '.cache/giget')
}

/**
 * Actionable message for a corrupt cached template archive, replacing the bare
 * `ZlibError: zlib: unexpected end of file` that leaves users guessing (the
 * reporter in #256 tried installing zlib).
 */
export function corruptArchiveMessage(templateId: string): string {
  return [
    `The cached archive for template ${templateId} is corrupt, most likely from an interrupted download.`,
    `Delete the template cache and try again: ${templateCacheDirectory()}`,
  ].join(' ')
}
