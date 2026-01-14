import { MenuConfig } from './template-schema'

// This configuration defines the menu options of the CLI and the groups and keywords they filter on.
export function getMenuConfig(): MenuConfig {
  return [
    {
      description: 'Recommended - Uses @solana/kit and @solana/react-hooks',
      groups: ['kit'],
      id: 'kit',
      keywords: [],
      name: 'Kit Framework',
    },
    {
      description: 'Solana Mobile Templates based on Expo',
      groups: ['mobile'],
      id: 'solana-mobile',
      keywords: ['expo'],
      name: 'Solana Mobile',
    },
    {
      description: 'Templates created by the community',
      groups: ['community'],
      id: 'community',
      keywords: [],
      name: 'Community',
    },
    {
      description: 'Deprecated - Uses @solana/web3.js',
      groups: ['web3js'],
      id: 'web3js',
      keywords: [],
      name: 'Web3.js',
    },
  ]
}
