#!/usr/bin/env node

/**
 * Script simples para testar extração via pipe
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
    const outputDir = process.argv[2] || './extracted-from-pipe';

    console.log('🚀 LookAtni Pipe Extractor');
    console.log('==========================');
    console.log(`📁 Destino: ${outputDir}`);

    // Criar diretório se não existir
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // ASCII 28 (File Separator) - marcador invisível
    const FS = String.fromCharCode(28);
    const MARKER_START = `//${FS}/`;
    const MARKER_END = `/${FS}//`;

    // Extrair marcadores
    const lines = data.split('\n');
    let currentFile = null;
    let currentContent = [];
    let filesExtracted = 0;

    for (const line of lines) {
        if (line.startsWith(MARKER_START) && line.endsWith(MARKER_END)) {
            // Novo marcador encontrado
            if (currentFile) {
                // Salvar arquivo anterior
                const filePath = path.join(outputDir, currentFile);
                const fileDir = path.dirname(filePath);

                if (!fs.existsSync(fileDir)) {
                    fs.mkdirSync(fileDir, { recursive: true });
                }

                fs.writeFileSync(filePath, currentContent.join('\n'));
                console.log(`✅ ${currentFile} (${currentContent.length} linhas)`);
                filesExtracted++;
            }

            // Iniciar novo arquivo - extrair nome do marcador
            const filename = line.slice(MARKER_START.length, -MARKER_END.length).trim();
            currentFile = filename;
            currentContent = [];
        } else if (currentFile) {
            // Adicionar linha ao arquivo atual
            currentContent.push(line);
        }
    }

    // Salvar último arquivo
    if (currentFile) {
        const filePath = path.join(outputDir, currentFile);
        const fileDir = path.dirname(filePath);

        if (!fs.existsSync(fileDir)) {
            fs.mkdirSync(fileDir, { recursive: true });
        }

        fs.writeFileSync(filePath, currentContent.join('\n'));
        console.log(`✅ ${currentFile} (${currentContent.length} linhas)`);
        filesExtracted++;
    }

    console.log('==========================');
    console.log(`🎉 Extraídos ${filesExtracted} arquivos para ${outputDir}`);
});if (process.stdin.isTTY) {
    console.log('❌ Este script precisa de dados via pipe');
    console.log('Uso: cat arquivo.lookatni | node pipe-extract.js [destino]');
    process.exit(1);
}
