# CLI

Cross-platform Go CLI for generation, extraction and validation.

!!! note "Legend for invisible markers"
    We display the File Separator (ASCII 28) as ␜ for readability. Real artifacts contain the actual control character.

## Commands

```bash
lookatni generate <source> <output>
lookatni extract <input> <output-dir>
lookatni validate <input> [--strict]
```

## Examples

```bash
cli/bin/lookatni generate ./my-project project.lkt.txt
cli/bin/lookatni extract project.lkt.txt ./restored
cli/bin/lookatni validate project.lkt.txt --strict
```

Outputs are deterministic, ready for automation in CI.

## Header Metadata

`generate` escreve um bloco `PROJECT_INFO` no início do artefato com:

- Project, Generated (ISO-8601), Total Files, Source, Generator
- MarkerSpec (ex.: v1), FS (ex.: 28), MarkerTokens, Encoding

O validador e o extrator autodetectam o separador e respeitam o header.

## Naming Convention (temporary)

- Recomendado: `.lkt.txt` (ex.: `project.lkt.txt`) até publicações e tooling estabilizados.
- Ajuda a manter compatibilidade com viewers/editores que esperam `.txt`.

## Strict Mode

`--strict` sinaliza linhas “quase-marcadores” que não respeitam a regex canônica e considera “zero marcadores” como inválido. Útil para depurar formatação involuntária.

## TS vs Go (Qual usar?)

| Aspecto        | Go (binário)                   | TypeScript (npm)                  |
|----------------|--------------------------------|-----------------------------------|
| Performance    | Excelente startup/IO           | Muito boa para projetos médios    |
| Dependências   | Nenhuma (binário estático)     | Node.js/Runtime                   |
| Integração     | CI/DevOps, ambientes fechados  | VS Code/Node, libs e scripts      |
| DX/Manutenção  | Build cross‑platform           | Tipagem/Tests/Release npm simples |

Recomendação:
- Use Go em pipelines/CI ou para projetos grandes e ambientes sem Node.
- Use TS quando integrar com VS Code/Node, ou precisar de API programática (lookatni-core).

## Dispatcher (npm bin)

O executável `lookatni` publicado no npm prefere o binário Go quando encontrado para o seu sistema (`dist/lookatni-file-markers_<os>_<arch>`). Se não estiver disponível, ele faz fallback automático para o CLI em TypeScript.

Forçar escolha:
```bash
LOOKATNI_CLI_IMPL=go lookatni generate ./src out.txt   # força Go
LOOKATNI_CLI_IMPL=ts  lookatni generate ./src out.txt   # força TS
```

## Paridade (Golden Tests)

Mantemos paridade entre TS e Go com testes de ouro. No repositório:

```bash
node tools/golden/run-golden.js
# Gera com TS e (se disponível) com Go, e compara estatísticas via lookatni-core
```

O objetivo é garantir que, dada a mesma entrada, ambos produzam saídas equivalentes.
