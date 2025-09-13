#!/usr/bin/env node

/**
 * Script para extrair arquivos usando marcadores únicos v4.0
 * Formato: //˙/ caminho/arquivo /˙// (usando caractere invisível FS)
 * Criado pelo sistema LookAtni
 * Uso: tsx extractFiles.ts codigo.txt [diretorio_destino] [opcoes]
 */

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

// Marcadores invisíveis usando File Separator (FS - ASCII 28)
const FS_CHAR = String.fromCharCode(28); // Caractere invisível
const MARKER_START = `//${FS_CHAR}/`;     // //␜/
const MARKER_END = `/${FS_CHAR}//`;       // /␜//
const MARKER_REGEX = new RegExp(`^//${FS_CHAR}/ (.+) /${FS_CHAR}//$`);

// Cores para output
const colors = {
    RED: '\x1b[0;31m',
    GREEN: '\x1b[0;32m',
    YELLOW: '\x1b[1;33m',
    BLUE: '\x1b[0;34m',
    PURPLE: '\x1b[0;35m',
    CYAN: '\x1b[0;36m',
    NC: '\x1b[0m' // No Color
};

interface ExtractOptions {
    interactive: boolean;
    verbose: boolean;
    dryRun: boolean;
    showStats: boolean;
    validateFormat: boolean;
}

interface ExtractStats {
    totalFiles: number;
    successCount: number;
    errorCount: number;
    bytesExtracted: number;
    duration: number;
    sourceSize: number;
}

class LookAtniExtractor {
    private options: ExtractOptions;
    private stats: ExtractStats;

    constructor(options: ExtractOptions) {
        this.options = options;
        this.stats = {
            totalFiles: 0,
            successCount: 0,
            errorCount: 0,
            bytesExtracted: 0,
            duration: 0,
            sourceSize: 0
        };
    }

    printHelp(): void {
        console.log(`${colors.CYAN}🚀 LookAtni File Extractor v4.0 - The Magic Code Decomposer${colors.NC}`);
        console.log("============================================================");
        console.log("Uso: tsx extractFiles.ts <arquivo_codigo> [diretorio_destino] [opcoes]");
        console.log("");
        console.log("Parâmetros:");
        console.log("  arquivo_codigo    : Arquivo com código marcado (obrigatório)");
        console.log("  diretorio_destino : Onde extrair os arquivos (padrão: ./extracted)");
        console.log("");
        console.log("Opções:");
        console.log("  -i, --interactive : Modo interativo (confirma cada arquivo)");
        console.log("  -v, --verbose     : Saída detalhada");
        console.log("  -d, --dry-run     : Simula extração sem criar arquivos");
        console.log("  -s, --stats       : Mostra estatísticas detalhadas");
        console.log("  -f, --format      : Valida formato dos marcadores");
        console.log("  -h, --help        : Esta ajuda");
        console.log("");
        console.log(`Formato de marcadores: ${MARKER_START} caminho/arquivo ${MARKER_END} (marcadores invisíveis)`);
        console.log("");
        console.log("Exemplos:");
        console.log("  tsx extractFiles.ts lookatni-code.txt ./meu-projeto");
        console.log("  tsx extractFiles.ts codigo.txt ./src --interactive");
        console.log("  tsx extractFiles.ts projeto.txt ./destino --dry-run --stats");
        console.log("");
        console.log("💡 Dicas:");
        console.log("  • Use --dry-run para testar antes de extrair");
        console.log("  • Use --interactive para controle total");
        console.log("  • Use --stats para análise detalhada");
    }

    validateMarkers(content: string): { isValid: boolean; errors: string[] } {
        const lines = content.split('\n');
        const errors: string[] = [];
        const markers: string[] = [];

        console.log("🔍 Validando formato dos marcadores...");

        // Encontrar todos os marcadores
        for (const line of lines) {
            if (line.startsWith(MARKER_START)) {
                markers.push(line);
            }
        }

        // Verificar marcadores mal formados
        const malformedMarkers = markers.filter(marker => 
            !MARKER_REGEX.test(marker));
        
        if (malformedMarkers.length > 0) {
            errors.push(`${colors.RED}❌ ${malformedMarkers.length} marcador(es) mal formado(s) encontrado(s)${colors.NC}`);
            errors.push("Marcadores problemáticos:");
            malformedMarkers.slice(0, 5).forEach(marker => errors.push(`  ${marker}`));
        }

        // Verificar duplicatas
        const fileNames = markers.map(marker => {
            const match = MARKER_REGEX.exec(marker);
            return match ? match[1] : marker;
        });
        const duplicates = fileNames.filter((item, index) => 
            fileNames.indexOf(item) !== index);
        
        if (duplicates.length > 0) {
            errors.push(`${colors.YELLOW}⚠️  ${duplicates.length} arquivo(s) duplicado(s) encontrado(s)${colors.NC}`);
            errors.push("Arquivos duplicados:");
            [...new Set(duplicates)].forEach(duplicate => errors.push(`  ${duplicate}`));
        }

        // Verificar caminhos suspeitos (apenas caminhos que tentam navegar para fora)
        const suspiciousPaths = fileNames.filter(fileName => 
            fileName.includes('../') || fileName.includes('/../') || fileName.startsWith('/'));
        
        if (suspiciousPaths.length > 0) {
            errors.push(`${colors.YELLOW}⚠️  ${suspiciousPaths.length} caminho(s) suspeito(s) encontrado(s)${colors.NC}`);
            errors.push("Caminhos suspeitos:");
            suspiciousPaths.slice(0, 3).forEach(path => errors.push(`  ${path}`));
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    async extractFiles(sourceFile: string, destDir: string): Promise<void> {
        const startTime = Date.now();

        console.log(`${colors.CYAN}🚀 LookAtni File Extractor v4.0${colors.NC}`);
        console.log(`${colors.CYAN}Usando marcadores invisíveis: ${MARKER_START} arquivo ${MARKER_END}${colors.NC}`);
        console.log("================================");

        // Verificar se o arquivo fonte existe
        if (!fs.existsSync(sourceFile)) {
            throw new Error(`${colors.RED}❌ Erro: Arquivo '${sourceFile}' não encontrado!${colors.NC}\n${colors.YELLOW}💡 Verifique se o caminho está correto${colors.NC}`);
        }

        // Ler conteúdo do arquivo
        const content = fs.readFileSync(sourceFile, 'utf-8');
        this.stats.sourceSize = Buffer.byteLength(content, 'utf-8');

        // Validar formato se solicitado
        if (this.options.validateFormat) {
            const validation = this.validateMarkers(content);
            if (validation.isValid) {
                console.log(`${colors.GREEN}✅ Formato dos marcadores válido!${colors.NC}`);
            } else {
                validation.errors.forEach(error => console.log(error));
                throw new Error(`${colors.RED}❌ Problemas encontrados no formato dos marcadores${colors.NC}`);
            }
        }

        // Extrair marcadores
        const lines = content.split('\n');
        const markers: string[] = [];
        
        for (const line of lines) {
            if (line.startsWith(MARKER_START)) {
                const match = MARKER_REGEX.exec(line);
                if (match) {
                    markers.push(match[1]);
                }
            }
        }

        if (markers.length === 0) {
            throw new Error(`${colors.RED}❌ Erro: Nenhum marcador ${MARKER_START} encontrado no arquivo!${colors.NC}\n${colors.YELLOW}💡 Verifique se o arquivo está no formato: ${MARKER_START} caminho/arquivo ${MARKER_END}${colors.NC}`);
        }

        this.stats.totalFiles = markers.length;

        console.log(`${colors.BLUE}📖 Arquivo fonte: ${sourceFile}${colors.NC}`);
        console.log(`${colors.BLUE}📁 Destino: ${destDir}${colors.NC}`);
        console.log(`${colors.BLUE}🔍 Marcadores encontrados: ${markers.length}${colors.NC}`);

        // Modo dry-run
        if (this.options.dryRun) {
            console.log(`${colors.YELLOW}🔍 MODO SIMULAÇÃO - Nenhum arquivo será criado${colors.NC}`);
        }

        // Limpar diretório de destino se existir (apenas se não for dry-run)
        if (!this.options.dryRun && fs.existsSync(destDir)) {
            console.log(`${colors.YELLOW}🧹 Limpando diretório existente: ${destDir}${colors.NC}`);
            fs.rmSync(destDir, { recursive: true, force: true });
        }

        console.log("");

        // Mostrar lista de arquivos
        console.log(`${colors.PURPLE}📁 Arquivos a serem extraídos:${colors.NC}`);
        markers.forEach((file, index) => {
            if (this.options.verbose) {
                console.log(`  ${(index + 1).toString().padStart(2)}. ${file}`);
            } else {
                console.log(`  ${(index + 1).toString().padStart(2)}. ${file}`);
            }
        });

        console.log("");

        // Confirmação interativa
        if (this.options.interactive) {
            console.log(`${colors.CYAN}🤔 Modo interativo ativado${colors.NC}`);
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            const answer = await new Promise<string>((resolve) => {
                rl.question('Deseja continuar com a extração? (s/N): ', resolve);
            });
            rl.close();

            if (!answer.toLowerCase().startsWith('s')) {
                console.log("Operação cancelada pelo usuário.");
                return;
            }
        }

        console.log(`${colors.GREEN}🚀 Iniciando extração de ${this.stats.totalFiles} arquivo(s)...${colors.NC}`);
        console.log("");

        // Extrair cada arquivo
        for (let i = 0; i < markers.length; i++) {
            const fileName = markers[i];
            const nextFileName = markers[i + 1];
            
            console.log(`[${(i + 1).toString().padStart(2)}/${this.stats.totalFiles}] 📄 ${fileName}`);
            
            // Confirmação interativa por arquivo
            if (this.options.interactive) {
                const readline = require('readline');
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                const answer = await new Promise<string>((resolve) => {
                    rl.question('  Extrair este arquivo? (s/N/a=todos): ', resolve);
                });
                rl.close();

                if (answer.toLowerCase().startsWith('a')) {
                    this.options.interactive = false; // Desabilita modo interativo
                } else if (!answer.toLowerCase().startsWith('s')) {
                    console.log(`        ${colors.YELLOW}⏭️  Pulando arquivo${colors.NC}`);
                    continue;
                }
            }

            // Criar diretório do arquivo
            const fileDir = path.dirname(fileName);
            const fullDestPath = path.join(destDir, fileName);
            const fullDestDir = path.dirname(fullDestPath);

            if (!this.options.dryRun) {
                fs.mkdirSync(fullDestDir, { recursive: true });
            }

            if (this.options.verbose && fileDir !== '.') {
                console.log(`        ${colors.BLUE}📂 Criando diretório: ${fullDestDir}${colors.NC}`);
            }

            // Extrair conteúdo do arquivo
            const startMarker = `${MARKER_START} ${fileName} ${MARKER_END}`;
            const endMarker = nextFileName ? `${MARKER_START} ${nextFileName} ${MARKER_END}` : null;

            let fileContent = '';
            let capturing = false;
            
            for (const line of lines) {
                if (line === startMarker) {
                    capturing = true;
                    continue;
                }
                
                if (capturing && endMarker && line === endMarker) {
                    break;
                }
                
                if (capturing) {
                    fileContent += line + '\n';
                }
            }

            // Remover última quebra de linha desnecessária
            if (fileContent.endsWith('\n')) {
                fileContent = fileContent.slice(0, -1);
            }

            // Salvar ou simular
            if (this.options.dryRun) {
                if (fileContent.length > 0) {
                    const lineCount = fileContent.split('\n').length;
                    const byteCount = Buffer.byteLength(fileContent, 'utf-8');
                    console.log(`        ${colors.GREEN}✅ Simulação OK (${lineCount} linhas, ${byteCount} bytes)${colors.NC}`);
                    this.stats.successCount++;
                    this.stats.bytesExtracted += byteCount;
                } else {
                    console.log(`        ${colors.RED}❌ Simulação: Arquivo vazio ou não encontrado${colors.NC}`);
                    this.stats.errorCount++;
                }
            } else {
                try {
                    fs.writeFileSync(fullDestPath, fileContent, 'utf-8');
                    
                    if (fs.existsSync(fullDestPath) && fs.statSync(fullDestPath).size > 0) {
                        const lineCount = fileContent.split('\n').length;
                        const byteCount = Buffer.byteLength(fileContent, 'utf-8');
                        console.log(`        ${colors.GREEN}✅ Sucesso (${lineCount} linhas, ${byteCount} bytes)${colors.NC}`);
                        this.stats.successCount++;
                        this.stats.bytesExtracted += byteCount;
                    } else {
                        console.log(`        ${colors.RED}❌ Erro: Arquivo vazio ou não criado${colors.NC}`);
                        this.stats.errorCount++;
                    }
                } catch (error) {
                    console.log(`        ${colors.RED}❌ Erro ao criar arquivo: ${error}${colors.NC}`);
                    this.stats.errorCount++;
                }
            }
        }

        this.stats.duration = Date.now() - startTime;
        this.printSummary(sourceFile, destDir);
    }

    private printSummary(sourceFile: string, destDir: string): void {
        console.log("");
        console.log(`${colors.CYAN}🎉 Extração concluída em ${this.stats.duration}ms!${colors.NC}`);
        console.log("================================");
        console.log(`${colors.PURPLE}📊 Resumo:${colors.NC}`);
        console.log(`  • ${colors.BLUE}Arquivo fonte: ${sourceFile}${colors.NC}`);
        console.log(`  • ${colors.BLUE}Destino: ${destDir}${colors.NC}`);
        console.log(`  • ${colors.GREEN}✅ Sucessos: ${this.stats.successCount}${colors.NC}`);
        console.log(`  • ${colors.RED}❌ Erros: ${this.stats.errorCount}${colors.NC}`);
        console.log(`  • ${colors.PURPLE}📁 Total: ${this.stats.totalFiles} arquivos${colors.NC}`);
        console.log(`  • ${colors.CYAN}💾 Bytes extraídos: ${this.stats.bytesExtracted}${colors.NC}`);
        console.log(`  • ${colors.YELLOW}⏱️  Tempo: ${this.stats.duration}ms${colors.NC}`);

        // Estatísticas detalhadas
        if (this.options.showStats) {
            this.printDetailedStats(destDir);
        }

        this.printUsefulCommands(sourceFile, destDir);
    }

    private printDetailedStats(destDir: string): void {
        console.log("");
        console.log(`${colors.CYAN}📈 Estatísticas Detalhadas:${colors.NC}`);
        console.log("================================");
        
        if (!this.options.dryRun && this.stats.successCount > 0 && fs.existsSync(destDir)) {
            console.log(`${colors.GREEN}🔍 Análise de arquivos criados:${colors.NC}`);
            
            // Mostrar estrutura básica
            console.log(`\n${colors.BLUE}🌳 Arquivos criados:${colors.NC}`);
            try {
                const files = this.getAllFiles(destDir);
                files.slice(0, 10).forEach(file => {
                    const relativePath = path.relative(destDir, file);
                    const stat = fs.statSync(file);
                    console.log(`  ${relativePath} (${stat.size} bytes)`);
                });
                
                if (files.length > 10) {
                    console.log(`  ... e mais ${files.length - 10} arquivo(s)`);
                }
            } catch (error) {
                console.log(`  Erro ao listar arquivos: ${error}`);
            }
        }
        
        // Estatísticas do arquivo fonte
        console.log(`\n${colors.BLUE}📄 Estatísticas do arquivo fonte:${colors.NC}`);
        console.log(`  • Tamanho: ${this.stats.sourceSize} bytes`);
        console.log(`  • Marcadores: ${this.stats.totalFiles}`);
        const efficiency = this.stats.sourceSize > 0 ? 
            Math.round((this.stats.bytesExtracted * 100) / this.stats.sourceSize) : 0;
        console.log(`  • Eficiência: ${efficiency}% do arquivo original`);
    }

    private getAllFiles(dir: string): string[] {
        const files: string[] = [];
        
        try {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                
                if (item.isDirectory()) {
                    files.push(...this.getAllFiles(fullPath));
                } else {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            // Ignore errors
        }
        
        return files;
    }

    private printUsefulCommands(sourceFile: string, destDir: string): void {
        console.log("");
        
        if (!this.options.dryRun && this.stats.successCount > 0) {
            console.log(`${colors.GREEN}🔍 Arquivos extraídos em: ${destDir}${colors.NC}`);
            console.log("");
            console.log(`${colors.CYAN}🚀 Para usar o projeto:${colors.NC}`);
            console.log(`  ${colors.YELLOW}cd ${destDir}${colors.NC}`);
            console.log(`  ${colors.YELLOW}npm install${colors.NC}`);
            console.log(`  ${colors.YELLOW}npm run dev${colors.NC}`);
            console.log("");
            console.log(`${colors.CYAN}🔧 Para extrair novamente:${colors.NC}`);
            console.log(`  ${colors.YELLOW}tsx extractFiles.ts ${sourceFile} ./novo-destino${colors.NC}`);
        }

        if (this.stats.errorCount > 0) {
            console.log("");
            console.log(`${colors.RED}⚠️  Alguns arquivos não foram extraídos corretamente.${colors.NC}`);
            console.log(`${colors.YELLOW}💡 Verifique se os marcadores estão no formato: ${MARKER_START} caminho/arquivo ${MARKER_END}${colors.NC}`);
            console.log(`${colors.YELLOW}💡 Use --format para validar os marcadores${colors.NC}`);
        }

        console.log("");
        console.log(`${colors.PURPLE}💡 Comandos úteis:${colors.NC}`);
        console.log(`  ${colors.YELLOW}# Listar marcadores:${colors.NC}`);
        console.log(`  grep '^${MARKER_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}' ${sourceFile}`);
        console.log(`  ${colors.YELLOW}# Buscar arquivo específico:${colors.NC}`);
        console.log(`  grep '^${MARKER_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} src/App.tsx ${MARKER_END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}' ${sourceFile} -A 20`);
        console.log(`  ${colors.YELLOW}# Contar marcadores:${colors.NC}`);
        console.log(`  grep '^${MARKER_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}' ${sourceFile} | wc -l`);
        console.log(`  ${colors.YELLOW}# Verificar formato:${colors.NC}`);
        console.log(`  tsx extractFiles.ts ${sourceFile} --format`);
        console.log(`  ${colors.YELLOW}# Modo simulação:${colors.NC}`);
        console.log(`  tsx extractFiles.ts ${sourceFile} ./destino --dry-run --stats`);
    }
}

// Função principal
async function main(): Promise<void> {
    const args = process.argv.slice(2);
    
    const options: ExtractOptions = {
        interactive: false,
        verbose: false,
        dryRun: false,
        showStats: false,
        validateFormat: false
    };

    let sourceFile = '';
    let destDir = './extracted';

    // Processar argumentos
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        switch (arg) {
            case '-i':
            case '--interactive':
                options.interactive = true;
                break;
            case '-v':
            case '--verbose':
                options.verbose = true;
                break;
            case '-d':
            case '--dry-run':
                options.dryRun = true;
                break;
            case '-s':
            case '--stats':
                options.showStats = true;
                break;
            case '-f':
            case '--format':
                options.validateFormat = true;
                break;
            case '-h':
            case '--help':
                new LookAtniExtractor(options).printHelp();
                process.exit(0);
                break;
            default:
                if (arg.startsWith('-')) {
                    console.error(`❌ Opção desconhecida: ${arg}`);
                    console.error("Use --help para ajuda");
                    process.exit(1);
                } else {
                    if (!sourceFile) {
                        sourceFile = arg;
                    } else if (destDir === './extracted') {
                        destDir = arg;
                    } else {
                        console.error("❌ Muitos argumentos!");
                        process.exit(1);
                    }
                }
                break;
        }
    }

    // Verificar se arquivo foi especificado
    if (!sourceFile) {
        new LookAtniExtractor(options).printHelp();
        process.exit(1);
    }

    try {
        const extractor = new LookAtniExtractor(options);
        await extractor.extractFiles(sourceFile, destDir);
        
        process.exit(0);
    } catch (error) {
        console.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main().catch(console.error);
}

export { LookAtniExtractor, ExtractOptions, ExtractStats };
