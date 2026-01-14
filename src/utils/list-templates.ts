import { log } from '@clack/prompts'
import { TemplateJsonTemplate } from './template-schema'

export function listTemplates({ templates }: { templates: TemplateJsonTemplate[] }) {
  for (const template of templates) {
    log.info(`${template.name}: \n\n\t${template.description}\n\t${template.id}`)
  }
}
