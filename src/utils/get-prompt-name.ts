import { log, text } from '@clack/prompts'
import { GetArgsResult } from './get-args-result'
import { Template } from './template'
import { isValidProjectNameFormat, validateProjectName } from './validate-project-name'

// Templates from the registry are named with a plain slug, but external (`org/repo`) and local
// (`./path`) templates keep their raw reference as the name, so take the last path segment. Anything
// that still isn't a usable directory name is dropped rather than rewritten: an invalid pre-fill is
// worse than none, because it has to be cleared before the prompt will accept anything.
function getInitialValue(template?: Template): string | undefined {
  const candidate = template?.name.replace(/\/+$/, '').split('/').pop()

  return candidate && isValidProjectNameFormat(candidate) ? candidate : undefined
}

export function getPromptName({ options }: { options: GetArgsResult }) {
  return ({ results }: { results: { template?: Template } }) => {
    if (options.name) {
      log.success(`Project name: ${options.name}`)
      return Promise.resolve(options.name)
    }
    return text({
      // Pre-fill from the template selected in the previous prompt, so accepting the defaults all
      // the way through gets you a working app
      initialValue: getInitialValue(results.template),
      message: 'Enter project name',
      validate: (name) => validateProjectName(name ?? ''),
    })
  }
}
