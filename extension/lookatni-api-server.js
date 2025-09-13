#!/usr/bin/env node

/**
 * LookAtni HTTP API Server
 * Serve scripts via HTTP API para execução direta
 *
 * Exemplo de uso:
 * curl -s http://localhost:3000/api/scripts/go_version.sh | bash
 * curl -s -d '{"script":"build.sh","args":["--target","prod"]}' http://localhost:3000/api/execute
 */

const http = require('http');
const fs = require('fs');
const url = require('url');

const PORT = process.env.PORT || 3000;
const LOOKATNI_FILE = process.env.LOOKATNI_FILE || './kubex-build-scripts.lookatni';

// ASCII 28 (File Separator) - marcador invisível
const FS = String.fromCharCode(28);
const MARKER_START = `//${FS}/`;
const MARKER_END = `/${FS}//`;

class LookAtniAPIServer {
    constructor() {
        this.scripts = new Map();
        this.loadScripts();
    }

    loadScripts() {
        try {
            console.log(`📚 Carregando scripts de: ${LOOKATNI_FILE}`);
            const data = fs.readFileSync(LOOKATNI_FILE, 'utf-8');
            const lines = data.split('\n');

            let currentFile = null;
            let currentContent = [];

            for (const line of lines) {
                if (line.startsWith(MARKER_START) && line.endsWith(MARKER_END)) {
                    // Salvar arquivo anterior se existir
                    if (currentFile) {
                        this.scripts.set(currentFile, currentContent.join('\n'));
                        console.log(`  ✅ ${currentFile} (${currentContent.length} linhas)`);
                    }

                    // Iniciar novo arquivo
                    const filename = line.slice(MARKER_START.length, -MARKER_END.length).trim();
                    currentFile = filename;
                    currentContent = [];
                } else if (currentFile) {
                    currentContent.push(line);
                }
            }

            // Salvar último arquivo
            if (currentFile) {
                this.scripts.set(currentFile, currentContent.join('\n'));
                console.log(`  ✅ ${currentFile} (${currentContent.length} linhas)`);
            }

            console.log(`🎉 Carregados ${this.scripts.size} scripts!`);
        } catch (error) {
            console.error(`❌ Erro carregando ${LOOKATNI_FILE}:`, error.message);
            process.exit(1);
        }
    }

    handleRequest(req, res) {
        const parsedUrl = url.parse(req.url, true);
        const path = parsedUrl.pathname;

        // CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        // GET /api/scripts/<script_name>
        if (req.method === 'GET' && path.startsWith('/api/scripts/')) {
            const scriptName = path.slice('/api/scripts/'.length);
            this.serveScript(scriptName, res);
            return;
        }

        // GET /api/list
        if (req.method === 'GET' && path === '/api/list') {
            this.listScripts(res);
            return;
        }

        // POST /api/execute
        if (req.method === 'POST' && path === '/api/execute') {
            this.handleExecute(req, res);
            return;
        }

        // Default: API documentation
        if (path === '/' || path === '/api') {
            this.serveDocumentation(res);
            return;
        }

        // 404
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
    }

    serveScript(scriptName, res) {
        if (!this.scripts.has(scriptName)) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                error: `Script '${scriptName}' not found`,
                available: Array.from(this.scripts.keys())
            }));
            return;
        }

        const script = this.scripts.get(scriptName);
        res.writeHead(200, {
            'Content-Type': 'text/plain',
            'X-Script-Name': scriptName,
            'X-Script-Size': Buffer.byteLength(script, 'utf-8').toString()
        });
        res.end(script);

        console.log(`📤 Servido: ${scriptName} (${Buffer.byteLength(script, 'utf-8')} bytes)`);
    }

    listScripts(res) {
        const scripts = Array.from(this.scripts.keys()).map(name => ({
            name,
            size: Buffer.byteLength(this.scripts.get(name), 'utf-8'),
            lines: this.scripts.get(name).split('\n').length
        }));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ scripts, total: scripts.length }));
    }

    handleExecute(req, res) {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { script, args = [] } = JSON.parse(body);

                if (!this.scripts.has(script)) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        error: `Script '${script}' not found`,
                        available: Array.from(this.scripts.keys())
                    }));
                    return;
                }

                const scriptContent = this.scripts.get(script);
                const argsStr = args.length > 0 ? ` ${args.join(' ')}` : '';
                const wrapper = `#!/bin/bash\n# Args: ${argsStr}\n${scriptContent}`;

                res.writeHead(200, {
                    'Content-Type': 'text/plain',
                    'X-Script-Name': script,
                    'X-Script-Args': argsStr.trim()
                });
                res.end(wrapper);

                console.log(`🚀 Executando: ${script}${argsStr}`);
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON body' }));
            }
        });
    }

    serveDocumentation(res) {
        const docs = `
🚀 LookAtni HTTP API Server

📋 Endpoints:
  GET  /api/list                     - Listar scripts disponíveis
  GET  /api/scripts/<script_name>    - Obter script específico
  POST /api/execute                  - Executar script com argumentos

🎯 Exemplos de uso:

# Execução direta:
curl -s http://localhost:${PORT}/api/scripts/go_version.sh | bash

# Com argumentos via POST:
curl -s -X POST -H "Content-Type: application/json" \\
  -d '{"script":"go_version.sh","args":["--help"]}' \\
  http://localhost:${PORT}/api/execute | bash

# Listar scripts:
curl -s http://localhost:${PORT}/api/list | jq

# One-liner completo:
bash <(curl -s http://localhost:${PORT}/api/scripts/build.sh) --target production

🔥 ZERO FILESYSTEM TOUCH - Tudo na memória!

Scripts disponíveis: ${this.scripts.size}
`;

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(docs);
    }

    start() {
        const server = http.createServer((req, res) => this.handleRequest(req, res));

        server.listen(PORT, () => {
            console.log(`🚀 LookAtni API Server rodando em http://localhost:${PORT}`);
            console.log(`📚 Carregado arquivo: ${LOOKATNI_FILE}`);
            console.log(`🎯 Scripts disponíveis: ${this.scripts.size}`);
            console.log('');
            console.log('Exemplos de uso:');
            console.log(`  curl -s http://localhost:${PORT}/api/list`);
            console.log(`  curl -s http://localhost:${PORT}/api/scripts/go_version.sh | bash`);
            console.log('');
        });
    }
}

// Verificar se arquivo existe
if (!fs.existsSync(LOOKATNI_FILE)) {
    console.error(`❌ Arquivo ${LOOKATNI_FILE} não encontrado!`);
    console.error('💡 Use: LOOKATNI_FILE=./seu-arquivo.lookatni node api-server.js');
    process.exit(1);
}

// Iniciar servidor
const server = new LookAtniAPIServer();
server.start();
