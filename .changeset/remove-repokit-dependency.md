---
"create-solana-dapp": patch
---

Remove repokit dependency and replace with local utilities. This change eliminates the external `@beeman/repokit` canary dependency and replaces it with three local utility modules that provide the same functionality:

- `src/utils/template-schema.ts` - Zod schemas and TypeScript types for template validation
- `src/utils/fetch-templates.ts` - Fetches and parses templates.json from remote URLs
- `src/utils/menu-utils.ts` - Menu transformation logic for template selection

This change maintains full backward compatibility with existing templates.json format while adding support for new optional metadata fields (displayName, usecase, image) introduced in solana-foundation/templates#170.

Benefits:
- No dependency on external canary releases
- Full control over template parsing logic
- Smaller bundle size (only code actually used)
- Type-safe with Zod validation
- Easier to maintain and debug
