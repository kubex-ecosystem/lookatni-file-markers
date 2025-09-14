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
exports.LookAtniGenerator = void 0;
const child_process_1 = require("child_process");
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const FS_CHAR = String.fromCharCode(28);
const MARKER_START = `//${FS_CHAR}/`;
const MARKER_END = `/${FS_CHAR}//`;
const colors = {
    RED: '\x1b[0;31m',
    GREEN: '\x1b[0;32m',
    YELLOW: '\x1b[1;33m',
    BLUE: '\x1b[0;34m',
    PURPLE: '\x1b[0;35m',
    CYAN: '\x1b[0;36m',
    NC: '\x1b[0m'
};
class LookAtniGenerator {
    constructor(options) {
        this.options = options;
        this.stats = {
            totalFiles: 0,
            processedFiles: 0,
            skippedFiles: 0,
            totalSize: 0,
            outputSize: 0,
            largestFile: { path: '', size: 0 }
        };
    }
    printHelp() {
        console.log(`${colors.CYAN}🔧 LookAtni Marker Generator v4.0${colors.NC}`);
        console.log("================================================");
        console.log("Gera arquivo com marcadores únicos a partir de estrutura existente");
        console.log("");
        console.log("Uso: tsx generateMarkers.ts [diretorio] [arquivo_saida] [opcoes]");
        console.log("");
        console.log("Parâmetros:");
        console.log("  diretorio      : Diretório para escanear (padrão: .)");
        console.log("  arquivo_saida  : Arquivo de saída (padrão: lookatni-code.txt)");
        console.log("");
        console.log("Opções:");
        console.log("  -e, --exclude PATTERN : Excluir arquivos/diretórios (pode usar múltiplas vezes)");
        console.log("  -i, --include PATTERN : Incluir apenas arquivos que correspondem ao padrão");
        console.log("  -m, --max-size SIZE   : Tamanho máximo do arquivo em KB (padrão: 1000)");
        console.log("  -v, --verbose         : Saída detalhada");
        console.log("  -h, --help           : Esta ajuda");
        console.log("");
        console.log(`${colors.PURPLE}🌐 Opções Remotas (NOVO!):${colors.NC}`);
        console.log("  -r, --remote USER@HOST:/PATH : Enviar arquivo para servidor remoto via SCP");
        console.log("  -k, --ssh-key PATH          : Chave SSH personalizada para autenticação");
        console.log("  -c, --compress               : Usar compressão durante o upload");
        console.log("  --retry N                    : Número de tentativas de upload (padrão: 3)");
        console.log("");
        console.log("Exemplos Básicos:");
        console.log("  tsx generateMarkers.ts ./src projeto.txt");
        console.log("  tsx generateMarkers.ts . codigo.txt --exclude node_modules --exclude .git");
        console.log("  tsx generateMarkers.ts ./meu-projeto saida.txt --include '*.js' --include '*.ts'");
        console.log("");
        console.log(`${colors.CYAN}🚀 Exemplos com Upload Remoto:${colors.NC}`);
        console.log("  # Backup automático");
        console.log("  tsx generateMarkers.ts ./src backup.txt --remote backup@servidor:/snapshots/");
        console.log("");
        console.log("  # Colaboração com compressão");
        console.log("  tsx generateMarkers.ts . projeto.txt --remote dev@team:/sharing/ --compress");
        console.log("");
        console.log("  # Deploy com chave SSH específica");
        console.log("  tsx generateMarkers.ts ./dist deploy.txt --remote prod@servidor:/deploy/ --ssh-key ~/.ssh/deploy_key");
        console.log("");
        console.log("  # Sync com retry customizado");
        console.log("  tsx generateMarkers.ts . sync.txt --remote laptop@casa:/sync/ --retry 5");
        console.log("");
        console.log("💡 O arquivo gerado pode ser usado com:");
        console.log("  tsx extractFiles.ts codigo.txt ./novo-projeto");
        console.log("");
        console.log(`${colors.YELLOW}🔐 Configuração SSH:${colors.NC}`);
        console.log("  • Configure chaves SSH sem senha: ssh-keygen -t rsa -b 4096");
        console.log("  • Copie a chave pública: ssh-copy-id user@servidor");
        console.log("  • Teste a conexão: ssh user@servidor");
    }
    shouldExcludeFile(filePath) {
        const fileName = path.basename(filePath);
        const relativePath = filePath;
        const defaultExclusions = [
            'node_modules',
            '.git',
            '.vscode',
            '.idea',
            'dist',
            'build',
            'out',
            'coverage',
            '.nyc_output',
            'package-lock.json',
            'yarn.lock',
            'pnpm-lock.yaml',
            '.DS_Store',
            'Thumbs.db',
            '*.log',
            '*.tmp',
            '*.temp'
        ];
        for (const pattern of defaultExclusions) {
            if (pattern.includes('*')) {
                const regex = new RegExp(pattern.replace(/\*/g, '.*'));
                if (regex.test(fileName)) {
                    return true;
                }
            }
            else if (relativePath.includes(pattern) || fileName === pattern) {
                return true;
            }
        }
        for (const pattern of this.options.excludePatterns) {
            if (pattern.includes('*')) {
                const regex = new RegExp(pattern.replace(/\*/g, '.*'));
                if (regex.test(fileName) || regex.test(relativePath)) {
                    return true;
                }
            }
            else if (relativePath.includes(pattern) || fileName === pattern) {
                return true;
            }
        }
        return false;
    }
    shouldIncludeFile(filePath) {
        if (this.options.includePatterns.length === 0) {
            return true;
        }
        const fileName = path.basename(filePath);
        const relativePath = filePath;
        for (const pattern of this.options.includePatterns) {
            if (pattern.includes('*')) {
                const regex = new RegExp(pattern.replace(/\*/g, '.*'));
                if (regex.test(fileName) || regex.test(relativePath)) {
                    return true;
                }
            }
            else if (relativePath.includes(pattern) || fileName === pattern) {
                return true;
            }
        }
        return false;
    }
    isTextFile(filePath) {
        const textExtensions = [
            '.txt', '.md', '.json', '.js', '.ts', '.tsx', '.jsx',
            '.html', '.htm', '.css', '.scss', '.sass', '.less',
            '.xml', '.yaml', '.yml', '.toml', '.ini', '.cfg',
            '.py', '.java', '.c', '.cpp', '.h', '.hpp',
            '.cs', '.php', '.rb', '.go', '.rs', '.swift',
            '.kt', '.scala', '.clj', '.hs', '.elm', '.f#',
            '.vb', '.sql', '.sh', '.bash', '.zsh', '.fish',
            '.ps1', '.bat', '.cmd', '.dockerfile', '.gitignore',
            '.gitattributes', '.editorconfig', '.prettierrc',
            '.eslintrc', '.babelrc', '.stylelintrc'
        ];
        const binaryExtensions = [
            '.exe', '.dll', '.so', '.dylib', '.bin', '.o', '.obj',
            '.a', '.lib', '.zip', '.tar', '.gz', '.bz2', '.7z',
            '.rar', '.iso', '.dmg', '.img', '.deb', '.rpm',
            '.msi', '.pkg', '.app', '.apk', '.ipa',
            '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico',
            '.svg', '.webp', '.tiff', '.psd', '.ai',
            '.mp3', '.mp4', '.avi', '.mkv', '.wav', '.flac',
            '.mov', '.wmv', '.m4a', '.ogg', '.webm',
            '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
            '.ttf', '.otf', '.woff', '.woff2', '.eot',
            '.pyc', '.pyo', '.class'
        ];
        const ext = path.extname(filePath).toLowerCase();
        if (binaryExtensions.includes(ext)) {
            if (this.options.verbose) {
                console.log(`${colors.YELLOW}🔍 Detected binary file (extension): ${filePath}${colors.NC}`);
            }
            return false;
        }
        if (textExtensions.includes(ext)) {
            return true;
        }
        if (!ext && fs.existsSync(filePath)) {
            try {
                const buffer = fs.readFileSync(filePath, { flag: 'r' });
                if (buffer.length > 0) {
                    const checkSize = Math.min(512, buffer.length);
                    for (let i = 0; i < checkSize; i++) {
                        if (buffer[i] === 0) {
                            if (this.options.verbose) {
                                console.log(`${colors.YELLOW}🔍 Detected binary file (null bytes): ${filePath}${colors.NC}`);
                            }
                            return false;
                        }
                    }
                }
            }
            catch (error) {
                if (this.options.verbose) {
                    console.log(`${colors.YELLOW}🔍 Cannot read file (assuming binary): ${filePath}${colors.NC}`);
                }
                return false;
            }
        }
        return true;
    }
    getAllFiles(dir, basePath = '') {
        const files = [];
        try {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                const relativePath = path.join(basePath, item.name);
                if (this.shouldExcludeFile(relativePath)) {
                    if (this.options.verbose) {
                        console.log(`${colors.YELLOW}⏭️  Excluindo: ${relativePath}${colors.NC}`);
                    }
                    continue;
                }
                if (item.isDirectory()) {
                    files.push(...this.getAllFiles(fullPath, relativePath));
                }
                else if (item.isFile()) {
                    if (this.shouldIncludeFile(relativePath) && this.isTextFile(fullPath)) {
                        const stat = fs.statSync(fullPath);
                        const sizeKB = stat.size / 1024;
                        if (sizeKB <= this.options.maxSizeKB) {
                            files.push(relativePath);
                            this.stats.totalSize += stat.size;
                            if (stat.size > this.stats.largestFile.size) {
                                this.stats.largestFile = { path: relativePath, size: stat.size };
                            }
                        }
                        else {
                            if (this.options.verbose) {
                                console.log(`${colors.YELLOW}📏 Arquivo muito grande, pulando: ${relativePath} (${Math.round(sizeKB)}KB > ${this.options.maxSizeKB}KB)${colors.NC}`);
                            }
                            this.stats.skippedFiles++;
                        }
                    }
                    else if (this.options.verbose) {
                        console.log(`${colors.YELLOW}🚫 Não incluído: ${relativePath}${colors.NC}`);
                    }
                }
            }
        }
        catch (error) {
            console.error(`${colors.RED}❌ Erro ao ler diretório ${dir}: ${error}${colors.NC}`);
        }
        return files;
    }
    async generateMarkers(sourceDir, outputFile) {
        const startTime = Date.now();
        console.log(`${colors.CYAN}🔧 LookAtni Marker Generator v4.0${colors.NC}`);
        console.log("================================================");
        if (!fs.existsSync(sourceDir)) {
            throw new Error(`${colors.RED}❌ Erro: Diretório '${sourceDir}' não encontrado!${colors.NC}`);
        }
        if (!fs.statSync(sourceDir).isDirectory()) {
            throw new Error(`${colors.RED}❌ Erro: '${sourceDir}' não é um diretório!${colors.NC}`);
        }
        console.log(`${colors.BLUE}📁 Diretório fonte: ${sourceDir}${colors.NC}`);
        console.log(`${colors.BLUE}📄 Arquivo de saída: ${outputFile}${colors.NC}`);
        console.log(`${colors.BLUE}📏 Tamanho máximo por arquivo: ${this.options.maxSizeKB}KB${colors.NC}`);
        if (this.options.excludePatterns.length > 0) {
            console.log(`${colors.BLUE}🚫 Padrões de exclusão: ${this.options.excludePatterns.join(', ')}${colors.NC}`);
        }
        if (this.options.includePatterns.length > 0) {
            console.log(`${colors.BLUE}✅ Padrões de inclusão: ${this.options.includePatterns.join(', ')}${colors.NC}`);
        }
        if (this.options.remote) {
            console.log("");
            console.log(`${colors.PURPLE}🌐 Configuração Remota:${colors.NC}`);
            console.log(`${colors.BLUE}📡 Destino: ${this.options.remote}${colors.NC}`);
            if (this.options.sshKey) {
                console.log(`${colors.BLUE}🔑 Chave SSH: ${this.options.sshKey}${colors.NC}`);
            }
            if (this.options.compress) {
                console.log(`${colors.BLUE}🗜️  Compressão: Habilitada${colors.NC}`);
            }
            console.log(`${colors.BLUE}🔄 Tentativas: ${this.options.retryAttempts}${colors.NC}`);
        }
        console.log("");
        console.log(`${colors.GREEN}🔍 Escaneando arquivos...${colors.NC}`);
        const files = this.getAllFiles(sourceDir);
        this.stats.totalFiles = files.length;
        if (files.length === 0) {
            throw new Error(`${colors.RED}❌ Nenhum arquivo encontrado para processar!${colors.NC}\n${colors.YELLOW}💡 Verifique os filtros de inclusão/exclusão${colors.NC}`);
        }
        console.log(`${colors.GREEN}📋 Encontrados ${files.length} arquivo(s) para processar${colors.NC}`);
        console.log("");
        if (this.options.verbose) {
            console.log(`${colors.PURPLE}📁 Arquivos a serem processados:${colors.NC}`);
            files.forEach((file, index) => {
                console.log(`  ${(index + 1).toString().padStart(3)}. ${file}`);
            });
            console.log("");
        }
        console.log(`${colors.GREEN}🚀 Gerando marcadores...${colors.NC}`);
        let output = '';
        output += await this.generateRichHeader(sourceDir, files.length);
        output += `\n`;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const filePath = path.join(sourceDir, file);
            console.log(`[${(i + 1).toString().padStart(3)}/${files.length}] 📄 ${file}`);
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                output += `${MARKER_START} ${file} ${MARKER_END}\n`;
                output += content;
                if (!content.endsWith('\n')) {
                    output += '\n';
                }
                if (i < files.length - 1) {
                    output += '\n';
                }
                this.stats.processedFiles++;
                if (this.options.verbose) {
                    const lines = content.split('\n').length;
                    const bytes = Buffer.byteLength(content, 'utf-8');
                    console.log(`        ${colors.GREEN}✅ Adicionado (${lines} linhas, ${bytes} bytes)${colors.NC}`);
                }
            }
            catch (error) {
                console.log(`        ${colors.RED}❌ Erro ao ler arquivo: ${error}${colors.NC}`);
                this.stats.skippedFiles++;
            }
        }
        try {
            fs.writeFileSync(outputFile, output, 'utf-8');
            this.stats.outputSize = Buffer.byteLength(output, 'utf-8');
            console.log("");
            console.log(`${colors.GREEN}💾 Arquivo salvo: ${outputFile}${colors.NC}`);
            if (this.options.remote) {
                const remoteInfo = this.parseRemoteDestination(this.options.remote);
                if (remoteInfo) {
                    console.log("");
                    console.log(`${colors.CYAN}🚀 Iniciando upload remoto...${colors.NC}`);
                    const connectionOk = await this.testSSHConnection(this.options.remote, this.options.sshKey);
                    if (connectionOk) {
                        const uploadSuccess = await this.uploadWithRetry(outputFile, this.options.remote, this.options.sshKey);
                        if (uploadSuccess) {
                            console.log(`${colors.GREEN}🎉 Upload remoto concluído com sucesso!${colors.NC}`);
                            console.log(`${colors.BLUE}📍 Localização remota: ${this.options.remote}${colors.NC}`);
                        }
                        else {
                            console.log(`${colors.RED}❌ Falha no upload remoto após ${this.options.retryAttempts} tentativas${colors.NC}`);
                            console.log(`${colors.YELLOW}💡 Arquivo local salvo em: ${outputFile}${colors.NC}`);
                        }
                    }
                    else {
                        console.log(`${colors.RED}❌ Não foi possível conectar ao servidor remoto${colors.NC}`);
                        console.log(`${colors.YELLOW}💡 Verifique a conectividade SSH e as credenciais${colors.NC}`);
                        console.log(`${colors.YELLOW}💡 Arquivo local salvo em: ${outputFile}${colors.NC}`);
                    }
                }
            }
        }
        catch (error) {
            throw new Error(`${colors.RED}❌ Erro ao salvar arquivo: ${error}${colors.NC}`);
        }
        const duration = Date.now() - startTime;
        this.printSummary(outputFile, duration);
    }
    async generateRichHeader(sourceDir, totalFiles) {
        const now = new Date();
        const hostname = os.hostname();
        const platform = os.platform();
        const arch = os.arch();
        const release = os.release();
        const userInfo = os.userInfo();
        const shell = process.env.SHELL || 'unknown';
        let osInfo = `${platform} ${arch}`;
        if (platform === 'linux') {
            try {
                const releaseInfo = fs.readFileSync('/etc/os-release', 'utf-8');
                const prettyName = releaseInfo.match(/PRETTY_NAME="([^"]+)"/);
                if (prettyName) {
                    osInfo = `${platform} ${arch} (${prettyName[1]})`;
                }
            }
            catch (error) {
                osInfo = `${platform} ${arch}`;
            }
        }
        const hashInput = `${sourceDir}-${totalFiles}-${now.toISOString()}-${hostname}`;
        const hash = crypto.createHash('sha256').update(hashInput).digest('hex').substring(0, 20);
        let version = 'unknown';
        try {
            const packagePath = path.join(__dirname, '../../package.json');
            if (fs.existsSync(packagePath)) {
                const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
                version = `v${packageJson.version}`;
            }
        }
        catch (error) {
        }
        const rawSizeMB = (this.stats.totalSize / (1024 * 1024)).toFixed(1);
        const header = `# LookAtni Code Snapshot
# -----------------------
# Data de geração: ${now.toISOString()}
# Fonte: ${path.resolve(sourceDir)}
# Hostname: ${hostname}
# Sistema: ${osInfo}
# Kernel: ${release}
# Usuário: ${userInfo.username}
# UID: ${userInfo.uid}
# Shell: ${shell}
# Total de arquivos: ${totalFiles}
# Tamanho bruto: ${rawSizeMB} MB
# Gerado por: lookatni@${version} (via CLI Script)
# Comando usado: tsx generateMarkers.ts ${process.argv.slice(2).join(' ')}
# Hash do snapshot: ${hash}...
`;
        return header;
    }
    printSummary(outputFile, duration) {
        console.log("");
        console.log(`${colors.CYAN}🎉 Geração concluída em ${duration}ms!${colors.NC}`);
        console.log("================================");
        console.log(`${colors.PURPLE}📊 Resumo:${colors.NC}`);
        console.log(`  • ${colors.GREEN}✅ Processados: ${this.stats.processedFiles}${colors.NC}`);
        console.log(`  • ${colors.YELLOW}⏭️  Pulados: ${this.stats.skippedFiles}${colors.NC}`);
        console.log(`  • ${colors.BLUE}📁 Total encontrados: ${this.stats.totalFiles}${colors.NC}`);
        console.log(`  • ${colors.CYAN}💾 Tamanho de entrada: ${Math.round(this.stats.totalSize / 1024)}KB${colors.NC}`);
        console.log(`  • ${colors.CYAN}💾 Tamanho de saída: ${Math.round(this.stats.outputSize / 1024)}KB${colors.NC}`);
        console.log(`  • ${colors.PURPLE}📏 Maior arquivo: ${this.stats.largestFile.path} (${Math.round(this.stats.largestFile.size / 1024)}KB)${colors.NC}`);
        console.log(`  • ${colors.YELLOW}⏱️  Tempo: ${duration}ms${colors.NC}`);
        console.log("");
        console.log(`${colors.GREEN}🔍 Arquivo gerado: ${outputFile}${colors.NC}`);
        console.log("");
        console.log(`${colors.CYAN}🚀 Para extrair os arquivos:${colors.NC}`);
        console.log(`  ${colors.YELLOW}tsx extractFiles.ts ${outputFile} ./extracted${colors.NC}`);
        console.log("");
        console.log(`${colors.CYAN}🔧 Para visualizar marcadores:${colors.NC}`);
        console.log(`  ${colors.YELLOW}grep '^${MARKER_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}' ${outputFile}${colors.NC}`);
        console.log("");
        console.log(`${colors.PURPLE}💡 Comandos úteis:${colors.NC}`);
        console.log(`  ${colors.YELLOW}# Contar marcadores:${colors.NC}`);
        console.log(`  grep '^${MARKER_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}' ${outputFile} | wc -l`);
        console.log(`  ${colors.YELLOW}# Listar arquivos:${colors.NC}`);
        console.log(`  grep '^${MARKER_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}' ${outputFile} | sed 's/^${MARKER_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\(.*\\) ${MARKER_END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$/\\1/'`);
        console.log(`  ${colors.YELLOW}# Validar formato:${colors.NC}`);
        console.log(`  tsx extractFiles.ts ${outputFile} --format`);
    }
    async testSSHConnection(remote, sshKey) {
        return new Promise((resolve) => {
            const [userHost] = remote.split(':');
            const sshArgs = ['ssh', '-o', 'ConnectTimeout=10', '-o', 'BatchMode=yes'];
            if (sshKey) {
                sshArgs.push('-i', sshKey);
            }
            sshArgs.push(userHost, 'echo "SSH_TEST_OK"');
            if (this.options.verbose) {
                console.log(`${colors.BLUE}🔑 Testando conexão SSH: ${userHost}${colors.NC}`);
            }
            const ssh = (0, child_process_1.spawn)(sshArgs[0], sshArgs.slice(1), { stdio: 'pipe' });
            let output = '';
            ssh.stdout.on('data', (data) => {
                output += data.toString();
            });
            ssh.on('close', (code) => {
                const success = code === 0 && output.includes('SSH_TEST_OK');
                if (this.options.verbose) {
                    console.log(`${success ? colors.GREEN + '✅' : colors.RED + '❌'} Conexão SSH: ${success ? 'Sucesso' : 'Falhou'}${colors.NC}`);
                }
                resolve(success);
            });
            ssh.on('error', () => resolve(false));
        });
    }
    async uploadFileWithSCP(localFile, remote, sshKey) {
        return new Promise((resolve) => {
            const scpArgs = ['scp', '-o', 'ConnectTimeout=30'];
            if (sshKey) {
                scpArgs.push('-i', sshKey);
            }
            if (this.options.compress) {
                scpArgs.push('-C');
            }
            scpArgs.push(localFile, remote);
            if (this.options.verbose) {
                console.log(`${colors.CYAN}📤 Enviando: ${localFile} → ${remote}${colors.NC}`);
                console.log(`${colors.YELLOW}🔧 Comando: ${scpArgs.join(' ')}${colors.NC}`);
            }
            const scp = (0, child_process_1.spawn)(scpArgs[0], scpArgs.slice(1), { stdio: 'pipe' });
            let errorOutput = '';
            scp.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });
            scp.on('close', (code) => {
                const success = code === 0;
                if (!success && this.options.verbose) {
                    console.log(`${colors.RED}❌ Erro no SCP: ${errorOutput}${colors.NC}`);
                }
                resolve(success);
            });
            scp.on('error', (err) => {
                if (this.options.verbose) {
                    console.log(`${colors.RED}❌ Erro ao executar SCP: ${err.message}${colors.NC}`);
                }
                resolve(false);
            });
        });
    }
    async uploadWithRetry(localFile, remote, sshKey) {
        for (let attempt = 1; attempt <= this.options.retryAttempts; attempt++) {
            if (this.options.verbose && attempt > 1) {
                console.log(`${colors.YELLOW}🔄 Tentativa ${attempt}/${this.options.retryAttempts}${colors.NC}`);
            }
            const success = await this.uploadFileWithSCP(localFile, remote, sshKey);
            if (success) {
                if (attempt > 1) {
                    console.log(`${colors.GREEN}✅ Upload bem-sucedido na tentativa ${attempt}${colors.NC}`);
                }
                return true;
            }
            if (attempt < this.options.retryAttempts) {
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                if (this.options.verbose) {
                    console.log(`${colors.YELLOW}⏳ Aguardando ${delay}ms antes da próxima tentativa...${colors.NC}`);
                }
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        return false;
    }
    parseRemoteDestination(remote) {
        const match = remote.match(/^([^:]+):(.+)$/);
        if (!match) {
            console.log(`${colors.RED}❌ Formato de destino remoto inválido: ${remote}${colors.NC}`);
            console.log(`${colors.YELLOW}💡 Use o formato: user@host:/path/to/destination${colors.NC}`);
            return null;
        }
        return {
            userHost: match[1],
            path: match[2]
        };
    }
}
exports.LookAtniGenerator = LookAtniGenerator;
async function main() {
    const args = process.argv.slice(2);
    const options = {
        excludePatterns: [],
        includePatterns: [],
        maxSizeKB: 1000,
        verbose: false,
        compress: false,
        retryAttempts: 3
    };
    let sourceDir = '.';
    let outputFile = 'lookatni-code.txt';
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
            case '-e':
            case '--exclude':
                if (i + 1 < args.length) {
                    options.excludePatterns.push(args[++i]);
                }
                else {
                    console.error(`❌ Padrão de exclusão necessário após ${arg}`);
                    process.exit(1);
                }
                break;
            case '-i':
            case '--include':
                if (i + 1 < args.length) {
                    options.includePatterns.push(args[++i]);
                }
                else {
                    console.error(`❌ Padrão de inclusão necessário após ${arg}`);
                    process.exit(1);
                }
                break;
            case '-m':
            case '--max-size':
                if (i + 1 < args.length) {
                    const size = parseInt(args[++i]);
                    if (isNaN(size) || size <= 0) {
                        console.error(`❌ Tamanho máximo inválido: ${args[i]}`);
                        process.exit(1);
                    }
                    options.maxSizeKB = size;
                }
                else {
                    console.error(`❌ Tamanho máximo necessário após ${arg}`);
                    process.exit(1);
                }
                break;
            case '-r':
            case '--remote':
                if (i + 1 < args.length) {
                    options.remote = args[++i];
                }
                else {
                    console.error(`❌ Destino remoto necessário após ${arg}`);
                    process.exit(1);
                }
                break;
            case '-k':
            case '--ssh-key':
                if (i + 1 < args.length) {
                    options.sshKey = args[++i];
                }
                else {
                    console.error(`❌ Caminho da chave SSH necessário após ${arg}`);
                    process.exit(1);
                }
                break;
            case '-c':
            case '--compress':
                options.compress = true;
                break;
            case '--retry':
                if (i + 1 < args.length) {
                    const retry = parseInt(args[++i]);
                    if (isNaN(retry) || retry <= 0) {
                        console.error(`❌ Número de tentativas inválido: ${args[i]}`);
                        process.exit(1);
                    }
                    options.retryAttempts = retry;
                }
                else {
                    console.error(`❌ Número de tentativas necessário após ${arg}`);
                    process.exit(1);
                }
                break;
            case '-v':
            case '--verbose':
                options.verbose = true;
                break;
            case '-h':
            case '--help':
                new LookAtniGenerator(options).printHelp();
                process.exit(0);
            default:
                if (arg.startsWith('-')) {
                    console.error(`❌ Opção desconhecida: ${arg}`);
                    console.error("Use --help para ajuda");
                    process.exit(1);
                }
                else {
                    if (sourceDir === '.') {
                        sourceDir = arg;
                    }
                    else if (outputFile === 'lookatni-code.txt') {
                        outputFile = arg;
                    }
                    else {
                        console.error("❌ Muitos argumentos!");
                        process.exit(1);
                    }
                }
                break;
        }
    }
    try {
        const generator = new LookAtniGenerator(options);
        await generator.generateMarkers(sourceDir, outputFile);
        process.exit(0);
    }
    catch (error) {
        console.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}
if (require.main === module) {
    main().catch(console.error);
}
