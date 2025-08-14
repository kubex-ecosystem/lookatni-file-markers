# gox_mod.sh — Build Go modular, robust e publicável

Agora com empacotamento automático por sistema, layout configurável e paralelismo controlado.

## Novidades

* `--pack[=auto|zip|tar]` → cria `.zip` no Windows e `.tar.gz` no restante (auto), ou força um formato.
* `--layout flat|pkg` e `--name TEMPLATE` → controle de diretório/nomes. Placeholders: `{mod}`, `{pkg}`, `{os}`, `{arch}`, `{ext}`.
* `--jobs N` → paraleliza builds de combinações OS/ARCH e múltiplos `main` (usa `xargs -P` quando disponível). O compilador do Go já paraleliza por pacote; aqui paralelizamos a matriz externa.

## Exemplos

```bash
# Layout por pacote e empacotamento automático
./gox_mod.sh --all --layout pkg --pack

# Nome custom + 4 jobs
./gox_mod.sh --os linux,darwin --arch amd64,arm64 \
  --layout flat --name '{mod}-{pkg}-{os}-{arch}{ext}' --jobs 4

# Injetando versão/commit/data (seu código tiver variáveis)
BUILDINFO_PATH=main ./gox_mod.sh --all --pack
```

## Dependências de empacotamento

* `tar` para `.tar.gz` (padrão em macOS/Linux/BSD)
* `zip` para `.zip` (opcional). Se ausentes, o build segue sem empacotar e loga aviso.

---

Próximos passos (opcional): manifest JSON + checksums, assinatura (minisign/age) e workflow YAML de release com matrix.

