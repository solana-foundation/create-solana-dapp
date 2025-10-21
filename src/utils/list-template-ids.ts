import { TemplateJsonTemplate } from './template-schema'

export function listTemplateIds({ templates }: { templates: TemplateJsonTemplate[] }) {
  return templates.map((t) => t.id)
}
