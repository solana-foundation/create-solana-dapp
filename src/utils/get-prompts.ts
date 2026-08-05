import { cancel, group } from '@clack/prompts'
import * as process from 'node:process'
import { GetArgsResult } from './get-args-result'
import { getPromptName } from './get-prompt-name'
import { getPromptTemplate } from './get-prompt-template'
import { MenuItem } from './template-schema'

export function getPrompts({ items, options }: { items: MenuItem[]; options: GetArgsResult }) {
  return group(
    // The key order determines the prompt order: the template is selected first so it can seed the project name
    {
      // eslint-disable-next-line sort/object-properties
      template: getPromptTemplate({ items, options }),
      name: getPromptName({ options }),
    },
    {
      onCancel: () => {
        cancel('Operation cancelled.')
        process.exit(1)
      },
    },
  )
}
