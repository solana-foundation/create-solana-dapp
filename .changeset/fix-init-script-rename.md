---
"create-solana-dapp": patch
---

Fix init script rename failing with mismatched array lengths. The deduplication logic was breaking the 1:1 correspondence between from and to arrays.
