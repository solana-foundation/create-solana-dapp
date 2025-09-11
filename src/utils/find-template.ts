import { TemplateJsonTemplate } from '@beeman/repokit'
import { log } from '@clack/prompts'
import { Template } from './template'

export function findTemplate({
  name,
  templates,
  verbose,
}: {
  name: string
  templates: TemplateJsonTemplate[]
  verbose: boolean
}): Template {
  // A template name with a `/` is considered external
  if (name.includes('/')) {
    if (verbose) {
      log.warning(`Provided template contains a '/' so we treat it as an external template`)
    }
    return {
      description: `${name} (external)`,
      id: name.includes(':') ? name : `gh:${name}`,
      name,
    }
  }

  const template: Template | undefined = templates.find((template) => template.name === name)

  if (!template) {
    throw new Error(`Template ${name} not found`)
  }
  if (verbose) {
    log.warning(`Found template ${name}: ${JSON.stringify(template, undefined, 2)}`)
  }
  return template
}
