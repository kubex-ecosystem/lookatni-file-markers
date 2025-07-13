# 📦 Guia de Publicação - LookAtni File Markers

## Pré-requisitos

1. **Conta no NPM**: Certifique-se de ter uma conta no [npmjs.com](https://www.npmjs.com/)
2. **Login local**: Execute `npm login` para fazer login

## 🚀 Passos para Publicação

### 1. Preparar o Build

```bash
# Compilar o projeto
npm run build

# Verificar se tudo está funcionando
node bin/lookatni.js --help
```

### 2. Atualizar a Versão

```bash
# Para patch (1.0.6 -> 1.0.7)
npm version patch

# Para minor (1.0.6 -> 1.1.0)
npm version minor

# Para major (1.0.6 -> 2.0.0)
npm version major
```

### 3. Testar Localmente

```bash
# Instalar globalmente a partir do diretório local
npm pack
npm install -g lookatni-file-markers-*.tgz

# Testar em qualquer diretório
cd /tmp
lookatni --help
lookatni version

# Desinstalar após o teste
npm uninstall -g lookatni-file-markers
```

### 4. Publicar no NPM

```bash
# Publicação normal
npm publish

# Publicação com tag (para versões beta/alpha)
npm publish --tag beta
```

## ✅ Verificação Pós-Publicação

### 1. Verificar no NPM

- Acesse: <https://www.npmjs.com/package/lookatni-file-markers>
- Verifique se a versão foi atualizada

### 2. Testar Instalação Global

```bash
# Instalar a partir do NPM
npm install -g lookatni-file-markers

# Testar comandos
lookatni --help
lookatni version
lookatni extract --help
lookatni generate --help

# Testar funcionalidade básica
mkdir test-lookatni
cd test-lookatni
echo "Teste" > test.txt
lookatni generate . output.txt
```

## 📋 Checklist de Publicação

- [ ] Código commitado e pushed
- [ ] Testes passando
- [ ] Build executado com sucesso
- [ ] Versão atualizada
- [ ] CHANGELOG.md atualizado
- [ ] README.md atualizado (se necessário)
- [ ] Teste local da instalação global
- [ ] NPM login realizado
- [ ] Publicação executada
- [ ] Verificação no site do NPM
- [ ] Teste da instalação pública

## 🔄 Comandos de Manutenção

### Despublicar uma versão (use com cuidado!)

```bash
# Despublicar uma versão específica
npm unpublish lookatni-file-markers@1.0.7

# Despublicar completamente (só nas primeiras 72h)
npm unpublish lookatni-file-markers --force
```

### Deprecar uma versão

```bash
npm deprecate lookatni-file-markers@1.0.6 "Please upgrade to latest version"
```

### Ver informações do pacote

```bash
npm info lookatni-file-markers
npm view lookatni-file-markers versions --json
```

## 🎯 Próximos Passos

Após a publicação inicial:

1. **Documentação**: Atualizar o README principal com instruções de instalação global
2. **GitHub Release**: Criar release tags no GitHub
3. **CI/CD**: Configurar pipeline para publicação automática
4. **Monitoramento**: Acompanhar downloads e issues

---

**Dica**: Sempre teste a instalação global em um ambiente limpo antes de publicar!
