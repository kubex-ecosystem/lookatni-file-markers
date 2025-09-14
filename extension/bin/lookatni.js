#!/usr/bin/env node

/**
 * LookAtni CLI - Global executable (dispatcher)
 * Prefers native Go binary when present/compatible; falls back to TS CLI.
 */

const { resolve, join } = require('path');
const { existsSync } = require('fs');
const { spawn, fork } = require('child_process');

function platformTriple() {
  const os = process.platform;
  const arch = process.arch;
  let osPart = '';
  if (os === 'linux') osPart = 'linux';
  else if (os === 'darwin') osPart = 'darwin';
  else if (os === 'win32') osPart = 'windows';
  else osPart = os;

  let archPart = '';
  if (arch === 'x64') archPart = 'amd64';
  else if (arch === 'arm64') archPart = 'arm64';
  else archPart = arch;

  return { osPart, archPart };
}

function tryRunGo() {
  const { osPart, archPart } = platformTriple();
  const base = resolve(__dirname, '..', 'dist');
  const exe = osPart === 'windows' ? '.exe' : '';
  const names = [
    // primary (npm dist convention)
    `lookatni-file-markers_${osPart}_${archPart}${exe}`,
    // alt name from Go build (bin name from manifest)
    `lookatniCli_${osPart}_${archPart}${exe}`
  ];
  let candidate = null;
  for (const n of names) {
    const p = join(base, n);
    if (existsSync(p)) { candidate = p; break; }
  }
  // Dev fallback 1: repo-root dist/ (novo padrão Go)
  let rootDist = null;
  if (!candidate) {
    for (const n of names) {
      const p = resolve(__dirname, '..', '..', 'dist', n);
      if (existsSync(p)) { rootDist = p; break; }
    }
  }
  // Dev fallback 2: bin local do CLI
  const devCandidate = resolve(__dirname, '..', '..', 'cli', 'bin', `lookatni${exe}`);
  const pathToRun = candidate
    ? candidate
    : (rootDist
        ? rootDist
        : (existsSync(devCandidate) ? devCandidate : null));
  if (!pathToRun) return false;

  const child = spawn(pathToRun, process.argv.slice(2), { stdio: 'inherit' });
  child.on('exit', (code) => process.exit(code || 0));
  child.on('error', (err) => {
    console.error('⚠️ Failed to run Go CLI, falling back to TS:', err.message);
    runTS();
  });
  return true;
}

function runTS() {
  const distCli = resolve(__dirname, '..', 'dist', 'scripts', 'cli.js');
  if (!existsSync(distCli)) {
    console.error('❌ LookAtni TS CLI not found. Please run `npm run build` first.');
    console.error('Looking for:', distCli);
    process.exit(1);
  }
  const child = fork(distCli, process.argv.slice(2), { stdio: 'inherit' });
  child.on('exit', (code) => process.exit(code || 0));
  child.on('error', (error) => {
    console.error('❌ Error executing LookAtni TS CLI:', error.message);
    process.exit(1);
  });
}

function main() {
  const force = process.env.LOOKATNI_CLI_IMPL; // 'go' | 'ts'
  if (force === 'go') {
    if (!tryRunGo()) runTS();
    return;
  }
  if (force === 'ts') {
    runTS();
    return;
  }
  // Default: prefer Go when present
  if (!tryRunGo()) runTS();
}

main();
