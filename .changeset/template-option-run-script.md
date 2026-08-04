---
'create-solana-dapp': minor
---

Support a `run` value on template options, naming a `package.json` script to run when the option is selected. The script
runs with the selected package manager after the template is cloned and before dependencies are installed, so a script
that trims `package.json` is reflected in the lockfile and `node_modules`. The value reaches a shell, so it is limited to
letters, digits, whitespace and `. : @ / = , + - _`, which rules out shell metacharacters and quoted arguments.

The init script and the selected options are now snapshotted directly after cloning instead of being read again during
the init script, so unsupported flags fail before dependencies are installed and an option script that rewrites
`package.json` cannot drop the renames and instructions the init script applies. A failing task now removes the target
directory it created, and `error.log` is written next to that directory rather than inside it so it survives the
cleanup.
