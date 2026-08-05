---
'create-solana-dapp': patch
---

Recover from a corrupt cached template archive: retry the download once and, if it is still corrupt, explain which cache directory to clear instead of failing with a bare `ZlibError`
