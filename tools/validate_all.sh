#!/usr/bin/env bash
# Wrapper that exposes a validate_all() function for Makefile/support flows.
# It delegates to tools/ci/validate-all.sh (standalone runner).

validate_all() {
  set -euo pipefail

  # Resolve repo root from this file location
  local SELF_DIR
  SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  local ROOT_DIR
  ROOT_DIR="$(cd "${SELF_DIR}/.." && pwd)"

  # Ensure node/npm are discoverable for the downstream script
  export NODE_BIN="${NODE_BIN:-$(command -v node || true)}"
  export NPM_BIN="${NPM_BIN:-$(command -v npm || true)}"
  export GO_BIN="${GO_BIN:-$(command -v go || true)}"

  local CI_SCRIPT
  CI_SCRIPT="${SELF_DIR}/ci/validate-all.sh"
  if [[ ! -f "${CI_SCRIPT}" ]]; then
    echo "[validate_all] CI script not found at ${CI_SCRIPT}" >&2
    return 1
  fi
  chmod +x "${CI_SCRIPT}" || true

  # Delegate to CI script
  "${CI_SCRIPT}"
}

# If executed directly, run validate_all(); if sourced, only define the function.
if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  validate_all
fi

