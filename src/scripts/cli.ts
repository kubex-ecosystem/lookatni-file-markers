#!/usr/bin/env node

/**
 * LookAtni CLI - Interface unificada para todos os scripts
 * Uso: tsx cli.ts <comando> [argumentos]
 */

import { LookAtniExtractor } from './extractFiles';
import { LookAtniGenerator } from './generateMarkers';
import { LookAtniTester } from './testLookatni';
import { LookAtniDemo } from './demo';

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

class LookAtniCLI {
    printHelp(): void {
        console.log(`${colors.CYAN}🚀 LookAtni CLI v3.0 - Sistema de Marcadores Únicos${colors.NC}`);
        console.log("====================================================");
        console.log("");
        console.log("Uso: tsx cli.ts <comando> [argumentos]");
        console.log("");
        console.log(`${colors.YELLOW}Comandos disponíveis:${colors.NC}`);
        console.log("");
        console.log(`${colors.GREEN}extract${colors.NC}     - Extrai arquivos de um arquivo marcado`);
        console.log(`${colors.GREEN}generate${colors.NC}    - Gera marcadores a partir de uma estrutura de arquivos`);
        console.log(`${colors.GREEN}test${colors.NC}        - Executa testes do sistema LookAtni`);
        console.log(`${colors.GREEN}demo${colors.NC}        - Cria demonstração do sistema`);
        console.log(`${colors.GREEN}help${colors.NC}        - Mostra esta ajuda`);
        console.log("");
        console.log(`${colors.YELLOW}Exemplos:${colors.NC}`);
        console.log("");
        console.log(`${colors.BLUE}# Extrair arquivos${colors.NC}`);
        console.log(`tsx cli.ts extract codigo.txt ./projeto`);
        console.log(`tsx cli.ts extract codigo.txt ./destino --dry-run --stats`);
        console.log("");
        console.log(`${colors.BLUE}# Gerar marcadores${colors.NC}`);
        console.log(`tsx cli.ts generate ./src codigo.txt`);
        console.log(`tsx cli.ts generate . projeto.txt --exclude node_modules --include "*.ts"`);
        console.log("");
        console.log(`${colors.BLUE}# Executar testes${colors.NC}`);
        console.log(`tsx cli.ts test`);
        console.log("");
        console.log(`${colors.BLUE}# Criar demonstração${colors.NC}`);
        console.log(`tsx cli.ts demo`);
        console.log("");
        console.log(`${colors.PURPLE}Para ajuda específica de cada comando:${colors.NC}`);
        console.log(`tsx extractFiles.ts --help`);
        console.log(`tsx generateMarkers.ts --help`);
        console.log(`tsx testLookatni.ts --help`);
        console.log(`tsx demo.ts --help`);
        console.log("");
        console.log(`${colors.CYAN}✨ LookAtni File Markers - Organize your code with unique markers! ✨${colors.NC}`);
    }

    async handleCommand(command: string, args: string[]): Promise<void> {
        switch (command) {
            case 'extract':
                await this.handleExtract(args);
                break;
            case 'generate':
                await this.handleGenerate(args);
                break;
            case 'test':
                await this.handleTest(args);
                break;
            case 'demo':
                await this.handleDemo(args);
                break;
            case 'help':
            case '--help':
            case '-h':
                this.printHelp();
                break;
            default:
                console.error(`${colors.RED}❌ Comando desconhecido: ${command}${colors.NC}`);
                console.error(`${colors.YELLOW}Use 'tsx cli.ts help' para ver os comandos disponíveis${colors.NC}`);
                process.exit(1);
        }
    }

    private async handleExtract(args: string[]): Promise<void> {
        if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
            const extractor = new LookAtniExtractor({
                interactive: false,
                verbose: false,
                dryRun: false,
                showStats: false,
                validateFormat: false
            });
            extractor.printHelp();
            return;
        }

        const options = {
            interactive: args.includes('--interactive') || args.includes('-i'),
            verbose: args.includes('--verbose') || args.includes('-v'),
            dryRun: args.includes('--dry-run') || args.includes('-d'),
            showStats: args.includes('--stats') || args.includes('-s'),
            validateFormat: args.includes('--format') || args.includes('-f')
        };

        // Filtrar argumentos que não são opções
        const nonOptionArgs = args.filter(arg => !arg.startsWith('-'));
        
        if (nonOptionArgs.length === 0) {
            console.error(`${colors.RED}❌ Arquivo de código necessário${colors.NC}`);
            console.error(`${colors.YELLOW}Uso: tsx cli.ts extract <arquivo_codigo> [diretorio_destino]${colors.NC}`);
            process.exit(1);
        }

        const sourceFile = nonOptionArgs[0];
        const destDir = nonOptionArgs[1] || './extracted';

        const extractor = new LookAtniExtractor(options);
        await extractor.extractFiles(sourceFile, destDir);
    }

    private async handleGenerate(args: string[]): Promise<void> {
        if (args.includes('--help') || args.includes('-h')) {
            const generator = new LookAtniGenerator({
                excludePatterns: [],
                includePatterns: [],
                maxSizeKB: 1000,
                verbose: false
            });
            generator.printHelp();
            return;
        }

        const options = {
            excludePatterns: [] as string[],
            includePatterns: [] as string[],
            maxSizeKB: 1000,
            verbose: args.includes('--verbose') || args.includes('-v')
        };

        let sourceDir = '.';
        let outputFile = 'lookatni-code.txt';

        // Processar argumentos
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            
            switch (arg) {
                case '-e':
                case '--exclude':
                    if (i + 1 < args.length) {
                        options.excludePatterns.push(args[++i]);
                    }
                    break;
                case '-i':
                case '--include':
                    if (i + 1 < args.length) {
                        options.includePatterns.push(args[++i]);
                    }
                    break;
                case '-m':
                case '--max-size':
                    if (i + 1 < args.length) {
                        const size = parseInt(args[++i]);
                        if (!isNaN(size) && size > 0) {
                            options.maxSizeKB = size;
                        }
                    }
                    break;
                case '-v':
                case '--verbose':
                    // Já processado acima
                    break;
                default:
                    if (!arg.startsWith('-')) {
                        if (sourceDir === '.') {
                            sourceDir = arg;
                        } else if (outputFile === 'lookatni-code.txt') {
                            outputFile = arg;
                        }
                    }
                    break;
            }
        }

        const generator = new LookAtniGenerator(options);
        await generator.generateMarkers(sourceDir, outputFile);
    }

    private async handleTest(args: string[]): Promise<void> {
        if (args.includes('--help') || args.includes('-h')) {
            console.log(`${colors.CYAN}🧪 LookAtni Test Suite v3.0${colors.NC}`);
            console.log("===============================");
            console.log("");
            console.log("Executa testes completos do sistema LookAtni");
            console.log("");
            console.log("Uso: tsx cli.ts test");
            console.log("");
            console.log("Os testes irão:");
            console.log("1. Criar estrutura de teste");
            console.log("2. Gerar marcadores");
            console.log("3. Extrair arquivos");
            console.log("4. Validar integridade");
            console.log("5. Limpar arquivos temporários");
            return;
        }

        const tester = new LookAtniTester();
        await tester.runTests();
    }

    private async handleDemo(args: string[]): Promise<void> {
        if (args.includes('--help') || args.includes('-h')) {
            console.log(`${colors.CYAN}🎯 LookAtni Demo v3.0${colors.NC}`);
            console.log("=======================");
            console.log("");
            console.log("Cria arquivo de demonstração do sistema LookAtni");
            console.log("");
            console.log("Uso: tsx cli.ts demo");
            console.log("");
            console.log("Cria demo-code.txt com:");
            console.log("- Projeto web completo");
            console.log("- HTML, CSS, JavaScript");
            console.log("- Documentação e exemplos");
            return;
        }

        const demo = new LookAtniDemo();
        demo.run();
    }
}

// Função principal
async function main(): Promise<void> {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        const cli = new LookAtniCLI();
        cli.printHelp();
        return;
    }

    const command = args[0];
    const commandArgs = args.slice(1);

    try {
        const cli = new LookAtniCLI();
        await cli.handleCommand(command, commandArgs);
        
        process.exit(0);
    } catch (error) {
        console.error(`${colors.RED}❌ Erro: ${error}${colors.NC}`);
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main().catch(console.error);
}

export { LookAtniCLI };
