---
'create-solana-dapp': minor
---

Accept `in` for rename entries in the init script and deprecate `paths`. Templates using `paths` keep working and now log a deprecation warning; support for `paths` is removed in the next major version. An entry must set exactly one of the two.
