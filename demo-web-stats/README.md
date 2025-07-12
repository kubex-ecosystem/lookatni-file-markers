# 🚀 LookAtni Demo

Este é um exemplo do sistema LookAtni em ação!

## 🌟 O que é o LookAtni?

O LookAtni é um sistema revolucionário que permite:

- ✨ **Compartilhar projetos completos** em um único arquivo texto
- 🔄 **Extrair de volta** todos os arquivos com estrutura preservada
- 🎯 **Marcadores únicos** que nunca conflitam: `//m/ arquivo /m//`
- 🛠️ **Ferramentas poderosas** para geração e extração
- ✅ **Validação automática** de integridade

## 📁 Arquivos incluídos nesta demo:

- `hello.js` - Script JavaScript interativo
- `style.css` - Folha de estilos moderna com gradientes
- `index.html` - Página HTML responsiva
- `README.md` - Este arquivo de documentação

## 🚀 Como usar:

### Extrair os arquivos:
```bash
# Usando TypeScript (recomendado)
tsx extractFiles.ts demo-code.txt ./demo-extracted

# Ou usando os scripts shell (legado)
./extract-files.sh demo-code.txt ./demo-extracted
```

### Gerar marcadores de um projeto:
```bash
# Usando TypeScript
tsx generateMarkers.ts ./meu-projeto codigo-gerado.txt

# Excluindo padrões específicos
tsx generateMarkers.ts ./src projeto.txt --exclude node_modules --exclude "*.log"

# Incluindo apenas arquivos específicos
tsx generateMarkers.ts ./projeto codigo.txt --include "*.js" --include "*.ts" --include "*.css"
```

### Testar o sistema:
```bash
tsx testLookatni.ts
```

## 🎯 Casos de uso:

1. **Compartilhamento rápido**: Envie projetos completos via chat, email ou forum
2. **Backup portátil**: Armazene projetos em arquivos texto simples
3. **Demonstrações**: Mostre código de forma organizada e extraível
4. **Documentação ativa**: Combine docs com código executável
5. **Prototipagem**: Crie estruturas de projeto rapidamente

## 🔧 Comandos úteis:

```bash
# Ver todos os marcadores
grep '^//m/' demo-code.txt

# Contar arquivos
grep '^//m/' demo-code.txt | wc -l

# Buscar arquivo específico
grep '^//m/ style.css /m//' demo-code.txt -A 10

# Validar formato
tsx extractFiles.ts demo-code.txt --format --dry-run
```

Incrível, não é? 🚀

---

**LookAtni Revolution** - Transformando a forma como compartilhamos código!
