# Example: React Sharing

Package a React app without `node_modules`.

```bash
lookatni generate ./my-react-app react.lkt
lookatni extract react.lkt ./restored
cd restored && npm install && npm start
```

Tip: exclude `build/` if present for smaller bundles.

