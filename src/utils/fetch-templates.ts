import { parseTemplateJson, TemplateJsonGroup } from './template-schema'

export async function fetchTemplatesJsonUrl(url: string): Promise<TemplateJsonGroup[]> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch templates from ${url}: ${response.status} ${response.statusText}`)
  }

  const content = await response.text()
  const result = parseTemplateJson(content)

  if (!result.success) {
    throw new Error(`Invalid templates.json format: ${result.error.message}`)
  }

  return result.data
}
