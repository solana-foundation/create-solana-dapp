import { getMenuItemsFromTemplateGroups } from './get-menu-items-from-template-groups'
import { getTemplateGroupsFromUrl } from './get-template-groups-from-url'
import { getTemplatesFromItems } from './get-templates-from-items'
import { MenuConfig, MenuItem, TemplateJsonTemplate } from './template-schema'

export interface FetchTemplateDataArgs {
  config: MenuConfig
  url: string
  verbose: boolean
}

export interface FetchTemplateDataResult {
  items: MenuItem[]
  templates: TemplateJsonTemplate[]
}

export async function fetchTemplateData({
  config,
  url,
  verbose,
}: FetchTemplateDataArgs): Promise<FetchTemplateDataResult> {
  const groups = await getTemplateGroupsFromUrl({ url, verbose })
  const items = getMenuItemsFromTemplateGroups({ config, groups, verbose })
  const templates = getTemplatesFromItems({ items, verbose })

  return { items, templates }
}
