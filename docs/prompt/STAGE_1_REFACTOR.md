# Sistema de Desenvolvimento MD-first → HTML Vivo → MCP

Você é um arquiteto de software sênior especializado em criar sistemas de documentação interativa e ferramentas de desenvolvimento. Sua missão é implementar uma arquitetura que transforme arquivos Markdown em interfaces interativas com capacidades de IA.

## Contexto do Sistema

**Arquitetura**: Markdown com frontmatter → Transpiler (LookAtni/PageForge) → HTML + componentes → Interface Kortex → Integração MCP

**Objetivo**: Criar um fluxo de trabalho onde prompts de IA sejam escritos em Markdown padrão, versionados no Git, e executados através de uma interface web interativa.

## Especificações Técnicas

### 1. DSL em Markdown

```markdown
---
title: [Título do documento]
tags: [array de tags]
context:
  repo: [URL do repositório]
  case: [caso específico]
defaults:
  model: [modelo de IA]
  temperature: [valor numérico]
---

# [Seção]

```prompt id="[id_único]" mode="chat" toolHints=["ferramenta1","ferramenta2"]
role: [papel do usuário]
goal: [objetivo específico]
inputs:
  - name: [nome_input]
    type: [select|text|number]
    values: [array de valores se type=select]
template: |
  [Template com variáveis {{variavel}}]
```

### 2. Transpilação para Componentes HTML

Gerar elementos customizados:

```html
<kx-prompt-block
  data-id="[id]"
  data-defaults='[JSON com configurações]'
  data-template="[template string]">
  <kx-field name="[nome]" type="[tipo]" values='[valores JSON]'></kx-field>
  <button class="run">Run with MCP</button>
  <pre class="preview"></pre>
</kx-prompt-block>
```

### 3. Interface MCP

```typescript
interface McpRunRequest {
  prompt: string
  context?: Record<string, any>
  model?: string
  temperature?: number
  toolHints?: string[]
  traceId?: string
}

interface McpRunResponse {
  output: string
  usage?: { tokensIn: number; tokensOut: number }
  artifacts?: Array<{type: "markdown"|"json"|"link"; value: string}>
  logs?: string[]
}
```

### 4. Geração de Índices

- `index.json`: metadados, blocos, inputs
- `toc.json`: hierarquia de headings e âncoras
- Busca local com fuse.js/lunr

### 5. Extensão VSCode

Comandos essenciais:

- `lookatni.openPreview`: preview em painel lateral
- Auto-rebuild em `onDidSaveTextDocument`
- Sidebar com TOC e controles de execução

### 6. UX e Interações

- **Enter** no bloco → executar MCP
- **Cmd/Ctrl + .** → alternar Preview/Source
- Chips clicáveis para context
- "Copy as Markdown" do output
- "Insert below in .md" para versionamento

## Requisitos de Implementação

### Fase 1: Core Engine

1. Parser de frontmatter + blocos `prompt`
2. Transpiler Markdown → HTML com componentes
3. Sistema básico de templates (Handlebars/Mustache)

### Fase 2: Interface Interativa

1. Kortex UI com renderização de campos
2. Integração MCP com validação de toolHints
3. Sistema de preview em tempo real

### Fase 3: Tooling

1. Extensão VSCode completa
2. Sistema de indexação e busca
3. Workflow de versionamento

## Critérios de Sucesso

- Arquivos .md permanecem 100% legíveis no GitHub
- Round-trip: MD → execução → volta para MD
- Versionamento completo
