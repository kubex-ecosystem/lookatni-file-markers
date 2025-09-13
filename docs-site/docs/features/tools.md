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
