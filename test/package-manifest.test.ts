import { describe, expect, it } from 'vitest'
import packageJson from '../package.json'

const dependencies: Record<string, string> = packageJson.dependencies
const peerDependenciesMeta: Record<string, { optional?: boolean }> =
  (packageJson as { peerDependenciesMeta?: Record<string, { optional?: boolean }> }).peerDependenciesMeta ?? {}

describe('package manifest', () => {
  it('should declare zod as a runtime dependency', () => {
    // The CLI parses template catalogs and init scripts with zod, so it must resolve at runtime.
    expect(dependencies.zod).toBeDefined()
  })

  it('should not declare any runtime dependency as an optional peer dependency', () => {
    // pnpm skips installing optional peer dependencies entirely, even when the same package is
    // listed in `dependencies`, which breaks `pnpm dlx create-solana-dapp` with a missing module.
    const optionalPeers = Object.keys(peerDependenciesMeta).filter((name) => peerDependenciesMeta[name]?.optional)

    expect(optionalPeers.filter((name) => name in dependencies)).toEqual([])
  })
})
