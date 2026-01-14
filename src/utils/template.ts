import { TemplateJsonTemplate } from './template-schema'

export interface Template extends Omit<TemplateJsonTemplate, 'keywords' | 'path'> {
  keywords?: string[]
  path?: string
}
