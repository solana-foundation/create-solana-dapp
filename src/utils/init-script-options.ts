import { GetArgsResult } from './get-args-result'
import { initScriptRenameEntryScopes } from './init-script-rename'
import { InitScriptOptions } from './init-script-schema'
import { SearchAndReplaceScope } from './search-and-replace'

export interface SelectedTemplateOption {
  name: string
  value: InitScriptOptions[string]
}

export interface InitScriptOptionsResult {
  instructions: string[]
  /** Applied together with the other renames so that no rename rewrites another one's output. */
  scopes: SearchAndReplaceScope[]
}

/**
 * Resolves requested flags and group defaults from template option metadata.
 */
export function resolveInitScriptOptions(
  options: InitScriptOptions | undefined,
  requested: string[],
): SelectedTemplateOption[] {
  const definitions = options ?? {}
  const available = Object.keys(definitions)
  const unknown = requested.filter((name) => !definitions[name])
  if (unknown.length > 0) {
    const availableMessage =
      available.length > 0 ? ` Available options: ${available.map((name) => `--${name}`).join(', ')}.` : ''
    throw new Error(`Template does not support ${unknown.map((name) => `--${name}`).join(', ')}.${availableMessage}`)
  }

  const selected = new Set(requested)
  const requestedGroups = new Set(
    requested.flatMap((name) => {
      const group = definitions[name].group
      return group ? [group] : []
    }),
  )

  for (const [name, option] of Object.entries(definitions)) {
    if (!option.default) {
      continue
    }
    if (!option.group || !requestedGroups.has(option.group)) {
      selected.add(name)
    }
  }

  const selectedOptions = [...selected].map((name) => ({ name, value: definitions[name] }))
  const groups = new Map<string, string[]>()
  for (const option of selectedOptions) {
    if (!option.value.group) {
      continue
    }
    const names = groups.get(option.value.group) ?? []
    names.push(option.name)
    groups.set(option.value.group, names)
  }

  for (const [group, names] of groups) {
    if (names.length > 1) {
      throw new Error(
        `Template options ${names.map((name) => `--${name}`).join(' and ')} are mutually exclusive (group "${group}").`,
      )
    }
  }

  return selectedOptions
}

/**
 * Collects the selected template option transformations and their post-create instructions.
 */
export async function initScriptOptions(
  args: GetArgsResult,
  selected: SelectedTemplateOption[],
): Promise<InitScriptOptionsResult> {
  const scopes: SearchAndReplaceScope[] = []
  for (const option of selected) {
    scopes.push(...(await initScriptRenameEntryScopes(args, option.value.rename)))
  }

  return { instructions: selected.flatMap((option) => option.value.instructions ?? []), scopes }
}
