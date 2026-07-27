---
'create-solana-dapp': patch
---

Remove the template's `packageManager` field before install when it does not match the effective package manager (template-configured package managers take precedence)
