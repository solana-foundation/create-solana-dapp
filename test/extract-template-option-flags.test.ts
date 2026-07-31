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
})
