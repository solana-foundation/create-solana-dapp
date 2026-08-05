---
'create-solana-dapp': minor
---

Tighten project name validation to lowercase kebab-case npm package names and export the rule as a reusable `projectNameSchema` zod schema. Names with uppercase characters, underscores, dots, or leading/trailing/consecutive dashes are now rejected at the prompt, since the project name is written into the generated `package.json` and used as the search key when renaming the template.
