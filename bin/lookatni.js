#!/usr/bin/env node

/**
 * LookAtni CLI - Global executable
 * This is the main entry point when installing as a global npm package
 */

const { resolve } = require('path');
const { existsSync } = require('fs');
const { spawn, fork } = require('child_process');

// Function to execute the CLI
function executeCLI() {
  // Use compiled JavaScript version
  const distCli = resolve(__dirname, '..', 'dist', 'scripts', 'cli.js');
  
  if (existsSync(distCli)) {
    // Fork the CLI script as a child process
    const child = fork(distCli, process.argv.slice(2), {
      stdio: 'inherit'
    });
    
    child.on('exit', (code) => {
      process.exit(code || 0);
    });
    
    child.on('error', (error) => {
      console.error('❌ Error executing LookAtni CLI:', error.message);
      process.exit(1);
    });
  } else {
    console.error('❌ LookAtni CLI not found. Please run `npm run build` first.');
    console.error('Looking for:', distCli);
    process.exit(1);
  }
}

// Execute the CLI
executeCLI();
