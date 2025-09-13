# Regras de Refatoração LookAtni + Grompt

## Regras Gerais de Qualidade de Código

### 1. **Estrutura e Organização**

1.1. Organize código em modules/packages com responsabilidades bem definidas
1.2. Use naming conventions consistentes (camelCase, PascalCase, kebab-case conforme linguagem)
1.3. Mantenha funções pequenas e focadas (máximo 20-30 linhas)
1.4. Evite aninhamento excessivo (máximo 3 níveis)

### 2. **Tratamento de Erros**

2.1. Sempre trate erros explicitamente
2.2. Use patterns de error handling apropriados para cada linguagem
2.3. Forneça mensagens de erro descritivas e contextualizadas
2.4. Implemente logging adequado para debugging

### 3. **Performance e Eficiência**

3.1. Evite loops desnecessários e operações custosas
3.2. Use algoritmos eficientes e estruturas de dados apropriadas
3.3. Considere lazy loading e memoização quando aplicável
3.4. Minimize allocações de memória desnecessárias

### 4. **Segurança**

4.1. Sanitize todas as entradas de usuário
4.2. Use validação rigorosa de dados
4.3. Evite hardcoded secrets e configurações sensíveis
4.4. Implemente proper authentication/authorization

### 5. **Documentação e Comentários**

5.1. Documente APIs públicas e interfaces
5.2. Use comentários para explicar "porquês", não "o quês"
5.3. Mantenha README.md atualizado
5.4. Inclua exemplos de uso quando apropriado

## Regras Específicas TypeScript → Go

### 6. **Tipagem e Interfaces**

6.1. Converta interfaces TypeScript para interfaces Go idiomáticas
6.2. Use type assertions com verificação de erro
6.3. Prefira composition over inheritance
6.4. Use embedded structs para reutilização de código

### 7. **Async/Concorrência**

7.1. Converta Promises/async-await para goroutines + channels
7.2. Use context.Context para cancelamento e timeouts
7.3. Implemente proper error handling em goroutines
7.4. Use sync.WaitGroup para coordenar goroutines

### 8. **Manipulação de Dados**

8.1. Use slices ao invés de arrays sempre que possível
8.2. Implemente proper JSON marshaling/unmarshaling
8.3. Use structs com tags apropriadas (json, yaml, etc)
8.4. Valide dados com bibliotecas como validator

### 9. **Padrões Go Idiomáticos**

9.1. Use `:=` para declaração e inicialização
9.2. Return early para reduzir nesting
9.3. Use blank identifier `_` para valores não utilizados
9.4. Implemente String() method para tipos customizados

### 10. **Testes e Qualidade**

10.1. Implemente table-driven tests
10.2. Use testify para assertions complexas
10.3. Mantenha coverage alto em business logic
10.4. Mock dependencies via interfaces

## Regras de Refatoração Específicas do LookAtni

### 11. **Integração com Grompt**

11.1. Use a interface Provider para abstrair LLM providers
11.2. Implemente proper error handling para chamadas de API
11.3. Use batch processing quando possível
11.4. Mantenha histórico de interações

### 12. **Processamento de Artefatos**

12.1. Valide artefatos antes de processar
12.2. Use streaming para arquivos grandes
12.3. Implemente checksum/hash para verificação de integridade
12.4. Mantenha backup de artefatos originais

### 13. **CLI e Usabilidade**

13.1. Use cobra.Command para consistência
13.2. Implemente flags e argumentos claros
13.3. Forneça help text descritivo
13.4. Use progress bars para operações longas

### 14. **Logging e Debugging**

14.1. Use gl.Log com níveis apropriados (debug, info, warn, error, fatal)
14.2. Inclua contexto relevante nos logs
14.3. Use structured logging quando possível
14.4. Implemente verbose mode para debugging
