---
"create-solana-dapp": patch
---

fix: upgrade @clack/prompts to v0.11.0

This upgrade makes the vendored tasks utility in `src/utils/vendor/clack-tasks.ts` obsolete, as this functionality is now exported directly by `@clack/prompts`.
