---
"create-solana-dapp": patch
---

Fix renamePaths applying string replacement to full absolute path instead of entry name only. This caused path duplication when the project name contained the template name (e.g., creating "test-kit-nextjs" from template "nextjs" would try to rename to "test-kit-test-kit-nextjs").
