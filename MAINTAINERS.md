# Maintaining create-solana-dapp

The document has information for the maintainers of this package.

## Changesets

This repository uses [changesets](https://github.com/changesets/changesets) to control version bumps and generate a
changelog (which will include each merged PR).

To create a new changeset entry, run the following command and follow the prompts to select a semver tag and changelog
entry:

```shell
changeset
```

After PRs are merged with a changeset entry, a bot will automatically create a "Version Packages" PR with a list of
changes since the last published `latest` version. This version PR can be merged to auto update the package version
number accordingly, publish the new version to npm with the `latest` tag, and update the changelog entry for the new
version.

## Publishing new versions

New versions of `create-solana-dapp` are published via the GitHub Actions CI/CD.

When a PR is merged to the `main` branch, a canary release will be published and tagged with `canary` with all the
merged changes.

When the changeset bot generated "Version Packages" PR is merged, the `latest` version will be published via Github
Actions.
