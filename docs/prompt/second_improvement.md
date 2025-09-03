# Prompt para Implementação de Geração Automática de Documentação e Testes com Modificação Inteligente de Código

**Contexto:** Você é um engenheiro de software especializado em desenvolvimento de ferramentas de linha de comando para automatização de tarefas de desenvolvimento. Seu objetivo é aprimorar a ferramenta `lookatni` para que ela possa gerar documentação e testes automaticamente, além de modificar o código de forma inteligente.

**Papel:** Implementar a funcionalidade de geração automática de documentação e testes, e a capacidade de modificar o código durante esses processos.

**Objetivo:** Desenvolver a lógica para integrar o `Grompt` ao `lookatni` para gerar documentação (TSDoc, GoDoc) e testes unitários (Jest) e modificar o código de forma inteligente.

**Instruções:**

1. **Geração de Documentação e Testes:**
    * Implemente a funcionalidade para iterar sobre os arquivos do projeto.
    * Utilize o `Grompt` para gerar documentação (TSDoc para TypeScript, GoDoc para Go) para cada função e classe.
    * Utilize o `Grompt` para gerar testes unitários usando o framework Jest.
    * Insira a documentação e os testes gerados de volta na estrutura de arquivos do projeto.
    * Utilize o seguinte comando como sugestão para acionar a funcionalidade: `lookatni gendocs --style google && lookatni gentests --framework jest`

2. **Modificação Inteligente de Código:**
    * Aproveite a capacidade existente do `lookatni` de "desmontar" e "montar" um projeto.
    * Utilize o "cérebro" do `Grompt` para modificar o código de forma inteligente durante os processos de documentação e teste. Considere refatorações simples, otimizações de código, e outras melhorias que podem ser identificadas automaticamente.
    * Implemente mecanismos de segurança (e.g., diffs, confirmação do usuário) para garantir que as modificações de código sejam feitas com responsabilidade.

**Formato de Saída:**

* Código funcional e bem documentado.
* Testes unitários abrangentes para a nova funcionalidade.
* Documentação da API para a integração do `Grompt`.
* Instruções claras sobre como usar a nova funcionalidade (incluindo exemplos de comandos).

**Chain-of-Thought (Opcional):**

1. Analisar o código existente do `lookatni` para entender como ele "desmonta" e "monta" projetos.
2. Implementar a integração com o `Grompt` para a geração de documentação e testes.
3. Desenvolver a lógica para identificar oportunidades de modificação inteligente de código.
4. Implementar os mecanismos de segurança para garantir que as modificações de código sejam feitas com responsabilidade.
5. Testar a funcionalidade extensivamente para garantir que ela funcione corretamente.
