LookAtni Tools

Auxiliary utilities for piping and HTTP serving of LookAtni marker bundles.

- `tools/lookatni-pipe-extract.js`: Extracts a single file to STDOUT from a LookAtni bundle via stdin.
  - Usage: `cat bundle.lkt | node tools/lookatni-pipe-extract.js path/in/bundle.ext | bash`

- `tools/pipe-extract.js`: Extracts all files from stdin LookAtni bundle to a directory.
  - Usage: `cat bundle.lkt | node tools/pipe-extract.js ./output-dir`

- `tools/lookatni-api-server.js`: Serves scripts embedded in a LookAtni bundle over HTTP.
  - Env: `LOOKATNI_FILE=./scripts.lookatni PORT=3000`
  - Usage: `node tools/lookatni-api-server.js`

These tools are optional, transport-friendly helpers and not part of the VS Code extension package.

