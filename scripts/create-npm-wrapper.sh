#!/bin/bash

# 🚀 LookAtni NPM Global Package Creator
# Cria um wrapper Node.js que usa o CLI Go como engine
# Seguindo filosofia Kubex: "Um comando = um resultado"

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[NPM-WRAPPER]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Verificar se estamos na raiz
if [ ! -f "ORG_FILES.txt" ]; then
    echo "Execute da raiz do projeto!"
    exit 1
fi

log "🚀 Criando wrapper NPM global para LookAtni..."

# 1. Criar estrutura do package NPM global
mkdir -p cli/npm-wrapper
cd cli/npm-wrapper

# 2. Criar package.json para o wrapper global
log "📦 Criando package.json para wrapper global..."
cat > package.json << 'EOF'
{
  "name": "lookatni-file-markers",
  "version": "1.2.0",
  "description": "LookAtni File Markers - Advanced file organization with unique markers",
  "main": "index.js",
  "bin": {
    "lookatni": "./bin/lookatni.js"
  },
  "files": [
    "bin/",
    "binaries/",
    "README.md"
  ],
  "engines": {
    "node": ">=16.0.0"
  },
  "keywords": [
    "file-markers",
    "code-organization",
    "project-management",
    "development-tools",
    "cli"
  ],
  "author": "Rafael Mori <faelmori@gmail.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/kubex-ecosystem/lookatni-file-markers.git"
  },
  "homepage": "https://github.com/kubex-ecosystem/lookatni-file-markers#readme",
  "preferGlobal": true
}
EOF

# 3. Criar diretório para binários
mkdir -p binaries bin

# 4. Copiar binário Go (se existir)
if [ -f "../bin/lookatni" ]; then
    log "📋 Copiando binário Go..."
    cp ../bin/lookatni binaries/lookatni-linux-amd64
else
    log "⚠️  Binário Go não encontrado - execute 'make build' no cli/ primeiro"
fi

# 5. Criar wrapper Node.js
log "🔧 Criando wrapper Node.js..."
cat > bin/lookatni.js << 'EOF'
#!/usr/bin/env node

/**
 * 🚀 LookAtni CLI Wrapper - NPM Global
 * Este wrapper usa o CLI Go como engine
 * Seguindo filosofia Kubex: "Um comando = um resultado"
 */

const { spawn } = require('child_process');
const { resolve, join } = require('path');
const { existsSync } = require('fs');
const os = require('os');

function getBinaryPath() {
  const platform = os.platform();
  const arch = os.arch();

  // Mapear para nomes dos binários
  let binaryName = 'lookatni';

  if (platform === 'linux') {
    binaryName = 'lookatni-linux-amd64';
  } else if (platform === 'darwin') {
    binaryName = 'lookatni-darwin-amd64';
  } else if (platform === 'win32') {
    binaryName = 'lookatni-windows-amd64.exe';
  }

  const binaryPath = resolve(__dirname, '..', 'binaries', binaryName);

  if (!existsSync(binaryPath)) {
    console.error(`❌ Binário não encontrado: ${binaryPath}`);
    console.error(`Platform: ${platform}, Arch: ${arch}`);
    console.error('📞 Reporte este problema: https://github.com/kubex-ecosystem/lookatni-file-markers/issues');
    process.exit(1);
  }

  return binaryPath;
}

function executeLookAtni() {
  const binaryPath = getBinaryPath();
  const args = process.argv.slice(2);

  // Spawnar o processo Go CLI
  const child = spawn(binaryPath, args, {
    stdio: 'inherit',
    env: process.env
  });

  // Tratar sinais
  process.on('SIGINT', () => {
    child.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    child.kill('SIGTERM');
  });

  // Aguardar conclusão
  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
    } else {
      process.exit(code || 0);
    }
  });

  child.on('error', (error) => {
    console.error('❌ Erro ao executar LookAtni CLI:', error.message);
    process.exit(1);
  });
}

// Executar!
executeLookAtni();
EOF

# 6. Tornar executável
chmod +x bin/lookatni.js

# 7. Criar README
log "📝 Criando README..."
cat > README.md << 'EOF'
# LookAtni File Markers - CLI Global

🚀 **Sistema avançado de marcadores de arquivo para organização e compartilhamento de projetos.**

## Instalação Global

```bash
npm install -g lookatni-file-markers
```

## Uso

```bash
# Extrair arquivos de conteúdo marcado
lookatni extract codigo.txt ./projeto

# Gerar marcadores de uma estrutura de pastas
lookatni generate ./src output.txt

# Validar integridade dos marcadores
lookatni validate arquivo.txt

# Ver todos os comandos
lookatni --help
```

## Engine

Este package NPM é um wrapper que usa o CLI Go como engine para máxima performance e compatibilidade.

---

**Documentação completa:** https://github.com/kubex-ecosystem/lookatni-file-markers
EOF

cd ../..

info "✅ Wrapper NPM global criado em cli/npm-wrapper/"
info "🔧 Para testar localmente:"
info "   cd cli/npm-wrapper && npm link"
info "📦 Para publicar:"
info "   cd cli/npm-wrapper && npm publish"

log "🎉 Wrapper NPM pronto!"
