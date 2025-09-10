# Just transient text to interact with AI

NÃO É ISSO NÃO!!! hehehe

```bash
# 3. Qualquer projeto usa:
curl https://kubex.dev/static/kubex-build-scripts.lkt | \
  lookatni extract support/build.sh - | bash

# 4. Pipe DIRETO sem filesystem!
curl https://kubex.dev/static/kubex-build-scripts.lkt | \
  lookatni extract support/go_version.sh - | \
  bash -s -- --version 1.25.1
```

É algo que não demandaria "trazer" o artefato inteiro sempre, mas só o arquivo de dentro dele diretamente..

```bash
bash $(curl -s -H "Content-Type: application/json" -d '{ "ARGS_AQUI" : "TARGETS_AQUI" }' \
 -X  POST https://kubex.dev/static/kubex-build-scripts.lkt) -s "${QUALQUER_PARÂMETRO_DIRETO_PRA_SAÍDA}"
```

É possível??? Pode ser com uma ajuda do BE, sem problemas.. rsrs
