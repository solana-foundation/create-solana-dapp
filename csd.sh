#!/usr/bin/env bash
#
# csd.sh - Wrapper around create-solana-dapp to make it easier to use during development
#
# These examples assume you have a symlink this script to a location in your PATH, like ~/.local/bin/csd or ~/bin/csd
# $ ln -s $HOME/path/to/create-solana-dapp/csd.sh ~/.local/bin/csd
# or
# $ ln -s $HOME/path/to/create-solana-dapp/csd.sh ~/bin/csd
#
# Create an app using the default prompts and a random unique name:
# $ csd
#
# Create an app using a template and a random unique name:
# $ csd gh:solana-foundation/templates/templates/template-node-express
#
# Create an app using a template and a specific name:
# $ csd gh:solana-foundation/templates/templates/template-node-express my-api
#
# Create an app using a template from a pull request number 35 (must be an active or recent PR):
# $ csd gh:solana-foundation/templates/templates/template-node-express#refs/pull/35/merge
#
# Create an app using create-solana-dapp@next
# $ TAG=next csd
#
# Create an app using a local create-solana-dapp command. Run `pnpm build:watch` in the create-solana-dapp directory to watch for changes.
# $ CMD="node $HOME/path/to/create-solana-dapp/dist/bin/index.cjs --pnpm" csd
#
# Create an app using npx
# $ CMD="npx -y create-solana-dapp@latest" csd
#
# Create an app using yarn
# $ CMD="yarn create solana-dapp" csd
#
# TODO:
# - add support for PARAMS env var to pass additional parameters to create-solana-dapp, like --pnpm or --skip-install
# - add parameters or env vars to controll package manager

# Set defaults for bash
set -o errexit
set -o nounset
set -o pipefail

# Check if TAG is already set in the environment, otherwise use default "latest"
if [[ -z "${TAG+x}" ]]; then
  TAG="latest"
fi

# Check if the CMD is already set in the environment, otherwise use default "create-solana-dapp"
if [[ -z "${CMD+x}" ]]; then
  CMD=("pnpm" "create" "solana-dapp@${TAG}")
else
  read -ra CMD <<< "${CMD}"
fi

# Set a random name for the app in case none is provided
RANDOM_NAME="app$(date +%s)"

# First argument is the template. If we don't have it, we'll run the default prompts and use the random name
if [[ $# -eq 0 ]]; then
  echo "${CMD[@]}" "${RANDOM_NAME}"
  "${CMD[@]}" "${RANDOM_NAME}"
else
  # Template has been provided so no prompts are needed
  TEMPLATE="$1"

  # Verify if this looks like a TEMPLATE url by checking if it starts with https?:// or gh:
  if [[ ! "${TEMPLATE}" =~ ^(https?://|gh:) ]]; then
    echo "Not a valid TEMPLATE. Template must start with https?:// or gh:"
    exit 1
  fi

  ## Second argument is the name. If we don't have it, we'll use the random name
  if [[ $# -eq 2 ]]; then
    # Store second argument in NAME variable
    NAME="$2"
  else
    # Set default NAME
    NAME="${RANDOM_NAME}"
  fi

  # Create app with the provided TEMPLATE and NAME
  echo "${CMD[@]}" --template "${TEMPLATE}" "${NAME}"
  "${CMD[@]}" --template "${TEMPLATE}" "${NAME}"
fi
