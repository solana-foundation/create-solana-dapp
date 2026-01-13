import { log } from '@clack/prompts'
import { existsSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'
import { Template } from './template'
import { TemplateJsonTemplate } from './template-schema'

export function findTemplate({
  name,
  templates,
  verbose,
}: {
  name: string
  templates: TemplateJsonTemplate[]
  verbose: boolean
}): Template {
  // Check if it's a local file path (absolute or relative)
  const isLocalPath = name.startsWith('/') || name.startsWith('./') || name.startsWith('../')

  if (isLocalPath) {
    // Resolve to absolute path
    const absolutePath = isAbsolute(name) ? name : resolve(process.cwd(), name)

    if (!existsSync(absolutePath)) {
      throw new Error(`Local template path does not exist: ${absolutePath}`)
    }

    // Security warning for local templates
    log.warning(
      'Please install templates you trust and have verified. This feature is only intended for local development and not to clone official templates.',
    )
    log.info(`View official templates at: https://github.com/solana-foundation/templates`)

    if (verbose) {
      log.warning(`Using local template from: ${absolutePath}`)
    }

    return {
      description: `${name} (local)`,
      id: `local:${absolutePath}`,
      name,
    }
  }

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
