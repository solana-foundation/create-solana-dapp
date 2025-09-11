import { MenuItem } from '@beeman/repokit'
import { cancel, group } from '@clack/prompts'
import * as process from 'node:process'
import { GetArgsResult } from './get-args-result'
import { getPromptName } from './get-prompt-name'
import { getPromptTemplate } from './get-prompt-template'

export function getPrompts({ items, options }: { items: MenuItem[]; options: GetArgsResult }) {
  return group(
    {
      name: getPromptName({ options }),
      template: getPromptTemplate({ items, options }),
    },
    {
      onCancel: () => {
        cancel('Operation cancelled.')
        process.exit(1)
      },
    },
  )
}
