import { MenuConfig, MenuItem, TemplateJsonGroup } from './template-schema'

export function getMenuItems({ config, groups }: { config: MenuConfig; groups: TemplateJsonGroup[] }): MenuItem[] {
  return config.map((configItem) => {
    // Filter groups that match this config item
    const matchingGroups = groups.filter((group) => configItem.groups.includes(group.path))

    // Collect templates from matching groups
    const templates = matchingGroups.flatMap((group) =>
      group.templates.filter((template) => {
        // If no keywords specified, include all templates from the group
        if (configItem.keywords.length === 0) {
          return true
        }
        // Otherwise, check if template has any of the config's keywords
        return configItem.keywords.some((keyword) => template.keywords.includes(keyword))
      }),
    )

    return {
      description: configItem.description,
      id: configItem.id,
      name: configItem.name,
      templates,
    }
  })
}
