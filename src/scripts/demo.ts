#!/usr/bin/env node

/**
 * Script de demonstração do LookAtni v4.0
 * Mostra como funciona o sistema de marcadores invisíveis
 */

import * as fs from 'fs';

// Marcadores invisíveis usando File Separator (FS - ASCII 28)
const FS_CHAR = String.fromCharCode(28); // Caractere invisível
const MARKER_START = `//${FS_CHAR}/`;     // //␜/
const MARKER_END = `/${FS_CHAR}//`;       // /␜//

// Cores
const colors = {
    RED: '\x1b[0;31m',
    GREEN: '\x1b[0;32m',
    YELLOW: '\x1b[1;33m',
    BLUE: '\x1b[0;34m',
    PURPLE: '\x1b[0;35m',
    CYAN: '\x1b[0;36m',
    NC: '\x1b[0m' // No Color
};

class LookAtniDemo {
    private demoFile = 'demo-code.txt';

    run(): void {
        console.log(`${colors.CYAN}🚀 LookAtni File Markers Demo v4.0${colors.NC}`);
        console.log("======================================================");
        console.log("");

        this.createDemoFile();
        this.showMarkers();
        this.showUsageExamples();
        this.printConclusion();
    }

    private createDemoFile(): void {
        console.log(`${colors.YELLOW}📄 Criando arquivo de demonstração...${colors.NC}`);

        // Criar marcadores com caracteres invisíveis
        const helloMarker = `${MARKER_START} hello.js ${MARKER_END}`;
        const styleMarker = `${MARKER_START} style.css ${MARKER_END}`;
        const htmlMarker = `${MARKER_START} index.html ${MARKER_END}`;
        const readmeMarker = `${MARKER_START} README.md ${MARKER_END}`;

        const demoContent = `# LookAtni Demo Code

${helloMarker}
console.log('Hello, LookAtni!');
console.log('Sistema de marcadores invisíveis funcionando!');

const message = 'Bem-vindo ao futuro do compartilhamento de código!';
console.log(message);

// Função para demonstrar funcionalidade
function showDemo() {
    console.log('🎉 LookAtni está funcionando perfeitamente!');
    console.log('📁 Agora você pode compartilhar projetos inteiros em um só arquivo!');
}

showDemo();

${styleMarker}
/* LookAtni Demo Styles */
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    margin: 0;
    padding: 20px;
    min-height: 100vh;
    color: white;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

.header {
    text-align: center;
    margin-bottom: 30px;
}

.header h1 {
    font-size: 3em;
    margin: 0;
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-top: 30px;
}

.feature-card {
    background: rgba(255, 255, 255, 0.1);
    padding: 20px;
    border-radius: 15px;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

${htmlMarker}
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LookAtni Revolution Demo</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>🚀 LookAtni Revolution</h1>
            <p>Sistema revolucionário de marcadores invisíveis que permite 
            compartilhar projetos inteiros em um único arquivo!</p>
        </header>
        
        <main>
            <div class="features">
                <div class="feature-card">
                    <h3>🎯 Marcadores Únicos</h3>
                    <p>Marcadores invisíveis que nunca conflitam com seu código</p>
                </div>
                
                <div class="feature-card">
                    <h3>📁 Múltiplos Arquivos</h3>
                    <p>Organize projetos inteiros em um só documento</p>
                </div>
                
                <div class="feature-card">
                    <h3>🚀 Extração Automática</h3>
                    <p>Reconstrua o projeto com um simples comando</p>
                </div>
                
                <div class="feature-card">
                    <h3>🔄 Cross-Platform</h3>
                    <p>Funciona em Windows, Linux e macOS</p>
                </div>
            </div>
        </main>
    </div>
    
    <script src="hello.js"></script>
</body>
</html>

${readmeMarker}
# 🚀 LookAtni Revolution Demo

Este é um projeto de demonstração do **LookAtni Revolution**, o sistema mais avançado para compartilhamento e reconstrução de projetos.

## ✨ Características

- 🎯 **Marcadores invisíveis** que nunca conflitam
- 📁 **Múltiplos arquivos** em um só documento
- 🚀 **Extração automática** com um comando
- 🔄 **Cross-platform** (Windows, Linux, macOS)
- 💼 **Zero dependências** para o arquivo final
- 🎨 **Compatível** com qualquer linguagem de programação

## 📋 Como Usar

### 1. Instalar ferramentas
\`\`\`bash
npm install -g lookatni-revolution
\`\`\`

### 2. Extrair projeto
\`\`\`bash
tsx extractFiles.ts demo-code.txt ./meu-projeto
\`\`\`

### 3. Executar projeto
\`\`\`bash
cd meu-projeto
# Abrir index.html no navegador
\`\`\`

## 🔍 Comandos Úteis

### Validar marcadores invisíveis
\`\`\`bash
tsx extractFiles.ts demo-code.txt --format
\`\`\`

### Simular extração
\`\`\`bash
tsx extractFiles.ts demo-code.txt ./demo --dry-run --stats
\`\`\`

### Extrair com estatísticas
\`\`\`bash
tsx extractFiles.ts demo-code.txt ./demo --stats --verbose
\`\`\`

## 🎉 Resultado

Depois de extrair, você terá:
- \`index.html\` - Página principal
- \`style.css\` - Estilos modernos
- \`hello.js\` - Lógica JavaScript
- \`README.md\` - Esta documentação

**Pronto para usar!** 🚀
`;

        // Escrever arquivo
        fs.writeFileSync(this.demoFile, demoContent);
        console.log(`${colors.GREEN}✅ Demo criada: ${this.demoFile}${colors.NC}`);
    }

    private showMarkers(): void {
        console.log("");
        console.log(`${colors.BLUE}🔍 Analisando marcadores invisíveis...${colors.NC}`);
        
        if (!fs.existsSync(this.demoFile)) {
            console.log(`${colors.RED}❌ Arquivo ${this.demoFile} não encontrado!${colors.NC}`);
            return;
        }

        const content = fs.readFileSync(this.demoFile, 'utf-8');
        const markers = content.split('\n').filter(line => line.startsWith(MARKER_START));
        
        console.log(`${colors.GREEN}📊 Encontrados ${markers.length} marcadores invisíveis:${colors.NC}`);
        markers.forEach((marker, index) => {
            // Extrair nome do arquivo
            const match = marker.match(new RegExp(`^//${FS_CHAR}/ (.+) /${FS_CHAR}//$`));
            if (match) {
                console.log(`  ${(index + 1).toString().padStart(2)}. ${colors.CYAN}${match[1]}${colors.NC}`);
            }
        });
    }

    private showUsageExamples(): void {
        console.log("");
        console.log(`${colors.PURPLE}🚀 Exemplos de uso:${colors.NC}`);
        console.log("");
        console.log(`${colors.YELLOW}1. Extrair projeto completo:${colors.NC}`);
        console.log(`  tsx extractFiles.ts ${this.demoFile} ./demo-extracted`);
        console.log("");
        console.log(`${colors.YELLOW}2. Validar marcadores invisíveis:${colors.NC}`);
        console.log(`  tsx extractFiles.ts ${this.demoFile} --format`);
        console.log("");
        console.log(`${colors.YELLOW}3. Simular extração:${colors.NC}`);
        console.log(`  tsx extractFiles.ts ${this.demoFile} ./demo --dry-run --stats`);
        console.log("");
        console.log(`${colors.YELLOW}4. Modo interativo:${colors.NC}`);
        console.log(`  tsx extractFiles.ts ${this.demoFile} ./demo --interactive`);
    }

    private printConclusion(): void {
        console.log("");
        console.log(`${colors.GREEN}🎉 Demo concluída com sucesso!${colors.NC}`);
        console.log("");
        console.log(`${colors.CYAN}💡 Próximos passos:${colors.NC}`);
        console.log(`  1. Extrair o projeto: ${colors.YELLOW}tsx extractFiles.ts ${this.demoFile} ./demo-extracted${colors.NC}`);
        console.log(`  2. Abrir o HTML: ${colors.YELLOW}cd demo-extracted && open index.html${colors.NC}`);
        console.log(`  3. Estudar o código gerado e personalizar!`);
        console.log("");
        console.log(`${colors.PURPLE}🔗 Arquivo gerado: ${this.demoFile}${colors.NC}`);
        console.log(`${colors.PURPLE}📁 Contém: HTML, CSS, JavaScript e documentação${colors.NC}`);
        console.log(`${colors.PURPLE}✨ Marcadores: Invisíveis e seguros para marketplace!${colors.NC}`);
        console.log("");
        console.log(`${colors.CYAN}Experimente agora mesmo! 🚀${colors.NC}`);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    const demo = new LookAtniDemo();
    demo.run();
}

export { LookAtniDemo };
