---
'create-solana-dapp': minor
---

Migrate the init script and `package.json` schemas off the `zod/v3` compatibility import so every exported schema is a native Zod 4 schema, and declare `zod` as an optional peer dependency so consumers share a single Zod instance with the package.
