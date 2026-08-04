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
    // Optional. Force this template to use an installed package manager.
    // An explicitly selected different package manager will stop installation.
    "packageManager": "bun",
    // Rename is a map of terms to rename
    "rename": {
      // Rename every instance of counter
      "counter": {
        // In the following paths. Was called 'paths', which is deprecated and
        // is removed in the next major version.
        "in": ["anchor", "src"],
        // With the name of the project
        "to": "{{name}}",
      },
    },
    // Optional. If omitted, the default Solana skill is installed.
    // Set to [] to skip skill installation, or provide one or more skill repo URLs to replace the default.
    "skills": ["https://github.com/org/skill-repo"],
    // Optional boolean CLI flags declared by this template.
    "options": {
      // `--ollama` is selected when no option in the "engine" group is passed.
      "ollama": {
        "default": true,
        "description": "Configure the template for Ollama",
        "group": "engine",
        "instructions": ["Start Ollama"],
        "rename": {
          "__MODEL__": {
            "in": ["request.json"],
            "to": "qwen3:0.6b",
          },
        },
      },
      // Passing `--llamacpp` replaces the default from the same group.
      "llamacpp": {
        "description": "Configure the template for llama.cpp",
        "group": "engine",
        "instructions": ["Start llama-server"],
        "rename": {
          "__MODEL__": {
            "in": ["request.json"],
            "to": "local-model",
          },
        },
      },
      // Passing `--reset-project` runs the template's own `reset-project` script.
      "reset-project": {
        "description": "Start from a blank app instead of the example code",
        "group": "example",
        "instructions": ["Edit app/index.tsx to start building."],
        // A package.json script, optionally followed by arguments.
        "run": "reset-project -- --yes",
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

Pass template-defined options as boolean long flags when creating the project:

```shell
pnpm create solana-dapp@latest my-inference-app \
  --template pay-gate-inference \
  --ollama
```

When no flag is passed for an option group, the group's default option is selected. Passing another option from that
group, such as `--llamacpp`, replaces the default.

An option can declare a `run` value naming a script in the template's `package.json`, optionally followed by arguments.
The script runs with the selected package manager after the template is cloned and **before dependencies are
installed**, so a script that trims `package.json` is reflected in the lockfile and `node_modules`, and any files it
writes are still picked up by the rename step. The script must not prompt, since it runs without an interactive
terminal. A non-zero exit aborts the run and removes the target directory.

The value is limited to letters, digits, whitespace and `. : @ / = , + - _`. Shell metacharacters are rejected rather
than escaped, which also means an argument cannot contain a space — put anything that needs quoting in the script
itself.

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
