---
'create-solana-dapp': minor
---

Ship the CLI entry point as ESM and raise the Node floor to `>=22.12.0`. The published `bin` previously pointed at a
CommonJS bundle that called `require()` on four ESM-only dependencies (`@clack/prompts`, `giget`, `is-in-ci`,
`update-notifier`), which only resolved through Node's `require(esm)` support and therefore crashed with
`ERR_REQUIRE_ESM` on Node 20.12 through 20.18. The bin is now `dist/bin/index.mjs` and the new floor guarantees
`require(esm)` for the CommonJS library entry that is still published for `require('create-solana-dapp')` consumers.
Node 20 reached end of life on 2026-04-30.
