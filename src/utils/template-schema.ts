import { z } from 'zod'

// Schema for individual template
export const templateJsonTemplateSchema = z.object({
  description: z.string(),
  // New fields from templates PR #170 (optional for backward compatibility)
  displayName: z.string().optional(),
  id: z.string(),
  image: z.string().optional(),
  keywords: z.array(z.string()),
  name: z.string(),
  path: z.string(),
  usecase: z.string().optional(),
})

// Schema for template group
export const templateJsonGroupSchema = z.object({
  description: z.string(),
  name: z.string(),
  path: z.string(),
  templates: z.array(templateJsonTemplateSchema),
})

// Schema for entire templates.json
export const templateJsonSchema = z.array(templateJsonGroupSchema)

// Parse templates.json content
export function parseTemplateJson(content: string) {
  try {
    const json = JSON.parse(content)
    return templateJsonSchema.safeParse(json)
  } catch (error) {
    return {
      error: new z.ZodError([
        {
          code: 'custom',
          message: error instanceof Error ? error.message : 'Failed to parse JSON',
          path: [],
        },
      ]),
      success: false,
    } as const
  }
}

// Type exports
export type TemplateJson = z.infer<typeof templateJsonSchema>
export type TemplateJsonGroup = z.infer<typeof templateJsonGroupSchema>
export type TemplateJsonTemplate = z.infer<typeof templateJsonTemplateSchema>

// Menu types
export interface MenuItem {
  description: string
  id: string
  name: string
  templates: TemplateJsonTemplate[]
}

export interface MenuConfigItem extends Omit<MenuItem, 'templates'> {
  groups: string[]
  keywords: string[]
}

export type MenuConfig = MenuConfigItem[]
