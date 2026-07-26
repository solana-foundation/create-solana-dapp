import { log, text } from '@clack/prompts'
import { GetArgsResult } from './get-args-result'
import { validateProjectName } from './validate-project-name'

export function getPromptName({ options }: { options: GetArgsResult }) {
  return () => {
    if (options.name) {
      log.success(`Project name: ${options.name}`)
      return Promise.resolve(options.name)
    }
    return text({
      message: 'Enter project name',
      validate: (name) => validateProjectName(name ?? ''),
    })
  }
}
