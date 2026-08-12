import { Command } from 'commander'
import { describe, expect, it } from 'vitest'
import { extractTemplateOptionFlags } from '../src/utils/extract-template-option-flags'

function command() {
  return new Command().argument('[name]').option('-t, --template <template-name>').option('--skip-install')
}

describe('extractTemplateOptionFlags', () => {
  it('extracts boolean long flags while preserving known arguments', () => {
    const argv = ['node', 'create-solana-dapp', 'my-app', '--template', 'pay-gate-inference', '--ollama']

    expect(extractTemplateOptionFlags(command(), argv)).toEqual({
      argv: ['node', 'create-solana-dapp', 'my-app', '--template', 'pay-gate-inference'],
      templateOptions: ['ollama'],
    })
  })

  it('deduplicates repeated template flags', () => {
    const argv = ['node', 'create-solana-dapp', 'my-app', '--ollama', '--ollama']

    expect(extractTemplateOptionFlags(command(), argv)).toEqual({
      argv: ['node', 'create-solana-dapp', 'my-app'],
      templateOptions: ['ollama'],
    })
  })

  it('preserves positional and registered arguments after a template flag', () => {
    const argv = [
      'node',
      'create-solana-dapp',
      '--ollama',
      'my-app',
      '--skip-install',
      '--template',
      'pay-gate-inference',
    ]

    expect(extractTemplateOptionFlags(command(), argv)).toEqual({
      argv: ['node', 'create-solana-dapp', 'my-app', '--skip-install', '--template', 'pay-gate-inference'],
      templateOptions: ['ollama'],
    })
  })

  it('preserves a required option value that resembles a template flag', () => {
    const argv = ['node', 'create-solana-dapp', 'my-app', '--template', '--ollama']

    expect(extractTemplateOptionFlags(command(), argv)).toEqual({
      argv,
      templateOptions: [],
    })
  })

  it('rejects short flags and values for template options', () => {
    expect(() => extractTemplateOptionFlags(command(), ['node', 'create-solana-dapp', 'my-app', '-o'])).toThrow(
      'Template options must be boolean long flags',
    )
    expect(() =>
      extractTemplateOptionFlags(command(), ['node', 'create-solana-dapp', 'my-app', '--engine=ollama']),
    ).toThrow('Template options must be boolean long flags')
  })

  it('preserves a long alias flag and its space-separated value', () => {
    // Commander stores the alias of a two-long-token option
    // (`--pm, --package-manager`) in `option.short`, so the alias must still be
    // recognised as a known option rather than treated as a template flag.
    const commandWithPm = () =>
      new Command().argument('[name]').option('--pm, --package-manager <package-manager>').option('--skip-install')
    const argv = ['node', 'create-solana-dapp', 'my-app', '--pm', 'pnpm']

    expect(extractTemplateOptionFlags(commandWithPm(), argv)).toEqual({
      argv: ['node', 'create-solana-dapp', 'my-app', '--pm', 'pnpm'],
      templateOptions: [],
    })
  })

  it('detects an inline value written with a long alias flag', () => {
    const commandWithPm = () =>
      new Command().argument('[name]').option('--pm, --package-manager <package-manager>').option('--skip-install')
    const argv = ['node', 'create-solana-dapp', 'my-app', '--pm=pnpm', '--ollama']

    expect(extractTemplateOptionFlags(commandWithPm(), argv)).toEqual({
      argv: ['node', 'create-solana-dapp', 'my-app', '--pm=pnpm'],
      templateOptions: ['ollama'],
    })
  })
})
