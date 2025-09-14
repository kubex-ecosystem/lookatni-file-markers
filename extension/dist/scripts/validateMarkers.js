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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const cliMarkerParser_1 = require("../utils/cliMarkerParser");
const cliLogger_1 = require("../utils/cliLogger");
const colors = {
    RED: '\x1b[0;31m',
    GREEN: '\x1b[0;32m',
    YELLOW: '\x1b[1;33m',
    BLUE: '\x1b[0;34m',
    PURPLE: '\x1b[0;35m',
    CYAN: '\x1b[0;36m',
    NC: '\x1b[0m'
};
class LookAtniValidator {
    constructor(options) {
        this.options = options;
        this.logger = new cliLogger_1.CLILogger('validate-script', options.verbose);
    }
    printHelp() {
        console.log(`${colors.CYAN}🔍 LookAtni Validator - Valida marcadores únicos${colors.NC}`);
        console.log("====================================================");
        console.log("");
        console.log("Uso: lookatni validate <arquivo> [opções]");
        console.log("");
        console.log(`${colors.YELLOW}Argumentos:${colors.NC}`);
        console.log("  arquivo                   Arquivo com marcadores para validar");
        console.log("");
        console.log(`${colors.YELLOW}Opções:${colors.NC}`);
        console.log("  -v, --verbose            Saída detalhada");
        console.log("  -w, --warnings           Mostrar avisos além de erros");
        console.log("  -j, --json              Saída em formato JSON");
        console.log("  -e, --exit-on-error     Sair com código de erro se inválido");
        console.log("  -h, --help              Mostrar esta ajuda");
        console.log("");
        console.log(`${colors.YELLOW}Exemplos:${colors.NC}`);
        console.log("");
        console.log(`${colors.BLUE}# Validar arquivo básico${colors.NC}`);
        console.log(`lookatni validate projeto.txt`);
        console.log("");
        console.log(`${colors.BLUE}# Validar com avisos e verbose${colors.NC}`);
        console.log(`lookatni validate projeto.txt --verbose --warnings`);
        console.log("");
        console.log(`${colors.BLUE}# Validar para CI/CD (JSON + exit on error)${colors.NC}`);
        console.log(`lookatni validate projeto.txt --json --exit-on-error`);
        console.log("");
        console.log(`${colors.PURPLE}💡 Dica: Use --exit-on-error em pipelines CI/CD para falhar builds com marcadores inválidos${colors.NC}`);
    }
    async validateFile(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                this.printError(`Arquivo não encontrado: ${filePath}`);
                return false;
            }
            const absolutePath = path.resolve(filePath);
            this.logger.info(`🔍 Validando arquivo: ${absolutePath}`);
            const parser = new cliMarkerParser_1.CLIMarkerParser(this.logger);
            const validation = parser.validateMarkers(absolutePath);
            this.showResults(validation, absolutePath);
            return validation.isValid;
        }
        catch (error) {
            this.printError(`Erro durante validação: ${error}`);
            return false;
        }
    }
    showResults(validation, filePath) {
        if (this.options.jsonOutput) {
            this.showJsonResults(validation, filePath);
        }
        else {
            this.showHumanResults(validation, filePath);
        }
    }
    showJsonResults(validation, filePath) {
        const result = {
            file: filePath,
            isValid: validation.isValid,
            statistics: validation.statistics,
            errors: validation.errors,
            timestamp: new Date().toISOString()
        };
        console.log(JSON.stringify(result, null, 2));
    }
    showHumanResults(validation, filePath) {
        const { isValid, errors, statistics } = validation;
        console.log("");
        console.log("=".repeat(60));
        console.log(`${colors.CYAN}📄 RESULTADOS DA VALIDAÇÃO${colors.NC}`);
        console.log("=".repeat(60));
        console.log(`Arquivo: ${path.basename(filePath)}`);
        console.log(`Status: ${isValid ? colors.GREEN + '✅ VÁLIDO' + colors.NC : colors.RED + '❌ INVÁLIDO' + colors.NC}`);
        console.log("");
        console.log(`${colors.YELLOW}📊 ESTATÍSTICAS:${colors.NC}`);
        console.log(`  Total de marcadores: ${statistics.totalMarkers}`);
        console.log(`  Arquivos duplicados: ${statistics.duplicateFilenames.length}`);
        console.log(`  Nomes inválidos: ${statistics.invalidFilenames.length}`);
        console.log(`  Marcadores vazios: ${statistics.emptyMarkers}`);
        const errorCount = errors.filter((e) => e.severity === 'error').length;
        const warningCount = errors.filter((e) => e.severity === 'warning').length;
        console.log(`  Erros: ${errorCount > 0 ? colors.RED + errorCount + colors.NC : colors.GREEN + '0' + colors.NC}`);
        console.log(`  Avisos: ${warningCount > 0 ? colors.YELLOW + warningCount + colors.NC : colors.GREEN + '0' + colors.NC}`);
        if (statistics.duplicateFilenames.length > 0) {
            console.log("");
            console.log(`${colors.YELLOW}🔄 ARQUIVOS DUPLICADOS:${colors.NC}`);
            statistics.duplicateFilenames.forEach((filename) => {
                console.log(`  • ${filename}`);
            });
        }
        if (statistics.invalidFilenames.length > 0) {
            console.log("");
            console.log(`${colors.RED}❌ NOMES INVÁLIDOS:${colors.NC}`);
            statistics.invalidFilenames.forEach((filename) => {
                console.log(`  • ${filename}`);
            });
        }
        if (errors.length > 0 && (this.options.showWarnings || this.options.verbose)) {
            console.log("");
            console.log(`${colors.YELLOW}📋 DETALHES DOS PROBLEMAS:${colors.NC}`);
            const sortedErrors = errors.sort((a, b) => a.line - b.line);
            for (const error of sortedErrors) {
                if (error.severity === 'error' || this.options.showWarnings) {
                    const icon = error.severity === 'error' ? '❌' : '⚠️';
                    const color = error.severity === 'error' ? colors.RED : colors.YELLOW;
                    console.log(`  ${icon} Linha ${color}${error.line}${colors.NC}: ${error.message}`);
                }
            }
        }
        console.log("");
        console.log("=".repeat(60));
        if (isValid) {
            const message = warningCount > 0
                ? `${colors.GREEN}✅ Arquivo válido${colors.NC} (${warningCount} avisos)`
                : `${colors.GREEN}✅ Arquivo completamente válido!${colors.NC}`;
            console.log(message);
        }
        else {
            console.log(`${colors.RED}❌ Arquivo inválido:${colors.NC} ${errorCount} erros, ${warningCount} avisos`);
        }
        console.log("");
    }
    printError(message) {
        console.error(`${colors.RED}❌ ${message}${colors.NC}`);
    }
}
async function main() {
    const args = process.argv.slice(2);
    const options = {
        verbose: args.includes('--verbose') || args.includes('-v'),
        showWarnings: args.includes('--warnings') || args.includes('-w'),
        jsonOutput: args.includes('--json') || args.includes('-j'),
        exitOnError: args.includes('--exit-on-error') || args.includes('-e')
    };
    if (args.includes('--help') || args.includes('-h')) {
        const validator = new LookAtniValidator(options);
        validator.printHelp();
        return;
    }
    const nonOptionArgs = args.filter(arg => !arg.startsWith('-'));
    if (nonOptionArgs.length === 0) {
        console.error(`${colors.RED}❌ Arquivo necessário${colors.NC}`);
        console.error(`${colors.YELLOW}Uso: lookatni validate <arquivo> [opções]${colors.NC}`);
        console.error(`${colors.YELLOW}Use 'lookatni validate --help' para mais informações${colors.NC}`);
        process.exit(1);
    }
    const filePath = nonOptionArgs[0];
    const validator = new LookAtniValidator(options);
    try {
        const isValid = await validator.validateFile(filePath);
        if (options.exitOnError && !isValid) {
            process.exit(1);
        }
        process.exit(0);
    }
    catch (error) {
        console.error(`${colors.RED}❌ Erro: ${error}${colors.NC}`);
        process.exit(1);
    }
}
if (require.main === module) {
    main().catch(console.error);
}
