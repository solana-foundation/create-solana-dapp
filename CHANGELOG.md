# create-solana-dapp

## 4.7.1

### Patch Changes

- [#212](https://github.com/solana-foundation/create-solana-dapp/pull/212)
  [`8e1a20f`](https://github.com/solana-foundation/create-solana-dapp/commit/8e1a20ff0e49a5a7c1abdfe83e41187953d0dc44)
  Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - Remove repokit dependency and replace with local utilities. This
  change eliminates the external `@beeman/repokit` canary dependency and replaces it with three local utility modules
  that provide the same functionality:
  - `src/utils/template-schema.ts` - Zod schemas and TypeScript types for template validation
  - `src/utils/fetch-templates.ts` - Fetches and parses templates.json from remote URLs
  - `src/utils/menu-utils.ts` - Menu transformation logic for template selection

  This change maintains full backward compatibility with existing templates.json format while adding support for new
  optional metadata fields (displayName, usecase, image) introduced in solana-foundation/templates#170.

  Benefits:
  - No dependency on external canary releases
  - Full control over template parsing logic
  - Smaller bundle size (only code actually used)
  - Type-safe with Zod validation
  - Easier to maintain and debug

## 4.7.0

### Minor Changes

- [#205](https://github.com/solana-foundation/create-solana-dapp/pull/205)
  [`49c4050`](https://github.com/solana-foundation/create-solana-dapp/commit/49c40509000d2e5987aa30b513ae1343157cab8e)
  Thanks [@beeman](https://github.com/beeman)! - add `--minimal` flag to that selects 'gill-next-tailwind-minimal'

### Patch Changes

- [#207](https://github.com/solana-foundation/create-solana-dapp/pull/207)
  [`cea96d8`](https://github.com/solana-foundation/create-solana-dapp/commit/cea96d88dec5c79bb204b39b940147c3fb7a69d9)
  Thanks [@beeman](https://github.com/beeman)! - update solana docs url

## 4.6.0

### Minor Changes

- [#111](https://github.com/solana-foundation/create-solana-dapp/pull/111)
  [`bd604d3`](https://github.com/solana-foundation/create-solana-dapp/commit/bd604d3dc646191c0427ce2d6ee7911ae61a7c78)
  Thanks [@beeman](https://github.com/beeman)! - dynamic template lists by fetching them from registry url

## 4.5.0

### Minor Changes

- [#184](https://github.com/solana-foundation/create-solana-dapp/pull/184)
  [`f752313`](https://github.com/solana-foundation/create-solana-dapp/commit/f752313290b5f59aa98a19ddd6d927a3202ece2e)
  Thanks [@beeman](https://github.com/beeman)! - add version check (update notification)

### Patch Changes

- [#185](https://github.com/solana-foundation/create-solana-dapp/pull/185)
  [`7659159`](https://github.com/solana-foundation/create-solana-dapp/commit/7659159f554b73fe2b92c0f31d6058e56a8fc994)
  Thanks [@beeman](https://github.com/beeman)! - don't run e2e tests when Markdown files are changed

## 4.4.0

### Minor Changes

- [#181](https://github.com/solana-foundation/create-solana-dapp/pull/181)
  [`2e0db93`](https://github.com/solana-foundation/create-solana-dapp/commit/2e0db93ca82258b5701065031e8849859d798746)
  Thanks [@beeman](https://github.com/beeman)! - add Solana Mobile templates

### Patch Changes

- [#170](https://github.com/solana-foundation/create-solana-dapp/pull/170)
  [`090b4d7`](https://github.com/solana-foundation/create-solana-dapp/commit/090b4d7cb4019a7addb51113321d82f289b820e3)
  Thanks [@beeman](https://github.com/beeman)! - gracefully handle git commits with no configured name and email

- [#178](https://github.com/solana-foundation/create-solana-dapp/pull/178)
  [`7c28c56`](https://github.com/solana-foundation/create-solana-dapp/commit/7c28c56a5ddf00716e3d52b078197bbc95066831)
  Thanks [@beeman](https://github.com/beeman)! - update picocolors import to resolve SyntaxError in ESM module

## 4.3.3

### Patch Changes

- [#168](https://github.com/solana-foundation/create-solana-dapp/pull/168)
  [`7cf4cfb`](https://github.com/solana-foundation/create-solana-dapp/commit/7cf4cfb1c3e561f9712000f6bb5c4558b1954220)
  Thanks [@beeman](https://github.com/beeman)! - enable template-react-vite-tailwind-{basic,counter} template

## 4.3.2

### Patch Changes

- [#164](https://github.com/solana-foundation/create-solana-dapp/pull/164)
  [`dde3428`](https://github.com/solana-foundation/create-solana-dapp/commit/dde3428b7236bbe73fecb1016cfa1c21b0996f0c)
  Thanks [@beeman](https://github.com/beeman)! - add build step to publish-packages workflow

## 4.3.1

### Patch Changes

- [#162](https://github.com/solana-foundation/create-solana-dapp/pull/162)
  [`f833848`](https://github.com/solana-foundation/create-solana-dapp/commit/f833848bd6623ada20b67c776ffbe6cbfac035e4)
  Thanks [@beeman](https://github.com/beeman)! - remove 'concurrency' parameter from build-step-decider

## 4.3.0

### Minor Changes

- [#140](https://github.com/solana-foundation/create-solana-dapp/pull/140)
  [`55969f0`](https://github.com/solana-foundation/create-solana-dapp/commit/55969f0ae96f3f427623007ca56e07c0cb113949)
  Thanks [@beeman](https://github.com/beeman)! - Update framework descriptions and structure

- [#159](https://github.com/solana-foundation/create-solana-dapp/pull/159)
  [`c51ef37`](https://github.com/solana-foundation/create-solana-dapp/commit/c51ef37e40b27d7f16a28f1e0d30823afec10d8a)
  Thanks [@tobeycodes](https://github.com/tobeycodes)! - add bun support

### Patch Changes

- [#156](https://github.com/solana-foundation/create-solana-dapp/pull/156)
  [`d60c5cf`](https://github.com/solana-foundation/create-solana-dapp/commit/d60c5cffb2791cbb619997b09c2fdb9dcb4faeb5)
  Thanks [@beeman](https://github.com/beeman)! - add more examples to csd.sh

- [#160](https://github.com/solana-foundation/create-solana-dapp/pull/160)
  [`d50c791`](https://github.com/solana-foundation/create-solana-dapp/commit/d50c7911afaa1260349ab6f1c86b7269cd221611)
  Thanks [@beeman](https://github.com/beeman)! - enable gill-next-tailwind-basic and gill-next-tailwind-counter
  templates

- [#144](https://github.com/solana-foundation/create-solana-dapp/pull/144)
  [`813773d`](https://github.com/solana-foundation/create-solana-dapp/commit/813773d48bf06d9f4b3b2d27e09dbd772b24613e)
  Thanks [@beeman](https://github.com/beeman)! - clean up init script utils
