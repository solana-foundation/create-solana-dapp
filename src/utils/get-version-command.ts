const commandMap: Record<string, { command: string; name: string; regex: RegExp }> = {
  adb: {
    command: 'adb --version',
    name: 'Adb   ',
    regex: /Version (\d+\.\d+\.\d+)/,
  },
  anchor: {
    command: 'anchor --version',
    name: 'Anchor',
    regex: /anchor-cli (\d+\.\d+\.\d+)/,
  },
  avm: {
    command: 'avm --version',
    name: 'AVM   ',
    regex: /avm (\d+\.\d+\.\d+)/,
  },
  rust: {
    command: 'rustc --version',
    name: 'Rust  ',
    regex: /rustc (\d+\.\d+\.\d+)/,
  },
  solana: {
    command: 'solana --version',
    name: 'Solana',
    regex: /solana-cli (\d+\.\d+\.\d+)/,
  },
}

export type VersionCommand = keyof typeof commandMap

export function getVersionCommand(command: VersionCommand): { command: string; name: string; regex: RegExp } {
  return commandMap[command]
}

export function getVersionCommandNames(): string[] {
  return Object.keys(commandMap)
}
