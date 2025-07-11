# 🚀 Configuração Azure DevOps para Publicação Automática

Este guia explica como configurar a publicação automática da extensão LookAtni Revolution através do Azure DevOps.

## 📋 Pré-requisitos

1. **Repositório importado no Azure DevOps** ✅ (já feito)
2. **Personal Access Token (PAT)** do VS Code Marketplace
3. **Service Connection** configurado no Azure DevOps

## 🔧 Configuração

### 1. Personal Access Token (PAT)

Você já tem o PAT: `CAkiyONgDlrlDBekQGihp8dexGy9gEXtOi5E704ps0HuSeVIDVsdJQQJ99BGACAAAAAAAAAAAAAGAZDO3WY8`

### 2. Configurar Variável no Azure DevOps

1. Vá para o seu projeto no Azure DevOps
2. **Pipelines** → **Library** → **Variable Groups**
3. Crie um novo **Variable Group** chamado `marketplace-secrets`
4. Adicione a variável:
   - **Name:** `VSCE_PAT`
   - **Value:** `CAkiyONgDlrlDBekQGihp8dexGy9gEXtOi5E704ps0HuSeVIDVsdJQQJ99BGACAAAAAAAAAAAAAGAZDO3WY8`
   - ✅ Marque como **Secret/Hidden**

### 3. Criar Pipeline

1. No Azure DevOps: **Pipelines** → **New Pipeline**
2. Escolha **Azure Repos Git**
3. Selecione seu repositório `lookatni-revolution`
4. Escolha **Existing Azure Pipelines YAML file**
5. Selecione `/azure-pipelines.yml`
6. **Save and run**

## 🔄 Como Funciona

O pipeline será executado automaticamente quando:
- ✅ Fizer push para branch `main` ou `master`
- ✅ Criar um Pull Request para essas branches

### Etapas do Pipeline:

1. **Install Node.js** - Instala Node.js 18.x
2. **Install dependencies** - `npm ci`
3. **Build extension** - `npm run package`
4. **Install vsce** - Instala ferramenta de publicação
5. **Package extension** - Cria arquivo `.vsix`
6. **Publish to Marketplace** - Publica automaticamente (só na branch main)

## 🎯 Vantagens da Publicação via Azure DevOps

1. **✅ Fonte Confiável:** Microsoft reconhece Azure DevOps como fonte segura
2. **✅ Evita "Suspicious Content":** Pipelines são considerados mais seguros
3. **✅ Automático:** Publicação automática a cada commit
4. **✅ Histórico:** Rastreabilidade completa de deployments
5. **✅ Rollback:** Fácil reverter para versões anteriores

## 📝 Próximos Passos

1. **Configure a variável VSCE_PAT** no Azure DevOps
2. **Commit e push** este arquivo junto com `azure-pipelines.yml`
3. **Execute o pipeline** manualmente pela primeira vez
4. **Teste** fazendo um commit na branch main

## 🔍 Monitoramento

- **Pipeline Runs:** Azure DevOps → Pipelines → Runs
- **Logs:** Clique em qualquer run para ver logs detalhados
- **Status:** O pipeline mostrará se a publicação foi bem-sucedida

## 🆘 Troubleshooting

Se der erro:
1. Verifique se o PAT está correto e não expirou
2. Confirme que a variável `VSCE_PAT` está configurada como secret
3. Verifique os logs do pipeline para erros específicos
4. Teste localmente: `vsce package` antes de publicar

---

**💡 Dica:** Com essa configuração, você nunca mais precisará publicar manualmente! Basta fazer commit na branch main que a extensão será automaticamente publicada no marketplace.
