# Tools

Optional utilities for pipes and HTTP delivery.

## Pipe to STDOUT

```bash
cat scripts.lkt.txt | node tools/lookatni-pipe-extract.js build.sh | bash
```

## Extract to Directory

```bash
cat project.lkt.txt | node tools/pipe-extract.js ./out
```

## HTTP API Server

```bash
LOOKATNI_FILE=./scripts.lkt.txt node tools/lookatni-api-server.js
curl -s http://localhost:3000/api/list | jq
```

Great for demos, CI and reproducible one-liners.

## Node Reexports

Se você já depende do pacote da extensão/CLI e quer apenas alguns helpers da API, pode importar por:

```ts
import { parseMarkers } from 'lookatni-file-markers/lib';
```

Para uso dedicado em Node (projetos TS/JS), prefira instalar a lib:

```bash
npm install lookatni-core
```
