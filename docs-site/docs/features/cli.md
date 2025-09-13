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
