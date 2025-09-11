import { intro, log, outro } from '@clack/prompts'
import { program } from 'commander'
import * as process from 'node:process'
import { fetchTemplateData } from './fetch-template-data'
import { findTemplate } from './find-template'
import { AppInfo } from './get-app-info'
import { GetArgsResult } from './get-args-result'
import { getMenuConfig } from './get-menu-config'
import { getPrompts } from './get-prompts'
import { getTemplatesUrl } from './get-templates-url'
import { listTemplateIds } from './list-template-ids'
import { listTemplates } from './list-templates'
import { listVersions } from './list-versions'
import { runVersionCheck } from './run-version-check'
import { Template } from './template'
import { PackageManager } from './vendor/package-manager'

export async function getArgs(argv: string[], app: AppInfo, pm: PackageManager = 'npm'): Promise<GetArgsResult> {
  // Get the result from the command line
  const input = program
    .name(app.name)
    .version(app.version, '-V, --version', help('Output the version number'))
    .argument('[name]', 'Name of the project (default: <prompt>)')
    .option('--pm, --package-manager <package-manager>', help(`Package manager to use (default: npm)`))
    .option('--yarn', help(`Use yarn as the package manager`), false)
    .option('--pnpm', help(`Use pnpm as the package manager`), false)
    .option('--bun', help(`Use bun as the package manager`), false)
    .option('-d, --dry-run', help('Dry run (default: false)'))
    .option('-t, --template <template-name>', help('Use a template'))
    .option('--list-template-ids', help('List available template ids as JSON array'))
    .option('--list-templates', help('List available templates'))
    .option('--list-versions', help('Verify your versions of Anchor, AVM, Rust, and Solana'))
    .option('--skip-git', help('Skip git initialization'))
    .option('--skip-init', help('Skip running the init script'))
    .option('--skip-install', help('Skip installing dependencies'))
    .option('--skip-version-check', help('Skip checking for CLI updates (not recommended)'))
    .option('--templates-url', help('Url to templates.json'), getTemplatesUrl())
    .option('-v, --verbose', help('Verbose output (default: false)'))
    .helpOption('-h, --help', help('Display help for command'))
    .addHelpText(
      'after',
      `
Examples:
  $ ${app.name} my-app
  $ ${app.name} my-app --package-manager pnpm # or --pm pnpm/yarn
  $ ${app.name} my-app --pnpm # or --yarn
      `,
    )
    .parse(argv)

  // Get the optional name argument (positional)
  const name = input.args[0]

  // Get the options from the command line
  const result = input.opts()
  const verbose = result.verbose ?? false

  // Fetch the templates url, parse the template data and create menu items following our menu config
  const { items, templates } = await fetchTemplateData({ config: getMenuConfig(), url: result.templatesUrl, verbose })

  if (result.listVersions) {
    listVersions()
    process.exit(0)
  }

  if (result.listTemplates) {
    listTemplates({ templates })
    outro(
      `\uD83D\uDCA1 To use a template, run "${app.name}${name ? ` ${name}` : ''} --template <template-name>" or "--template <github-org>/<github-repo>" `,
    )
    process.exit(0)
  }

  if (result.listTemplateIds) {
    console.log(listTemplateIds({ templates }))
    process.exit(0)
  }
  let packageManager = result.packageManager ?? pm

  // The 'yarn', 'pnpm' and 'bun' options are mutually exclusive and will override the 'packageManager' option
  const managers = [result.pnpm && 'pnpm', result.yarn && 'yarn', result.bun && 'bun'].filter(Boolean)
  if (managers.length > 1) {
    log.error(`Multiple package managers were specified: ${managers.join(', ')}. Please specify only one.`)
    throw new Error(`Multiple package managers were specified: ${managers.join(', ')}. Please specify only one.`)
  }
  if (result.pnpm) {
    packageManager = 'pnpm'
  }
  if (result.yarn) {
    packageManager = 'yarn'
  }
  if (result.bun) {
    packageManager = 'bun'
  }

  if (!result.skipVersionCheck) {
    await runVersionCheck({ app, packageManager, verbose })
  }

  // Display the intro
  intro(`${app.name} ${app.version}`)

  let template: Template | undefined

  if (result.template) {
    template = findTemplate({ name: result.template, templates, verbose })
  }

  // Take the result from the command line and use it to populate the options
  const cwd = process.cwd()
  const options: Omit<GetArgsResult, 'template'> & { template?: Template } = {
    app,
    dryRun: result.dryRun ?? false,
    name: name ?? '',
    packageManager,
    skipGit: result.skipGit ?? false,
    skipInit: result.skipInit ?? false,
    skipInstall: result.skipInstall ?? false,
    targetDirectory: `${cwd}/${name}`,
    template,
    verbose,
  }

  // Get the prompts for any missing options
  const prompts = await getPrompts({ items, options: options as GetArgsResult })

  // Populate the options with the prompts
  if (prompts.name) {
    options.name = prompts.name
    options.targetDirectory = `${cwd}/${options.name}`
  }
  if (prompts.template) {
    options.template = prompts.template
  }

  if (!options.template) {
    throw new Error('No template specified')
  }

  return options as GetArgsResult
}

// Helper function to add a newline before the text
function help(text: string) {
  return `

  ${text}`
}
