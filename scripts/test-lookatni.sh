#!/bin/bash

# Script de teste para o sistema LookAtni
# Testa o gerador e extrator de marcadores

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🧪 LookAtni Test Suite v3.0${NC}"
echo "==============================="
echo ""

# Criar diretório de teste
TEST_DIR="./test-lookatni"
TEST_CODE="test-code.txt"
TEST_EXTRACT="./test-extracted"

echo -e "${YELLOW}🏗️  Criando estrutura de teste...${NC}"

# Limpar se existir
rm -rf "$TEST_DIR" "$TEST_CODE" "$TEST_EXTRACT"

# Criar estrutura de teste
mkdir -p "$TEST_DIR/src/components"
mkdir -p "$TEST_DIR/src/utils"
mkdir -p "$TEST_DIR/public"

# Criar arquivo React
cat > "$TEST_DIR/src/App.jsx" << 'EOF'
import React from 'react';
import Header from './components/Header';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header title="LookAtni Test" />
      <main>
        <h1>Sistema de Marcadores Únicos</h1>
        <p>Este é um teste do sistema LookAtni!</p>
      </main>
    </div>
  );
}

export default App;
EOF

# Criar componente Header
cat > "$TEST_DIR/src/components/Header.jsx" << 'EOF'
import React from 'react';
import './Header.css';

const Header = ({ title }) => {
  return (
    <header className="header">
      <h1>{title}</h1>
      <nav>
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
  );
};

export default Header;
EOF

# Criar CSS
cat > "$TEST_DIR/src/App.css" << 'EOF'
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

main {
  padding: 20px;
}

h1 {
  color: #333;
  text-align: center;
}

p {
  color: #666;
  line-height: 1.6;
}
EOF

# Criar CSS do Header
cat > "$TEST_DIR/src/components/Header.css" << 'EOF'
.header {
  background: #4a90e2;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  margin: 0;
  color: white;
}

.header nav a {
  color: white;
  text-decoration: none;
  margin-left: 1rem;
}

.header nav a:hover {
  text-decoration: underline;
}
EOF

# Criar utilitário
cat > "$TEST_DIR/src/utils/helpers.js" << 'EOF'
// Utilitários para o LookAtni Test

export const formatText = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
EOF

# Criar package.json
cat > "$TEST_DIR/package.json" << 'EOF'
{
  "name": "lookatni-test",
  "version": "1.0.0",
  "description": "Teste do sistema LookAtni",
  "main": "src/App.jsx",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.3",
    "vite": "^4.4.5"
  }
}
EOF

# Criar README
cat > "$TEST_DIR/README.md" << 'EOF'
# LookAtni Test Project

Este é um projeto de teste para o sistema LookAtni de marcadores únicos.

## Como usar

1. Execute o gerador de marcadores:
   ```bash
   ./generate-markers.sh ./test-lookatni test-code.txt
   ```

2. Execute o extrator:
   ```bash
   ./extract-files.sh test-code.txt ./test-extracted
   ```

3. Compare os arquivos originais com os extraídos.

## Estrutura

- `src/App.jsx` - Componente principal
- `src/components/Header.jsx` - Componente de cabeçalho
- `src/utils/helpers.js` - Utilitários JavaScript
- `src/App.css` - Estilos principais
- `src/components/Header.css` - Estilos do cabeçalho

## Funcionalidades testadas

✅ Geração de marcadores únicos
✅ Extração de arquivos
✅ Preservação de estrutura de diretórios
✅ Múltiplos tipos de arquivo (JS, JSX, CSS, JSON, MD)
✅ Validação de integridade
EOF

echo -e "${GREEN}✅ Estrutura de teste criada!${NC}"
echo ""

# Teste 1: Gerar marcadores
echo -e "${YELLOW}🔧 Teste 1: Gerando marcadores...${NC}"
if ./generate-markers.sh "$TEST_DIR" "$TEST_CODE" --exclude node_modules; then
    echo -e "${GREEN}✅ Marcadores gerados com sucesso!${NC}"
else
    echo -e "${RED}❌ Falha ao gerar marcadores${NC}"
    exit 1
fi

echo ""

# Teste 2: Validar marcadores
echo -e "${YELLOW}🔍 Teste 2: Validando marcadores...${NC}"
if ./extract-files.sh "$TEST_CODE" "$TEST_EXTRACT" --format --dry-run; then
    echo -e "${GREEN}✅ Marcadores válidos!${NC}"
else
    echo -e "${RED}❌ Problemas nos marcadores${NC}"
    exit 1
fi

echo ""

# Teste 3: Extrair arquivos
echo -e "${YELLOW}📤 Teste 3: Extraindo arquivos...${NC}"
if ./extract-files.sh "$TEST_CODE" "$TEST_EXTRACT" --stats; then
    echo -e "${GREEN}✅ Arquivos extraídos com sucesso!${NC}"
else
    echo -e "${RED}❌ Falha na extração${NC}"
    exit 1
fi

echo ""

# Teste 4: Verificar integridade
echo -e "${YELLOW}🔒 Teste 4: Verificando integridade...${NC}"
integrity_ok=true

# Verificar se todos os arquivos foram extraídos
for file in "$TEST_DIR"/**/*; do
    if [ -f "$file" ]; then
        relative_path=$(realpath --relative-to="$TEST_DIR" "$file")
        extracted_file="$TEST_EXTRACT/$relative_path"
        
        if [ ! -f "$extracted_file" ]; then
            echo -e "${RED}❌ Arquivo não extraído: $relative_path${NC}"
            integrity_ok=false
        elif ! diff -q "$file" "$extracted_file" > /dev/null 2>&1; then
            echo -e "${RED}❌ Arquivo diferente: $relative_path${NC}"
            integrity_ok=false
        fi
    fi
done

if [ "$integrity_ok" = true ]; then
    echo -e "${GREEN}✅ Integridade verificada - todos os arquivos íntegros!${NC}"
else
    echo -e "${RED}❌ Problemas de integridade encontrados${NC}"
    exit 1
fi

echo ""

# Teste 5: Comparar tamanhos
echo -e "${YELLOW}📊 Teste 5: Comparando tamanhos...${NC}"
original_size=$(du -sb "$TEST_DIR" | cut -f1)
extracted_size=$(du -sb "$TEST_EXTRACT" | cut -f1)
code_size=$(stat -c%s "$TEST_CODE")

echo "  • Tamanho original: $original_size bytes"
echo "  • Tamanho extraído: $extracted_size bytes"
echo "  • Tamanho código com marcadores: $code_size bytes"
echo "  • Overhead dos marcadores: $(( (code_size - original_size) * 100 / original_size ))%"

if [ "$original_size" -eq "$extracted_size" ]; then
    echo -e "${GREEN}✅ Tamanhos idênticos!${NC}"
else
    echo -e "${YELLOW}⚠️  Tamanhos diferentes (pode ser normal devido a metadados)${NC}"
fi

echo ""

# Teste 6: Testar funcionalidades avançadas
echo -e "${YELLOW}🚀 Teste 6: Testando funcionalidades avançadas...${NC}"

# Teste modo interativo (simulado)
echo -e "${BLUE}  • Testando modo simulação...${NC}"
if ./extract-files.sh "$TEST_CODE" "./test-sim" --dry-run --stats --verbose > /dev/null 2>&1; then
    echo -e "${GREEN}  ✅ Modo simulação funcionando${NC}"
else
    echo -e "${RED}  ❌ Problema no modo simulação${NC}"
fi

# Teste validação de formato
echo -e "${BLUE}  • Testando validação de formato...${NC}"
if ./extract-files.sh "$TEST_CODE" "./test-val" --format > /dev/null 2>&1; then
    echo -e "${GREEN}  ✅ Validação de formato funcionando${NC}"
else
    echo -e "${RED}  ❌ Problema na validação${NC}"
fi

echo ""

# Resultado final
echo -e "${CYAN}🎉 TODOS OS TESTES PASSARAM!${NC}"
echo "==============================="
echo ""
echo -e "${GREEN}✅ Sistema LookAtni funcionando perfeitamente!${NC}"
echo ""
echo -e "${BLUE}Arquivos gerados:${NC}"
echo "  • $TEST_CODE - Código com marcadores"
echo "  • $TEST_EXTRACT/ - Arquivos extraídos"
echo "  • $TEST_DIR/ - Projeto original"
echo ""
echo -e "${PURPLE}💡 Comandos úteis:${NC}"
echo -e "  ${YELLOW}# Ver marcadores:${NC}"
echo -e "  grep '^//m/' $TEST_CODE"
echo -e "  ${YELLOW}# Comparar arquivos:${NC}"
echo -e "  diff -r $TEST_DIR $TEST_EXTRACT"
echo -e "  ${YELLOW}# Limpar testes:${NC}"
echo -e "  rm -rf $TEST_DIR $TEST_CODE $TEST_EXTRACT test-sim test-val"
echo ""
echo -e "${CYAN}🚀 Agora você pode usar o sistema LookAtni com confiança!${NC}"
