#!/usr/bin/env node

/**
 * 🚀 LookAtni CLI Wrapper - NPM Global
 * Este wrapper usa o CLI Go como engine
 * Seguindo filosofia Kubex: "Um comando = um resultado"
 */

const { spawn } = require('child_process');
const { resolve, join } = require('path');
const { existsSync } = require('fs');
const os = require('os');

function getBinaryPath() {
  const platform = os.platform();
  const arch = os.arch();

  // Mapear para nomes dos binários
  let binaryName = 'lookatni';

  if (platform === 'linux') {
    binaryName = 'lookatni-linux-amd64';
  } else if (platform === 'darwin') {
    binaryName = 'lookatni-darwin-amd64';
  } else if (platform === 'win32') {
    binaryName = 'lookatni-windows-amd64.exe';
  }

  const binaryPath = resolve(__dirname, '..', 'binaries', binaryName);

  if (!existsSync(binaryPath)) {
    console.error(`❌ Binário não encontrado: ${binaryPath}`);
    console.error(`Platform: ${platform}, Arch: ${arch}`);
    console.error('📞 Reporte este problema: https://github.com/kubex-ecosystem/lookatni-file-markers/issues');
    process.exit(1);
  }

  return binaryPath;
}

function executeLookAtni() {
  const binaryPath = getBinaryPath();
  const args = process.argv.slice(2);

  // Spawnar o processo Go CLI
  const child = spawn(binaryPath, args, {
    stdio: 'inherit',
    env: process.env
  });

  // Tratar sinais
  process.on('SIGINT', () => {
    child.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    child.kill('SIGTERM');
  });

  // Aguardar conclusão
  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
    } else {
      process.exit(code || 0);
    }
  });

  child.on('error', (error) => {
    console.error('❌ Erro ao executar LookAtni CLI:', error.message);
    process.exit(1);
  });
}

// Executar!
executeLookAtni();
