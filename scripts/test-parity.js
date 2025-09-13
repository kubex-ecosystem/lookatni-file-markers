#!/usr/bin/env node
// Quick cross-language parity smoke test using core validator over canonical fixtures
const path = require('path');

function requireCore() {
  try { return require('../core/dist/lib/index.js'); } catch { return null; }
}

(async () => {
  const core = requireCore();
  if (!core) {
    console.error('Core not built. Run: cd core && npm run build');
    process.exit(2);
  }

  const validator = core.createValidator ? core.createValidator({ strictMode: true }) : new core.MarkerValidator({ strictMode: true });
  const cases = [
    { file: 'spec/fixtures/valid/simple-two-files.lkt', expectValid: true },
    { file: 'spec/fixtures/valid/html-frontmatter.lkt', expectValid: true },
    { file: 'spec/fixtures/valid/markdown-frontmatter.lkt', expectValid: true },
    { file: 'spec/fixtures/valid/code-frontmatter.lkt', expectValid: true },
    { file: 'spec/fixtures/invalid/empty-filename.lkt', expectValid: false },
    { file: 'spec/fixtures/edge/duplicate-filenames.lkt', expectValid: true }, // duplicates are warnings
  ];

  let failed = 0;
  for (const c of cases) {
    const fp = path.join(__dirname, '..', c.file);
    const res = await validator.validateFile(fp);
    const ok = !!res && (res.isValid === c.expectValid);
    console.log(`${ok ? '✅' : '❌'} ${c.file} => isValid=${res && res.isValid}`);
    if (!ok) failed++;
  }

  process.exit(failed ? 1 : 0);
})();
