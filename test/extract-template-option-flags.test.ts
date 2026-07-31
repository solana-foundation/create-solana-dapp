import { Command } from 'commander'
import { describe, expect, it } from 'vitest'
import { extractTemplateOptionFlags } from '../src/utils/extract-template-option-flags'

function command() {
  return new Command().argument('[name]').option('-t, --template <template-name>')
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

  it('rejects short flags and values for template options', () => {
    expect(() => extractTemplateOptionFlags(command(), ['node', 'create-solana-dapp', 'my-app', '-o'])).toThrow(
      'Template options must be boolean long flags',
    )
    expect(() =>
      extractTemplateOptionFlags(command(), ['node', 'create-solana-dapp', 'my-app', '--engine', 'ollama']),
    ).toThrow('Template options must be boolean long flags')
  })
})
