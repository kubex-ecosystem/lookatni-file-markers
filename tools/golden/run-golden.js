#!/usr/bin/env node

// Golden test skeleton: compare TS CLI vs Go CLI generation parity.

const { spawnSync } = require('child_process');
const { resolve, join } = require('path');
const { existsSync, mkdirSync, rmSync, readFileSync } = require('fs');

function findCore() {
  // Try local built core first
  const local = resolve(__dirname, '..', '..', 'core', 'dist', 'lib', 'index.js');
  if (existsSync(local)) return require(local);
  try { return require('lookatni-core'); } catch { return null; }
}

function platformTriple() {
  const os = process.platform;
  const arch = process.arch;
  let osPart = os === 'linux' ? 'linux' : os === 'darwin' ? 'darwin' : os === 'win32' ? 'windows' : os;
  let archPart = arch === 'x64' ? 'amd64' : arch === 'arm64' ? 'arm64' : arch;
  return { osPart, archPart };
}

function findGoCLI() {
  const { osPart, archPart } = platformTriple();
  const exe = osPart === 'windows' ? '.exe' : '';
  const candidates = [
    // extension/dist
    resolve(__dirname, '..', '..', 'extension', 'dist', `lookatni-file-markers_${osPart}_${archPart}${exe}`),
    resolve(__dirname, '..', '..', 'extension', 'dist', `lookatniCli_${osPart}_${archPart}${exe}`),
    // root dist
    resolve(__dirname, '..', '..', 'dist', `lookatni-file-markers_${osPart}_${archPart}${exe}`),
    resolve(__dirname, '..', '..', 'dist', `lookatniCli_${osPart}_${archPart}${exe}`)
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  const inCliBin = resolve(__dirname, '..', '..', 'cli', 'bin', `lookatni${exe}`);
  if (existsSync(inCliBin)) return inCliBin;
  return null;
}

function run(cmd, args, cwd) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', cwd });
  if (res.error) throw res.error;
  if (typeof res.status === 'number' && res.status !== 0) throw new Error(`${cmd} exited ${res.status}`);
}

async function main() {
  const core = findCore();
  if (!core) {
    console.error('lookatni-core not found. Build core first (cd core && npm run build).');
    process.exit(1);
  }

  const source = resolve(__dirname, '..', '..', 'core', 'src', 'lib');
  const outDir = resolve(__dirname, 'out');
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const tsCli = resolve(__dirname, '..', '..', 'extension', 'dist', 'scripts', 'cli.js');
  const goCli = findGoCLI();

  // TS generate
  const outTs = join(outDir, 'markers-ts.txt');
  run('node', [tsCli, 'generate', source, outTs], process.cwd());

  // GO generate (optional)
  let outGo = null;
  if (goCli) {
    outGo = join(outDir, 'markers-go.txt');
    run(goCli, ['generate', source, outGo], process.cwd());
  }

  // Parse & compare
  const pTs = core.parseMarkers(readFileSync(outTs, 'utf-8'));
  let summary = {
    ts: { files: pTs.totalFiles, bytes: pTs.totalBytes }
  };
  if (outGo) {
    const pGo = core.parseMarkers(readFileSync(outGo, 'utf-8'));
    summary.go = { files: pGo.totalFiles, bytes: pGo.totalBytes };
    summary.equal = (pTs.totalFiles === pGo.totalFiles) && (pTs.totalBytes === pGo.totalBytes);
  } else {
    summary.go = { skipped: true };
    summary.equal = null;
  }

  console.log('\n[GOLDEN] Generation parity');
  console.table(summary);
}

main().catch((e) => { console.error(e); process.exit(1); });
