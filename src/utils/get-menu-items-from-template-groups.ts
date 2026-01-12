import { log } from '@clack/prompts'
import pico from 'picocolors'
import { getMenuItems } from './menu-utils'
import { MenuConfig, TemplateJsonGroup } from './template-schema'

export function getMenuItemsFromTemplateGroups({
  config,
  groups,
  verbose,
}: {
  config: MenuConfig
  groups: TemplateJsonGroup[]
  verbose: boolean
}) {
  const items = getMenuItems({ config, groups })
  if (verbose) {
    log.warning(
      `Got ${items.length} menu items:\n- ${items.map((item) => `${pico.cyan(item.name)} (${pico.gray(item.id)})`).join('\n- ')}`,
    )
  }
  return items
}
