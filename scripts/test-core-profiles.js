#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function requireCore() {
  try { return require('../core/dist/lib/index.js'); } catch { return null; }
}

function mkTmpDir() {
  const d = fs.mkdtempSync(path.join(fs.realpathSync.native ? fs.realpathSync.native('/tmp') : '/tmp', 'lkt-'));
  return d;
}

(async () => {
  const core = requireCore();
  if (!core) { console.error('Core not built'); process.exit(2); }
  const gen = core.createGenerator ? core.createGenerator() : new core.MarkerGenerator();
  const extractor = core.createExtractor ? core.createExtractor() : new core.MarkerExtractor();

  // Case 1: HTML pattern with frontmatter
  const dir1 = mkTmpDir();
  fs.mkdirSync(path.join(dir1, 'src'), { recursive: true });
  fs.writeFileSync(path.join(dir1, 'README.md'), '# A\n');
  fs.writeFileSync(path.join(dir1, 'src', 'a.js'), 'console.log("a")\n');
  const content1 = await gen.generate(dir1, { markerPreset: 'html', includeFrontmatter: true });
  const files1 = await extractor.getFileList(content1);
  if (files1.length !== 2) { console.error('profile(html) expected 2 files, got', files1.length); process.exit(1); }

  // Case 2: Start/End tokens (code style)
  const dir2 = mkTmpDir();
  fs.mkdirSync(path.join(dir2, 'pkg'), { recursive: true });
  fs.writeFileSync(path.join(dir2, 'pkg', 'b.go'), 'package main\n');
  fs.writeFileSync(path.join(dir2, 'LICENSE'), 'MIT\n');
  const content2 = await gen.generate(dir2, { markerStart: '// === FILE:', markerEnd: '===', includeFrontmatter: true });
  const files2 = await extractor.getFileList(content2);
  if (files2.length !== 2) { console.error('profile(code) expected 2 files, got', files2.length); process.exit(1); }

  console.log('OK');
  process.exit(0);
})();

