#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)

echo "[tools] Testing pipe-to-stdout extractor..."
OUT=$(cat "$ROOT_DIR/spec/fixtures/valid/simple-two-files.lkt" | node "$ROOT_DIR/tools/lookatni-pipe-extract.js" README.md)
[[ "$OUT" == "# Sample Project"* ]] || { echo "pipe-extract-to-stdout failed"; exit 1; }

echo "[tools] Testing directory extractor..."
TMPDIR=$(mktemp -d)
trap "rm -rf '$TMPDIR'" EXIT
cat "$ROOT_DIR/spec/fixtures/valid/simple-two-files.lkt" | node "$ROOT_DIR/tools/pipe-extract.js" "$TMPDIR/out" >/dev/null
[[ -f "$TMPDIR/out/README.md" && -f "$TMPDIR/out/src/index.js" ]] || { echo "pipe-extract directory failed"; exit 1; }

echo "[tools] OK"

