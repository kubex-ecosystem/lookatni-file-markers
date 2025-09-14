#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LookAtniTester = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const extractFiles_1 = require("./extractFiles");
const generateMarkers_1 = require("./generateMarkers");
const FS_CHAR = String.fromCharCode(28);
const MARKER_START = `//${FS_CHAR}/`;
const MARKER_END = `/${FS_CHAR}//`;
const colors = {
    RED: '\x1b[0;31m',
    GREEN: '\x1b[0;32m',
    YELLOW: '\x1b[1;33m',
    BLUE: '\x1b[0;34m',
    CYAN: '\x1b[0;36m',
    NC: '\x1b[0m'
};
class LookAtniTester {
    constructor() {
        this.testDir = './test-lookatni';
        this.testCode = 'test-code.txt';
        this.testExtract = './test-extracted';
    }
    async runTests() {
        console.log(`${colors.CYAN}🧪 LookAtni Test Suite v3.0${colors.NC}`);
        console.log("===============================");
        console.log("");
        try {
            await this.cleanup();
            await this.createTestStructure();
            await this.testGeneration();
            await this.testExtraction();
            await this.validateResults();
            await this.printSummary();
        }
        catch (error) {
            console.error(`${colors.RED}❌ Teste falhou: ${error}${colors.NC}`);
            process.exit(1);
        }
        finally {
            await this.cleanup();
        }
    }
    async cleanup() {
        console.log(`${colors.YELLOW}🧹 Limpando ambiente de teste...${colors.NC}`);
        const pathsToClean = [this.testDir, this.testCode, this.testExtract];
        for (const pathToClean of pathsToClean) {
            if (fs.existsSync(pathToClean)) {
                fs.rmSync(pathToClean, { recursive: true, force: true });
            }
        }
    }
    async createTestStructure() {
        console.log(`${colors.YELLOW}🏗️  Criando estrutura de teste...${colors.NC}`);
        fs.mkdirSync(path.join(this.testDir, 'src', 'components'), { recursive: true });
        fs.mkdirSync(path.join(this.testDir, 'src', 'utils'), { recursive: true });
        fs.mkdirSync(path.join(this.testDir, 'public'), { recursive: true });
        const appJsx = `import React from 'react';
import Header from './components/Header';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header title="LookAtni Test" />
      <main>
        <h1>Sistema de Marcadores Únicos</h1>
        <p>Este é um teste do sistema LookAtni!</p>
      </main>
    </div>
  );
}

export default App;`;
        fs.writeFileSync(path.join(this.testDir, 'src', 'App.jsx'), appJsx);
        const headerJsx = `import React from 'react';

function Header({ title }) {
  return (
    <header style={{ padding: '1rem', backgroundColor: '#f0f0f0' }}>
      <h1>{title}</h1>
      <nav>
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
  );
}

export default Header;`;
        fs.writeFileSync(path.join(this.testDir, 'src', 'components', 'Header.jsx'), headerJsx);
        const utilsJs = `export function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export function calculateSum(numbers) {
  return numbers.reduce((sum, num) => sum + num, 0);
}

export function validateEmail(email) {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
}`;
        fs.writeFileSync(path.join(this.testDir, 'src', 'utils', 'helpers.js'), utilsJs);
        const appCss = `body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  color: #333;
  text-align: center;
}

p {
  line-height: 1.6;
  color: #666;
}`;
        fs.writeFileSync(path.join(this.testDir, 'src', 'App.css'), appCss);
        const packageJson = {
            "name": "lookatni-test-project",
            "version": "1.0.0",
            "description": "Projeto de teste para LookAtni",
            "main": "src/App.jsx",
            "scripts": {
                "dev": "vite",
                "build": "vite build",
                "preview": "vite preview"
            },
            "dependencies": {
                "react": "^18.2.0",
                "react-dom": "^18.2.0"
            },
            "devDependencies": {
                "vite": "^4.4.0",
                "@vitejs/plugin-react": "^4.0.0"
            }
        };
        fs.writeFileSync(path.join(this.testDir, 'package.json'), JSON.stringify(packageJson, null, 2));
        const readme = `# LookAtni Test Project

Este é um projeto de teste para demonstrar o sistema LookAtni.

## Estrutura do Projeto

- \`src/App.jsx\` - Componente principal da aplicação
- \`src/components/Header.jsx\` - Componente de cabeçalho
- \`src/utils/helpers.js\` - Funções utilitárias
- \`src/App.css\` - Estilos da aplicação

## Como usar

1. Execute \`npm install\` para instalar as dependências
2. Execute \`npm run dev\` para iniciar o servidor de desenvolvimento
3. Abra o navegador em \`http://localhost:5173\`

## Sistema LookAtni

Este projeto foi criado para testar o sistema de marcadores únicos LookAtni.
Você pode gerar marcadores e extrair novamente os arquivos usando:

\`\`\`bash
# Gerar marcadores
tsx generateMarkers.ts ./test-lookatni test-code.txt

# Extrair arquivos
tsx extractFiles.ts test-code.txt ./novo-projeto
\`\`\`

Incrível, não é? 🚀
`;
        fs.writeFileSync(path.join(this.testDir, 'README.md'), readme);
        console.log(`${colors.GREEN}✅ Estrutura de teste criada com sucesso!${colors.NC}`);
        console.log(`${colors.BLUE}📁 Estrutura criada:${colors.NC}`);
        this.printDirectoryStructure(this.testDir, '');
    }
    printDirectoryStructure(dir, prefix) {
        try {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            items.forEach((item, index) => {
                const isLast = index === items.length - 1;
                const symbol = isLast ? '└──' : '├──';
                const nextPrefix = prefix + (isLast ? '    ' : '│   ');
                console.log(`${prefix}${symbol} ${item.name}`);
                if (item.isDirectory()) {
                    this.printDirectoryStructure(path.join(dir, item.name), nextPrefix);
                }
            });
        }
        catch (error) {
            console.log(`${prefix}└── ❌ Erro ao ler diretório`);
        }
    }
    async testGeneration() {
        console.log("");
        console.log(`${colors.YELLOW}🔧 Testando geração de marcadores...${colors.NC}`);
        const generator = new generateMarkers_1.LookAtniGenerator({
            excludePatterns: ['node_modules', '.git'],
            includePatterns: [],
            maxSizeKB: 1000,
            verbose: false,
            compress: false,
            retryAttempts: 0
        });
        await generator.generateMarkers(this.testDir, this.testCode);
        if (!fs.existsSync(this.testCode)) {
            throw new Error("Arquivo de código não foi criado");
        }
        const content = fs.readFileSync(this.testCode, 'utf-8');
        const markers = content.split('\n').filter(line => line.startsWith(MARKER_START));
        console.log(`${colors.GREEN}✅ Geração completada: ${markers.length} marcadores criados${colors.NC}`);
        console.log(`${colors.BLUE}📋 Marcadores encontrados:${colors.NC}`);
        markers.slice(0, 5).forEach((marker, index) => {
            console.log(`  ${index + 1}. ${marker}`);
        });
        if (markers.length > 5) {
            console.log(`  ... e mais ${markers.length - 5} marcador(es)`);
        }
    }
    async testExtraction() {
        console.log("");
        console.log(`${colors.YELLOW}📤 Testando extração de arquivos...${colors.NC}`);
        const extractor = new extractFiles_1.LookAtniExtractor({
            interactive: false,
            verbose: false,
            dryRun: false,
            showStats: false,
            validateFormat: true
        });
        await extractor.extractFiles(this.testCode, this.testExtract);
        if (!fs.existsSync(this.testExtract)) {
            throw new Error("Diretório de extração não foi criado");
        }
        console.log(`${colors.GREEN}✅ Extração completada${colors.NC}`);
    }
    async validateResults() {
        console.log("");
        console.log(`${colors.YELLOW}🔍 Validando resultados...${colors.NC}`);
        const expectedFiles = [
            'src/App.jsx',
            'src/components/Header.jsx',
            'src/utils/helpers.js',
            'src/App.css',
            'package.json',
            'README.md'
        ];
        let validFiles = 0;
        let invalidFiles = 0;
        for (const expectedFile of expectedFiles) {
            const originalPath = path.join(this.testDir, expectedFile);
            const extractedPath = path.join(this.testExtract, expectedFile);
            if (fs.existsSync(extractedPath)) {
                const originalContent = fs.readFileSync(originalPath, 'utf-8');
                const extractedContent = fs.readFileSync(extractedPath, 'utf-8');
                if (originalContent.trim() === extractedContent.trim()) {
                    console.log(`  ${colors.GREEN}✅ ${expectedFile}${colors.NC}`);
                    validFiles++;
                }
                else {
                    console.log(`  ${colors.RED}❌ ${expectedFile} (conteúdo diferente)${colors.NC}`);
                    invalidFiles++;
                }
            }
            else {
                console.log(`  ${colors.RED}❌ ${expectedFile} (não encontrado)${colors.NC}`);
                invalidFiles++;
            }
        }
        if (invalidFiles === 0) {
            console.log(`${colors.GREEN}🎉 Todos os ${validFiles} arquivos foram validados com sucesso!${colors.NC}`);
        }
        else {
            throw new Error(`${invalidFiles} arquivo(s) falharam na validação`);
        }
    }
    async printSummary() {
        console.log("");
        console.log(`${colors.CYAN}📊 Resumo dos Testes${colors.NC}`);
        console.log("================================");
        const codeStats = fs.statSync(this.testCode);
        const codeContent = fs.readFileSync(this.testCode, 'utf-8');
        const markers = codeContent.split('\n').filter(line => line.startsWith(MARKER_START)).length;
        const lines = codeContent.split('\n').length;
        console.log(`${colors.BLUE}📄 Arquivo de código gerado:${colors.NC}`);
        console.log(`  • Arquivo: ${this.testCode}`);
        console.log(`  • Tamanho: ${Math.round(codeStats.size / 1024)}KB`);
        console.log(`  • Linhas: ${lines}`);
        console.log(`  • Marcadores: ${markers}`);
        const extractedFiles = this.getAllFiles(this.testExtract);
        const totalSize = extractedFiles.reduce((sum, file) => {
            return sum + fs.statSync(file).size;
        }, 0);
        console.log(`${colors.BLUE}📁 Arquivos extraídos:${colors.NC}`);
        console.log(`  • Diretório: ${this.testExtract}`);
        console.log(`  • Arquivos: ${extractedFiles.length}`);
        console.log(`  • Tamanho total: ${Math.round(totalSize / 1024)}KB`);
        console.log("");
        console.log(`${colors.GREEN}🎉 Todos os testes passaram com sucesso!${colors.NC}`);
        console.log("");
        console.log(`${colors.CYAN}💡 Para testar manualmente:${colors.NC}`);
        console.log(`  ${colors.YELLOW}# Ver marcadores gerados:${colors.NC}`);
        console.log(`  grep '^${MARKER_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}' ${this.testCode}`);
        console.log(`  ${colors.YELLOW}# Ver estrutura extraída:${colors.NC}`);
        console.log(`  ls -la ${this.testExtract}`);
        console.log(`  ${colors.YELLOW}# Testar novamente:${colors.NC}`);
        console.log(`  tsx testLookatni.ts`);
    }
    getAllFiles(dir) {
        const files = [];
        try {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                if (item.isDirectory()) {
                    files.push(...this.getAllFiles(fullPath));
                }
                else {
                    files.push(fullPath);
                }
            }
        }
        catch (error) {
        }
        return files;
    }
}
exports.LookAtniTester = LookAtniTester;
async function main() {
    const args = process.argv.slice(2);
    if (args.includes('-h') || args.includes('--help')) {
        console.log(`${colors.CYAN}🧪 LookAtni Test Suite v3.0${colors.NC}`);
        console.log("===============================");
        console.log("");
        console.log("Este script testa o sistema LookAtni criando uma estrutura de teste,");
        console.log("gerando marcadores e extraindo os arquivos para validar o funcionamento.");
        console.log("");
        console.log("Uso: tsx testLookatni.ts");
        console.log("");
        console.log("O teste irá:");
        console.log("1. Criar uma estrutura de projeto de teste");
        console.log("2. Gerar marcadores usando generateMarkers.ts");
        console.log("3. Extrair arquivos usando extractFiles.ts");
        console.log("4. Validar que os arquivos extraídos são idênticos aos originais");
        console.log("5. Limpar os arquivos temporários");
        return;
    }
    try {
        const tester = new LookAtniTester();
        await tester.runTests();
        process.exit(0);
    }
    catch (error) {
        console.error(`${colors.RED}❌ Erro nos testes: ${error}${colors.NC}`);
        process.exit(1);
    }
}
if (require.main === module) {
    main().catch(console.error);
}
