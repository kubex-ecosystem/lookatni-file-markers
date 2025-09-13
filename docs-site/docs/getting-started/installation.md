# Installation

Choose the path that fits your workflow.

## CLI (local build)

```bash
cd core && npm run build
cd ../cli && make build
# binaries in cli/bin/
```

## VS Code Extension (dev)

Open `extension/` in VS Code and run the extension. Ensure Core is built so the extension can import it.

## Python Docs (this site)

```bash
cd docs-site
uv sync
uv run mkdocs serve
```

