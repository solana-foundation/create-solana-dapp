import { VersionCommand } from './get-version-command'

type VersionUrls = {
  install?: string
  update?: string
}

const urls: Record<VersionCommand, VersionUrls> = {
  adb: {
    install:
      'https://docs.expo.dev/get-started/set-up-your-environment/?platform=android&device=physical&mode=development-build&buildEnv=local',
  },
  anchor: {
    install: 'https://www.anchor-lang.com/docs/installation',
    update: 'https://www.anchor-lang.com/release-notes/{required}',
  },
  solana: {
    install: 'https://solana.com/docs/intro/installation',
  },
}

export function getVersionUrls(command: VersionCommand, required: string): VersionUrls {
  const { install, update } = urls[command] ?? {}

  return install || update
    ? {
        install: install?.replace('{required}', required),
        update: (update ?? install)?.replace('{required}', required),
      }
    : {}
}
