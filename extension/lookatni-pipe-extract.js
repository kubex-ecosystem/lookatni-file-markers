#!/usr/bin/env node

/**
 * LookAtni Pipe-to-STDOUT Extractor
 * Extrai arquivo específico de um LookAtni e envia para STDOUT
 * Uso: cat arquivo.lookatni | lookatni-pipe-extract.js script.sh | bash
 */

const fs = require('fs');
const path = require('path');

// Ler dados do stdin
let data = '';
process.stdin.setEncoding('utf8');

process.stdin.on('readable', () => {
    let chunk;
    while (null !== (chunk = process.stdin.read())) {
        data += chunk;
    }
});

process.stdin.on('end', () => {
    const targetFile = process.argv[2];

    if (!targetFile) {
        console.error('❌ Uso: cat arquivo.lookatni | node lookatni-pipe-extract.js <arquivo_alvo>');
        console.error('Exemplo: cat scripts.lkt | node lookatni-pipe-extract.js build.sh | bash');
        process.exit(1);
    }

    // ASCII 28 (File Separator) - marcador invisível
    const FS = String.fromCharCode(28);
    const MARKER_START = `//${FS}/`;
    const MARKER_END = `/${FS}//`;

    // Extrair arquivo específico
    const lines = data.split('\n');
    let currentFile = null;
    let currentContent = [];
    let found = false;

    for (const line of lines) {
        if (line.startsWith(MARKER_START) && line.endsWith(MARKER_END)) {
            // Se estávamos processando o arquivo alvo, terminamos
            if (currentFile === targetFile) {
                found = true;
                break;
            }

            // Novo marcador encontrado
            const filename = line.slice(MARKER_START.length, -MARKER_END.length).trim();
            currentFile = filename;
            currentContent = [];
        } else if (currentFile === targetFile) {
            // Adicionar linha ao arquivo alvo
            currentContent.push(line);
        }
    }

    // Verificar se encontrou o arquivo
    if (!found && currentFile !== targetFile) {
        console.error(`❌ Arquivo '${targetFile}' não encontrado no LookAtni`);
        console.error('📁 Arquivos disponíveis:');

        // Listar arquivos disponíveis
        const availableFiles = [];
        const fileLines = data.split('\n');
        for (const line of fileLines) {
            if (line.startsWith(MARKER_START) && line.endsWith(MARKER_END)) {
                const filename = line.slice(MARKER_START.length, -MARKER_END.length).trim();
                availableFiles.push(filename);
            }
        }

        availableFiles.forEach(file => console.error(`   - ${file}`));
        process.exit(1);
    }

    // Se chegamos aqui mas currentFile === targetFile, é o último arquivo
    if (currentFile === targetFile) {
        found = true;
    }

    if (found) {
        // Enviar conteúdo para STDOUT (sem \n extra no final)
        const content = currentContent.join('\n');
        process.stdout.write(content);
    } else {
        console.error(`❌ Arquivo '${targetFile}' não encontrado`);
        process.exit(1);
    }
});

if (process.stdin.isTTY) {
    console.error('❌ Este script precisa de dados via pipe');
    console.error('Uso: cat arquivo.lookatni | node lookatni-pipe-extract.js <arquivo>');
    console.error('');
    console.error('Exemplos:');
    console.error('  cat scripts.lkt | node lookatni-pipe-extract.js build.sh | bash');
    console.error('  curl -s https://kubex.dev/scripts.lkt | node lookatni-pipe-extract.js go_version.sh | bash -s -- --version');
    console.error('  cat scripts.lkt | node lookatni-pipe-extract.js config.sh | source /dev/stdin');
    process.exit(1);
}
