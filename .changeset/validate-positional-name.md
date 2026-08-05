---
'create-solana-dapp': minor
---

Validate the positional `name` CLI argument with the same rules as the interactive prompt. Previously `npx create-solana-dapp My_App` bypassed validation entirely and produced an invalid npm package name and a degenerate rename search key; it now fails with the validation message.
