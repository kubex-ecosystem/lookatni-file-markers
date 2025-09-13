#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

pass() { echo -e "${GREEN}[OK]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }
info() { echo -e "${BLUE}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

if [ ! -f "ORG_FILES.txt" ]; then
  fail "Execute a partir da raiz do projeto."
fi

# Resolve repo root for absolute references
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo -e "\n==== LookAtni — Validate All (Spec, Core, CLI, Ext) ===="

# Resolve tool binaries if not in PATH
NODE_BIN="${NODE_BIN:-}"
GO_BIN="${GO_BIN:-}"
NPM_BIN="${NPM_BIN:-}"

if [ -z "$NODE_BIN" ]; then
  if command -v node >/dev/null 2>&1; then NODE_BIN="$(command -v node)"; else NODE_BIN="/home/user/.nvm/versions/node/v22.17.0/bin/node"; fi
fi
if [ -z "$NPM_BIN" ]; then
  if command -v npm >/dev/null 2>&1; then NPM_BIN="$(command -v npm)"; else NPM_BIN="/home/user/.nvm/versions/node/v22.17.0/bin/npm"; fi
fi
if [ -z "$GO_BIN" ]; then
  if command -v go >/dev/null 2>&1; then GO_BIN="$(command -v go)"; else GO_BIN="/home/user/.go/bin/go"; fi
fi

# 1) Build core
info "Building core (TypeScript)..."
pushd core >/dev/null
if [ ! -d node_modules ]; then
  info "Instalando dependências do core..."
  npm ci >/dev/null 2>&1 || npm install >/dev/null 2>&1 || fail "npm install do core falhou"
fi
npm run build >/dev/null 2>&1 || fail "Core build falhou"
popd >/dev/null
pass "Core build OK"

# 2) Spec fixtures parity (TS Validator)
if [ -x "$NODE_BIN" ]; then
  info "Rodando parity test (spec/fixtures)..."
  PARITY_LOG=$(mktemp)
  if "$NODE_BIN" scripts/test-parity.js >"$PARITY_LOG" 2>&1; then
    pass "Parity OK"
  else
    echo -e "${RED}[FAIL]${NC} Parity test falhou"
    echo "--- Parity output ---"
    cat "$PARITY_LOG"
    echo "----------------------"
    rm -f "$PARITY_LOG"
    exit 1
  fi
else
  warn "Node.js não encontrado — pulando parity test (requer Node >= 16)."
  # Fallback: use CLI validate over fixtures if CLI is available
  if [ -x "cli/bin/lookatni" ]; then
    info "Usando fallback de paridade com CLI validate..."
    cli/bin/lookatni validate spec/fixtures/valid/simple-two-files.lkt >/dev/null 2>&1 && pass "Valid OK (CLI)" || fail "CLI validate falhou em fixture válida"
    if cli/bin/lookatni validate spec/fixtures/invalid/empty-filename.lkt >/dev/null 2>&1; then
      fail "CLI validate deveria falhar em fixture inválida"
    else
      pass "Invalid OK (CLI)"
    fi
    cli/bin/lookatni validate spec/fixtures/edge/duplicate-filenames.lkt >/dev/null 2>&1 && pass "Edge OK (CLI)" || fail "CLI validate falhou em edge"
  fi
fi

# 2.1) Core profiles quick test (TS)
if [ -x "$NODE_BIN" ]; then
  info "Testando perfis do Core (TS)..."
  if "$NODE_BIN" scripts/test-core-profiles.js >/dev/null 2>&1; then
    pass "Core profiles OK"
  else
    warn "Core profiles falharam — verifique localmente"
  fi
fi

# 3) CLI check / build
if [ ! -x "cli/bin/lookatni" ]; then
  info "CLI não encontrado em cli/bin/lookatni — tentando compilar..."
  if [ -x "$GO_BIN" ]; then
    pushd cli >/dev/null
    if command -v make >/dev/null 2>&1; then
      make build >/dev/null 2>&1 || fail "Falha ao compilar CLI via make"
    else
      info "make não encontrado — usando go build direto"
      mkdir -p bin
      "$GO_BIN" build -o bin/lookatni ./cmd/main.go >/dev/null 2>&1 || fail "Falha ao compilar CLI via go build"
    fi
    popd >/dev/null
  else
    warn "Go não encontrado — não foi possível compilar o CLI automaticamente"
  fi
fi

if [ -x "cli/bin/lookatni" ]; then
  info "Checando CLI local..."
  CLI_HELP=$(cli/bin/lookatni --help 2>/dev/null || true)
  [[ "$CLI_HELP" == *"extract"* && "$CLI_HELP" == *"generate"* ]] && pass "CLI comandos básicos OK" || fail "CLI não respondeu como esperado"
else
  warn "CLI bin não encontrado em cli/bin/lookatni (pulei este passo)"
fi

# 4) Pipeline generate→extract (CLI) — opcional
TMPDIR=$(mktemp -d)
cleanup() { rm -rf "$TMPDIR"; }
trap cleanup EXIT

if [ -x "cli/bin/lookatni" ]; then
  info "Teste funcional rápido (generate→extract via CLI)..."
  pushd "$TMPDIR" >/dev/null
  mkdir -p src && echo 'console.log("ok")' > src/index.js && echo '# ok' > README.md
  GEN_LOG=$(mktemp)
  if ! "$REPO_ROOT/cli/bin/lookatni" generate . out.lkt >"$GEN_LOG" 2>&1; then
    echo -e "${RED}[FAIL]${NC} CLI generate falhou"
    echo "--- CLI generate output ---"; cat "$GEN_LOG"; echo "----------------------------"; rm -f "$GEN_LOG"; exit 1
  fi
  mkdir -p out && "$REPO_ROOT/cli/bin/lookatni" extract out.lkt out >/dev/null 2>&1 || fail "CLI extract falhou"
  [ -f out/src/index.js ] && [ -f out/README.md ] && pass "Functional generate→extract OK" || fail "Arquivos não extraídos"
  popd >/dev/null
fi

# 4.1) Go unit tests for header & count (optional)
if command -v go >/dev/null 2>&1; then
  info "Rodando testes Go (parser headers)..."
  (cd "$REPO_ROOT/cli/internal/parser" && go test -run TestGenerateFromDirectory_HeaderAndCount -v) >/dev/null 2>&1 && pass "Go tests (parser) OK" || warn "Go tests (parser) falharam — verifique localmente"
fi

# 5) Extensão — verificação de duplicados removidos
info "Verificando remoção de duplicados na extensão..."
if grep -R "markerParser" -n extension/src >/dev/null 2>&1 || grep -R "markerGenerator" -n extension/src >/dev/null 2>&1; then
  fail "Duplicados ainda referenciados na extensão"
else
  pass "Extensão sem duplicados locais (usa core)"
fi

# 6) Tools smoke tests
if command -v node >/dev/null 2>&1; then
  info "Testando ferramentas em tools/ ..."
  bash tools/test-tools.sh >/dev/null 2>&1 && pass "Tools OK" || fail "Tools falharam"
else
  warn "Node.js não encontrado — pulando testes das ferramentas (requer Node)."
fi

echo -e "\n${GREEN}Tudo certo!${NC}"
