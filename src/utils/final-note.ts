import pico from 'picocolors'
import { GetArgsResult } from './get-args-result'
import { getPackageJson } from './get-package-json'
import { getStartScript } from './get-start-script'

export interface FinalNoteArgs extends GetArgsResult {
  instructions: string[]
  target: string
}

export function finalNote(args: FinalNoteArgs): string {
  const { contents } = getPackageJson(args.targetDirectory)
  const startScript = getStartScript(contents.scripts)
  const instructions =
    args.instructions.length > 0
      ? args.instructions
      : [...(startScript ? [`Start the app:`, cmd(args.packageManager, startScript)] : [])]

  const lines: string[] = [
    `That's it!`,
    `Change to your new directory:`,
    msg(`cd ${args.target}`),
    ...(args.skipInstall ? [`Install dependencies:`, msg(`${args.packageManager} install`)] : []),
    ...instructions.map((line) => (line.startsWith('+') ? msg(line.slice(1)) : line)),
  ]

  return lines.filter(Boolean).join('\n\n')
}

function cmd(pm: string, command: string) {
  return msg(`${pm} run ${command}`)
}

function msg(message: string) {
  return pico.bold(pico.white(message))
}
