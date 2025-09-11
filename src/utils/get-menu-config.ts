import { MenuConfig } from '@beeman/repokit'

// This configuration defines the menu options of the CLI and the groups and keywords they filter on.
export function getMenuConfig(): MenuConfig {
  return [
    {
      description: 'A React framework by Vercel',
      groups: ['templates', 'legacy', 'gill', 'web3js'],
      id: 'next',
      keywords: ['nextjs'],
      name: 'Next.js',
    },
    {
      description: "JavaScript runtime built on Chrome's V8 engine",
      groups: ['templates', 'legacy', 'gill', 'web3js'],
      id: 'node',
      keywords: ['node'],
      name: 'Node.js',
    },
    {
      description: 'React with Vite and React Router',
      groups: ['templates', 'legacy', 'gill', 'web3js'],
      id: 'react-vite',
      keywords: ['react', 'vite'],
      name: 'React with Vite',
    },
    {
      description: 'Solana Mobile Templates based on Expo',
      groups: ['mobile'],
      id: 'solana-mobile',
      keywords: ['expo'],
      name: 'Solana Mobile',
    },
    {
      description: 'Templates created by the community (unsupported)',
      groups: ['community'],
      id: 'community',
      keywords: [],
      name: 'Community',
    },
  ]
}
