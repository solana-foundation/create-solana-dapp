---
'create-solana-dapp': patch
---

Apply every init-script rename in a single pass per file, so a project name that contains a template
term is no longer compounded (`mycountergill` no longer became `mymycountergillgill`).
