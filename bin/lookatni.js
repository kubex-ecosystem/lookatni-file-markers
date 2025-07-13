#!/usr/bin/env node

/**
 * LookAtni CLI - Global executable
 * This is the main entry point when installing as a global npm package
 */

const { resolve, join } = require('path');
const { existsSync } = require('fs');

// Determine if we're running from compiled dist or source
const isDist = __dirname.includes('dist') || __dirname.includes('out');
const srcPath = isDist 
  ? resolve(__dirname, '..', 'dist', 'scripts', 'cli.js')
  : resolve(__dirname, '..', 'src', 'scripts', 'cli.ts');

// Check if we have tsx available for TypeScript execution
const hasTsx = (() => {
  try {
    require.resolve('tsx');
    return true;
  } catch {
    return false;
  }
})();

// Execute the CLI
if (isDist || !hasTsx) {
  // Use compiled JavaScript version
  const distCli = resolve(__dirname, '..', 'dist', 'scripts', 'cli.js');
  if (existsSync(distCli)) {
    require(distCli);
  } else {
    console.error('❌ LookAtni CLI not found. Please run `npm run build` first.');
    process.exit(1);
  }
} else {
  // Use TypeScript version with tsx
  const { spawn } = require('child_process');
  const tsFile = resolve(__dirname, '..', 'src', 'scripts', 'cli.ts');
  
  if (!existsSync(tsFile)) {
    console.error('❌ LookAtni CLI source not found.');
    process.exit(1);
  }

  const child = spawn('npx', ['tsx', tsFile, ...process.argv.slice(2)], {
    stdio: 'inherit',
    shell: true
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}
