# 🚀 LookAtni Scripts TypeScript

Esta pasta contém as versões TypeScript dos scripts shell originais, oferecendo uma alternativa mais robusta e segura para o sistema LookAtni.

## 📁 Scripts Disponíveis

### 🎯 CLI Unificado
- **`cli.ts`** - Interface de linha de comando unificada para todos os scripts

### 🔧 Scripts Principais
- **`extractFiles.ts`** - Extrai arquivos de códigos marcados
- **`generateMarkers.ts`** - Gera marcadores a partir de estruturas de arquivos
- **`testLookatni.ts`** - Suite de testes completa
- **`demo.ts`** - Cria demonstração do sistema

## 🚀 Como Usar

### Via NPM Scripts (Recomendado)

```bash
# CLI unificado
npm run lookatni help
npm run lookatni extract codigo.txt ./projeto
npm run lookatni generate ./src codigo.txt

# Scripts individuais
npm run lookatni:extract codigo.txt ./destino --stats
npm run lookatni:generate ./projeto codigo.txt --exclude node_modules
npm run lookatni:test
npm run lookatni:demo
```

### Via TSX Direto

```bash
# CLI unificado
tsx src/scripts/cli.ts help
tsx src/scripts/cli.ts extract codigo.txt ./projeto
tsx src/scripts/cli.ts generate ./src codigo.txt

# Scripts individuais
tsx src/scripts/extractFiles.ts codigo.txt ./destino --stats
tsx src/scripts/generateMarkers.ts ./projeto codigo.txt --exclude node_modules
tsx src/scripts/testLookatni.ts
tsx src/scripts/demo.ts
```

## 🌟 Vantagens sobre Scripts Shell

### ✅ **Compatibilidade Multiplataforma**
- Funciona em Windows, macOS e Linux
- Não depende de ferramentas shell específicas
- Comportamento consistente em todos os ambientes

### 🛡️ **Segurança Aprimorada**
- Código TypeScript é menos provável de ser detectado como "suspeito"
- Validação de tipos em tempo de compilação
- Tratamento de erros mais robusto

### 🔧 **Funcionalidades Avançadas**
- Interface mais amigável com cores e formatação
- Validação de entrada mais rigorosa
- Relatórios de estatísticas mais detalhados
- Melhor tratamento de caminhos de arquivo

### 🎯 **Manutenibilidade**
- Código mais organizado e orientado a objetos
- Fácil extensão e modificação
- Testes unitários integrados
- Documentação inline

## 📋 Comandos Principais

### Extrair Arquivos
```bash
# Extração básica
npm run lookatni extract codigo.txt ./projeto

# Com opções avançadas
npm run lookatni extract codigo.txt ./destino \
  --dry-run \
  --stats \
  --verbose \
  --interactive

# Validar formato apenas
npm run lookatni extract codigo.txt --format
```

### Gerar Marcadores
```bash
# Geração básica
npm run lookatni generate ./src codigo.txt

# Com filtros
npm run lookatni generate ./projeto codigo.txt \
  --exclude node_modules \
  --exclude "*.log" \
  --include "*.ts" \
  --include "*.js" \
  --max-size 500

# Verbose
npm run lookatni generate ./src codigo.txt --verbose
```

### Executar Testes
```bash
# Testes completos
npm run lookatni test

# Testes com ajuda
npm run lookatni test --help
```

### Criar Demonstração
```bash
# Criar demo
npm run lookatni demo

# Ver ajuda
npm run lookatni demo --help
```

## 🔍 Exemplos Práticos

### Compartilhar um Projeto React
```bash
# Gerar marcadores excluindo dependências
npm run lookatni generate ./meu-app projeto-react.txt \
  --exclude node_modules \
  --exclude dist \
  --exclude .git \
  --include "*.tsx" \
  --include "*.ts" \
  --include "*.css" \
  --include "*.json"

# Extrair em outro local
npm run lookatni extract projeto-react.txt ./novo-projeto
cd novo-projeto && npm install
```

### Criar Backup Portátil
```bash
# Gerar backup completo
npm run lookatni generate ./meu-projeto backup-$(date +%Y%m%d).txt \
  --exclude node_modules \
  --exclude .git \
  --max-size 1000

# Restaurar backup
npm run lookatni extract backup-20250712.txt ./projeto-restaurado
```

### Demonstração Rápida
```bash
# Criar demo e extrair
npm run lookatni demo
npm run lookatni extract demo-code.txt ./demo-web
cd demo-web && open index.html
```

## 📊 Comparação Shell vs TypeScript

| Característica | Shell Scripts | TypeScript Scripts |
|----------------|---------------|-------------------|
| Compatibilidade | Unix/Linux/macOS | Multiplataforma |
| Segurança | Pode ser detectado como suspeito | Mais seguro |
| Manutenibilidade | Moderada | Alta |
| Performance | Rápida | Boa |
| Funcionalidades | Básicas | Avançadas |
| Tratamento de Erros | Básico | Robusto |
| Tipagem | Nenhuma | Forte |
| Testes | Manual | Automatizados |

## 🛠️ Desenvolvimento

### Adicionando Novos Scripts
1. Crie o arquivo `.ts` em `src/scripts/`
2. Implemente a classe principal
3. Adicione exports necessários
4. Atualize `cli.ts` se for um comando principal
5. Adicione script npm em `package.json`

### Executando Durante Desenvolvimento
```bash
# Compilar e verificar tipos
npm run check-types

# Linter
npm run lint

# Testes
npm run lookatni:test

# Watch mode para desenvolvimento
npm run watch
```

## 🎯 Casos de Uso

1. **Publicação de Extensão**: Scripts TypeScript evitam problemas de "conteúdo suspeito"
2. **Desenvolvimento Multiplataforma**: Funciona em qualquer sistema
3. **Integração CI/CD**: Facilita automação de builds
4. **Distribuição**: Pode ser empacotado com a extensão
5. **Educação**: Código mais legível para aprendizado

## 🚀 Roadmap

- [ ] Suporte a configuração via arquivo JSON
- [ ] Plugin para VS Code Tasks
- [ ] API REST para integração web
- [ ] Suporte a templates de projeto
- [ ] Compressão automática de arquivos grandes
- [ ] Integração com Git para versionamento

---

**LookAtni File Markers** - Transformando scripts shell em código TypeScript moderno! 🚀
