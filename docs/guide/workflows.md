# Workflows

## AI Code Extraction

1. Copy a single-file answer with markers from your AI chat
2. Save as `answer.lkt`
3. Extract: `lookatni extract answer.lkt ./project`

## Sharing a Project Slice

```bash
lookatni generate ./src src-slice.lkt
git add src-slice.lkt
```

## CI Step

```bash
cat deploy.lkt | node tools/lookatni-pipe-extract.js deploy.sh | bash
```

Keep it visible, reproducible, and lock-in free.

