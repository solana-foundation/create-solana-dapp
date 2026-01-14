# create-solana-dapp

The fastest way to create Solana apps :rocket:

Run one command to generate a new project:

```shell
# npm
npm create solana-dapp@latest

# pnpm
pnpm create solana-dapp@latest

# bun
bun create solana-dapp@latest

# yarn (only supports the 'latest' tag)
yarn create solana-dapp
```

[![npm version](https://img.shields.io/npm/v/create-solana-dapp?color=yellow)](https://npmjs.com/package/create-solana-dapp)
[![npm downloads](https://img.shields.io/npm/dm/create-solana-dapp?color=yellow)](https://npmjs.com/package/create-solana-dapp)

This is a CLI that automates the initialization of predefined Solana templates (see below).

## Templates

The official `create-solana-dapp` templates can be found in
[this repository](https://github.com/solana-foundation/templates).

## External templates

You can also use `create-solana-dapp` to create projects using external templates:

The `--template` (or `-t`) flag supports anything that [giget](https://github.com/unjs/giget) supports

```shell
# npm
npm create solana-dapp@latest -t <github-org>/<github-repo>

# pnpm
pnpm create solana-dapp@latest -t <github-org>/<github-repo>

# yarn
yarn create solana-dapp -t <github-org>/<github-repo>
```

## Init script

Template authors can add an init script to the `package.json` file to help set up the project.

Use this script to return instructions to the user, check the `anchor` and `solana` versions, and replace text and files
in the project.

```jsonc
{
  "name": "your-template",
  "create-solana-dapp": {
    // These instructions will be returned to the user after installation
    "instructions": [
      "Run Anchor commands:",
      // Adding a '+' will make the line bold and '{pm}' is replaced with the package manager
      "+{pm} run anchor build | test | localnet | deploy",
    ],
    // Rename is a map of terms to rename
    "rename": {
      // Rename every instance of counter
      "counter": {
        // With the name of the project
        "to": "{{name}}",
        // In the following paths
        "paths": ["anchor", "src"],
      },
    },
    // Check versions and give a warning if it's not installed or the version is lower
    "versions": {
      "adb": "33.0.0",
      "anchor": "0.30.1",
      "solana": "1.18.0",
    },
  },
}
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for more info.

## Local development

> [!TIP]
>
> This project uses [pnpm](https://pnpm.io/) as the package manager. If you don't have it, you can install it using
> `corepack`:
>
> ```sh
> corepack enable
> corepack prepare pnpm@10 --activate
> ```

To install the project locally, run the following commands:

```shell
git clone https://github.com/solana-foundation/create-solana-dapp.git
cd create-solana-dapp
pnpm install
pnpm build
```

Detailed instructions on the local development workflow are outlined in the
[Development Workflow](./CONTRIBUTING.md#development-workflow) section of the CONTRIBUTING guidelines.
