# Contributing to create-solana-dapp

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## We Develop with GitHub

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## We use [GitHub Flow](https://guides.github.com/introduction/flow/index.html), so all code changes happen through pull requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same
[MIT License](https://choosealicense.com/licenses/mit/) that covers the project.

## Report bugs using GitHub's [issues](https://github.com/solana-foundation/create-solana-dapp/issues)

We use GitHub issues to track public bugs. Report a bug by
[opening a new issue](https://github.com/solana-foundation/create-solana-dapp/issues/new); it's that easy!

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can.
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

People _love_ thorough bug reports.

## Use a Consistent Coding Style

- 2 spaces for indentation rather than tabs
- You can try running `pnpm lint` for style unification

## Development Workflow

In this section, you'll find the basic commands you need to run for building, testing, and maintaining the quality of
the codebase.

### Building the Project

To compile the project and generate the necessary artifacts, use the build command:

```shell
pnpm build
```

You can build the project in watch mode by using the following command for faster feedback:

```shell
pnpm build:watch
```

### Running Tests

To ensure your contributions do not break any existing functionality, run the test suite with the following command:

```shell
pnpm test
```

You can run the tests in watch mode by running the following command for faster feedback:

```shell
pnpm dev
```

### Linting Your Code

It's important to maintain the coding standards of the project. Lint your code by executing:

```shell
pnpm lint
```

### Working on the CLI

If you want to quickly test your changes to the CLI, you can do the following:

#### create-solana-dapp

Run the build in watch mode in one terminal:

```shell
pnpm build:watch
```

In another terminal, move to the directory where you want to test the `create-solana-dapp` CLI and run by invoking the
`node` command with the path to the compiled CLI:

```shell
cd /tmp
node ~/path/to/create-solana-dapp/dist/bin/index.cjs --help
```

### Committing Your Changes

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for commit:

- `fix`: a commit of the type fix patches a bug in your codebase (this correlates with PATCH in semantic versioning).
- `feat`: a commit of the type feat introduces a new feature to the codebase (this correlates with MINOR in semantic
  versioning).
- `BREAKING CHANGE`: a commit that has the text BREAKING CHANGE: at the beginning of its optional body or footer section
  introduces a breaking API change (correlating with MAJOR in semantic versioning). A BREAKING CHANGE can be part of
  commits of any type.
- Others: commit types other than fix: and feat: are allowed, for example @commitlint/config-conventional (based on the
  Angular convention) recommends build:, chore:, ci:, docs:, style:, refactor:, perf:, test:, and others.

## License

By contributing, you agree that your contributions will be licensed under its MIT License.

## References

This document was adapted from the open-source contribution guidelines for
[Facebook's Draft](https://github.com/facebook/draft-js/blob/master/CONTRIBUTING.md)
