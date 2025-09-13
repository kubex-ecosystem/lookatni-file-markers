# Quick Start

End-to-end in under 60 seconds.

```bash
# 1) Build Core (once)
cd core && npm run build && cd ..

# 2) Use CLI (if built)
cli/bin/lookatni generate ./examples my-example.lkt.txt
cli/bin/lookatni extract my-example.lkt.txt ./restored
```

VS Code:
1. Open Command Palette → LookAtni: Generate Markers
2. Pick your folder and output file
3. Extract with LookAtni: Extract Files

Validate with the Core:
```bash
node scripts/test-parity.js
```
