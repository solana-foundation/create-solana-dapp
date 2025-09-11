import { MenuConfig, MenuItem, TemplateJsonTemplate } from '@beeman/repokit'
import { getMenuItemsFromTemplateGroups } from './get-menu-items-from-template-groups'
import { getTemplateGroupsFromUrl } from './get-template-groups-from-url'
import { getTemplatesFromItems } from './get-templates-from-items'

export async function fetchTemplateData({
  config,
  url,
  verbose,
}: {
  config: MenuConfig
  url: string
  verbose: boolean
}): Promise<{
  items: MenuItem[]
  templates: TemplateJsonTemplate[]
}> {
  const groups = await getTemplateGroupsFromUrl({ url, verbose })
  const items = getMenuItemsFromTemplateGroups({ config, groups, verbose })
  const templates = getTemplatesFromItems({ items, verbose })

  return { items, templates }
}
