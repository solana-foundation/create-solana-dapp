import { fetchTemplatesJsonUrl } from '@beeman/repokit'
import { log } from '@clack/prompts'
import pico from 'picocolors'

export async function getTemplateGroupsFromUrl({ url, verbose }: { url: string; verbose: boolean }) {
  if (verbose) {
    log.warning(`Fetching templates url: ${pico.cyan(url)}`)
  }
  const groups = await fetchTemplatesJsonUrl(url)
  if (verbose) {
    log.warning(
      `Fetched ${groups.length} groups from remote url:\n- ${groups.map((group) => `${pico.cyan(group.name)} (${pico.gray(group.path)})`).join('\n- ')}`,
    )
  }
  return groups
}
