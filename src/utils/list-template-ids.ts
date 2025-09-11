import { TemplateJsonTemplate } from '@beeman/repokit'

export function listTemplateIds({ templates }: { templates: TemplateJsonTemplate[] }) {
  return templates.map((t) => t.id)
}
