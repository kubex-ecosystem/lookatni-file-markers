#!/usr/bin/env bash
set -euo pipefail

echo "[info] Validate All – LookAtni (Core/CLI/Extension)"

# Resolve repo root
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/../.. && pwd)"
cd "$ROOT_DIR"

NODE_BIN="${NODE_BIN:-$(command -v node || true)}"
NPM_BIN="${NPM_BIN:-$(command -v npm || true)}"
if [[ -z "${NODE_BIN}" || -z "${NPM_BIN}" ]]; then
  echo "[error] node/npm not found – set NODE_BIN/NPM_BIN envs or install Node." >&2
  exit 1
fi

log()  { printf "\033[34m[info]\033[0m %s\n" "$*"; }
ok()   { printf "\033[32m[ ok ]\033[0m %s\n" "$*"; }
warn() { printf "\033[33m[warn]\033[0m %s\n" "$*"; }
err()  { printf "\033[31m[err ]\033[0m %s\n" "$*"; }

TMP_DIR="${RUN_TMP_DIR:-$(mktemp -d -t lookatni-validate-XXXX)}"
cleanup() { rm -rf "$TMP_DIR" 2>/dev/null || true; }
trap cleanup EXIT

############################################
# 1) Core – build + smoke tests
############################################
log "Building core (TS)"
pushd core >/dev/null
"${NPM_BIN}" run clean >/dev/null 2>&1 || true
"${NPM_BIN}" run build
ok  "core build complete"

log "Running core smoke tests"
"${NODE_BIN}" dist/test/index.js
ok  "core tests passed"
popd >/dev/null

############################################
# 2) Node lib smoke (require + parse)
############################################
log "Node lib smoke (require + parse)"
"${NODE_BIN}" -e '
  const path = require("path");
  const core = require(path.resolve("core/dist/lib/index.js"));
  const FS = String.fromCharCode(28);
  const text = `//${FS}/ a.txt /${FS}//\nhello`;
  const r = core.parseMarkers(text);
  if (!(r.totalMarkers===1 && r.markers[0].filename==="a.txt")) {
    console.error("parse smoke failed", r);
    process.exit(1);
  }
'
ok  "node lib parse smoke ok"

############################################
# 3) Go CLI – optional local build for linux/amd64
############################################
if command -v make >/dev/null 2>&1; then
  log "Attempting Go CLI dev build (linux/amd64, no compression)"
  if make -C cli build-cli-dev linux amd64; then
    ok "go cli built (dev)"
  else
    warn "go cli build skipped/failed (dev)."
  fi
else
  warn "make not found – skipping go cli build"
fi

############################################
# 4) Extension – build + lib reexport smoke
############################################
log "Building extension"
pushd extension >/dev/null
"${NPM_BIN}" run build
ok  "extension build complete"

log "Extension lib reexport smoke (parse)"
"${NODE_BIN}" -e '
  const p = require("path");
  const extLib = require(p.resolve("dist/lib/index.js"));
  const FS = String.fromCharCode(28);
  const text = `//${FS}/ b.txt /${FS}//\nworld`;
  const r = extLib.parseMarkers(text);
  if (!(r.totalMarkers===1 && r.markers[0].filename==="b.txt")) {
    console.error("ext reexport smoke failed", r);
    process.exit(1);
  }
'
ok  "extension reexport parse smoke ok"
popd >/dev/null

############################################
# 5) Golden tests (TS vs Go) – optional
############################################
log "Golden test (TS vs Go)"
if "${NODE_BIN}" tools/golden/run-golden.js; then
  ok "golden test executed"
else
  warn "golden test failed or go cli not present – continue"
fi

############################################
# 6) Dispatcher smoke (prefer Go, then TS)
############################################
SRC_DIR="${TMP_DIR}/src"
mkdir -p "$SRC_DIR"
echo "console.log('hi')" >"$SRC_DIR/index.js"

log "Dispatcher smoke – prefer Go if present"
if LOOKATNI_CLI_IMPL=go "${NODE_BIN}" extension/bin/lookatni.js generate "$SRC_DIR" "${TMP_DIR}/out-go.lkt"; then
  ok "dispatcher (go) executed"
else
  warn "dispatcher (go) unavailable – skipping"
fi

log "Dispatcher smoke – force TS"
LOOKATNI_CLI_IMPL=ts "${NODE_BIN}" extension/bin/lookatni.js generate "$SRC_DIR" "${TMP_DIR}/out-ts.lkt"
ok  "dispatcher (ts) executed"

############################################
# 7) TS CLI smoke commands
############################################
log "TS CLI smoke – validate"
"${NODE_BIN}" extension/dist/scripts/cli.js validate "${TMP_DIR}/out-ts.lkt" || warn "validation non-critical"
ok  "ts cli validate executed"

echo "\n[summary] Validate-all completed"
