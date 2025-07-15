#!/usr/bin/env node

/**
 * Script para gerar marcadores únicos a partir de arquivos existentes
 * Complemento do extractFiles.ts - LookAtni v4.0
 * Uso: tsx generateMarkers.ts [diretorio] [arquivo_saida]
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';

// Marcadores invisíveis usando File Separator (FS - ASCII 28)
const FS_CHAR = String.fromCharCode(28); // Caractere invisível
const MARKER_START = `//${FS_CHAR}/`;     // //˙/
const MARKER_END = `/${FS_CHAR}//`;       // /˙//

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

interface GenerateOptions {
    excludePatterns: string[];
    includePatterns: string[];
    maxSizeKB: number;
    verbose: boolean;
    remote?: string;
    sshKey?: string;
    compress: boolean;
    retryAttempts: number;
}

interface GenerateStats {
    totalFiles: number;
    processedFiles: number;
    skippedFiles: number;
    totalSize: number;
    outputSize: number;
    largestFile: { path: string; size: number };
}

class LookAtniGenerator {
    private options: GenerateOptions;
    private stats: GenerateStats;

    constructor(options: GenerateOptions) {
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

    printHelp(): void {
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

    private shouldExcludeFile(filePath: string): boolean {
        const fileName = path.basename(filePath);
        const relativePath = filePath;

        // Exclusões padrão
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

        // Verificar exclusões padrão
        for (const pattern of defaultExclusions) {
            if (pattern.includes('*')) {
                const regex = new RegExp(pattern.replace(/\*/g, '.*'));
                if (regex.test(fileName)) {
                    return true;
                }
            } else if (relativePath.includes(pattern) || fileName === pattern) {
                return true;
            }
        }

        // Verificar exclusões personalizadas
        for (const pattern of this.options.excludePatterns) {
            if (pattern.includes('*')) {
                const regex = new RegExp(pattern.replace(/\*/g, '.*'));
                if (regex.test(fileName) || regex.test(relativePath)) {
                    return true;
                }
            } else if (relativePath.includes(pattern) || fileName === pattern) {
                return true;
            }
        }

        return false;
    }

    private shouldIncludeFile(filePath: string): boolean {
        // Se não há padrões de inclusão, incluir todos
        if (this.options.includePatterns.length === 0) {
            return true;
        }

        const fileName = path.basename(filePath);
        const relativePath = filePath;

        // Verificar se corresponde a algum padrão de inclusão
        for (const pattern of this.options.includePatterns) {
            if (pattern.includes('*')) {
                const regex = new RegExp(pattern.replace(/\*/g, '.*'));
                if (regex.test(fileName) || regex.test(relativePath)) {
                    return true;
                }
            } else if (relativePath.includes(pattern) || fileName === pattern) {
                return true;
            }
        }

        return false;
    }

    private isTextFile(filePath: string): boolean {
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

        const ext = path.extname(filePath).toLowerCase();
        return textExtensions.includes(ext);
    }

    private getAllFiles(dir: string, basePath: string = ''): string[] {
        const files: string[] = [];
        
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
                } else if (item.isFile()) {
                    if (this.shouldIncludeFile(relativePath) && this.isTextFile(fullPath)) {
                        const stat = fs.statSync(fullPath);
                        const sizeKB = stat.size / 1024;
                        
                        if (sizeKB <= this.options.maxSizeKB) {
                            files.push(relativePath);
                            this.stats.totalSize += stat.size;
                            
                            if (stat.size > this.stats.largestFile.size) {
                                this.stats.largestFile = { path: relativePath, size: stat.size };
                            }
                        } else {
                            if (this.options.verbose) {
                                console.log(`${colors.YELLOW}📏 Arquivo muito grande, pulando: ${relativePath} (${Math.round(sizeKB)}KB > ${this.options.maxSizeKB}KB)${colors.NC}`);
                            }
                            this.stats.skippedFiles++;
                        }
                    } else if (this.options.verbose) {
                        console.log(`${colors.YELLOW}🚫 Não incluído: ${relativePath}${colors.NC}`);
                    }
                }
            }
        } catch (error) {
            console.error(`${colors.RED}❌ Erro ao ler diretório ${dir}: ${error}${colors.NC}`);
        }
        
        return files;
    }

    async generateMarkers(sourceDir: string, outputFile: string): Promise<void> {
        const startTime = Date.now();

        console.log(`${colors.CYAN}🔧 LookAtni Marker Generator v4.0${colors.NC}`);
        console.log("================================================");

        // Verificar se o diretório fonte existe
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

        // Mostrar configurações remotas
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

        // Obter lista de arquivos
        const files = this.getAllFiles(sourceDir);
        this.stats.totalFiles = files.length;

        if (files.length === 0) {
            throw new Error(`${colors.RED}❌ Nenhum arquivo encontrado para processar!${colors.NC}\n${colors.YELLOW}💡 Verifique os filtros de inclusão/exclusão${colors.NC}`);
        }

        console.log(`${colors.GREEN}📋 Encontrados ${files.length} arquivo(s) para processar${colors.NC}`);
        console.log("");

        // Mostrar lista de arquivos se verbose
        if (this.options.verbose) {
            console.log(`${colors.PURPLE}📁 Arquivos a serem processados:${colors.NC}`);
            files.forEach((file, index) => {
                console.log(`  ${(index + 1).toString().padStart(3)}. ${file}`);
            });
            console.log("");
        }

        console.log(`${colors.GREEN}🚀 Gerando marcadores...${colors.NC}`);

        // Gerar conteúdo do arquivo com metadata rica
        let output = '';
        output += await this.generateRichHeader(sourceDir, files.length);
        output += `\n`;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const filePath = path.join(sourceDir, file);
            
            console.log(`[${(i + 1).toString().padStart(3)}/${files.length}] 📄 ${file}`);
            
            try {
                // Ler conteúdo do arquivo
                const content = fs.readFileSync(filePath, 'utf-8');
                
                // Adicionar marcador e conteúdo
                output += `${MARKER_START} ${file} ${MARKER_END}\n`;
                output += content;
                
                // Garantir quebra de linha no final
                if (!content.endsWith('\n')) {
                    output += '\n';
                }
                
                // Adicionar linha em branco entre arquivos
                if (i < files.length - 1) {
                    output += '\n';
                }
                
                this.stats.processedFiles++;
                
                if (this.options.verbose) {
                    const lines = content.split('\n').length;
                    const bytes = Buffer.byteLength(content, 'utf-8');
                    console.log(`        ${colors.GREEN}✅ Adicionado (${lines} linhas, ${bytes} bytes)${colors.NC}`);
                }
            } catch (error) {
                console.log(`        ${colors.RED}❌ Erro ao ler arquivo: ${error}${colors.NC}`);
                this.stats.skippedFiles++;
            }
        }

        // Salvar arquivo de saída
        try {
            fs.writeFileSync(outputFile, output, 'utf-8');
            this.stats.outputSize = Buffer.byteLength(output, 'utf-8');
            
            console.log("");
            console.log(`${colors.GREEN}💾 Arquivo salvo: ${outputFile}${colors.NC}`);

            // Upload remoto se especificado
            if (this.options.remote) {
                const remoteInfo = this.parseRemoteDestination(this.options.remote);
                if (remoteInfo) {
                    console.log("");
                    console.log(`${colors.CYAN}🚀 Iniciando upload remoto...${colors.NC}`);
                    
                    // Testar conexão SSH primeiro
                    const connectionOk = await this.testSSHConnection(this.options.remote, this.options.sshKey);
                    
                    if (connectionOk) {
                        const uploadSuccess = await this.uploadWithRetry(outputFile, this.options.remote, this.options.sshKey);
                        
                        if (uploadSuccess) {
                            console.log(`${colors.GREEN}🎉 Upload remoto concluído com sucesso!${colors.NC}`);
                            console.log(`${colors.BLUE}📍 Localização remota: ${this.options.remote}${colors.NC}`);
                        } else {
                            console.log(`${colors.RED}❌ Falha no upload remoto após ${this.options.retryAttempts} tentativas${colors.NC}`);
                            console.log(`${colors.YELLOW}💡 Arquivo local salvo em: ${outputFile}${colors.NC}`);
                        }
                    } else {
                        console.log(`${colors.RED}❌ Não foi possível conectar ao servidor remoto${colors.NC}`);
                        console.log(`${colors.YELLOW}💡 Verifique a conectividade SSH e as credenciais${colors.NC}`);
                        console.log(`${colors.YELLOW}💡 Arquivo local salvo em: ${outputFile}${colors.NC}`);
                    }
                }
            }
        } catch (error) {
            throw new Error(`${colors.RED}❌ Erro ao salvar arquivo: ${error}${colors.NC}`);
        }

        const duration = Date.now() - startTime;
        this.printSummary(outputFile, duration);
    }

    private async generateRichHeader(sourceDir: string, totalFiles: number): Promise<string> {
        const now = new Date();
        const hostname = os.hostname();
        const platform = os.platform();
        const arch = os.arch();
        const release = os.release();
        const userInfo = os.userInfo();
        const shell = process.env.SHELL || 'unknown';
        
        // Detectar distribuição Linux
        let osInfo = `${platform} ${arch}`;
        if (platform === 'linux') {
            try {
                const releaseInfo = fs.readFileSync('/etc/os-release', 'utf-8');
                const prettyName = releaseInfo.match(/PRETTY_NAME="([^"]+)"/);
                if (prettyName) {
                    osInfo = `${platform} ${arch} (${prettyName[1]})`;
                }
            } catch (error) {
                // Fallback para distribuições sem /etc/os-release
                osInfo = `${platform} ${arch}`;
            }
        }

        // Calcular hash do snapshot baseado no conteúdo e timestamp
        const hashInput = `${sourceDir}-${totalFiles}-${now.toISOString()}-${hostname}`;
        const hash = crypto.createHash('sha256').update(hashInput).digest('hex').substring(0, 20);

        // Obter versão do pacote se disponível
        let version = 'unknown';
        try {
            const packagePath = path.join(__dirname, '../../package.json');
            if (fs.existsSync(packagePath)) {
                const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
                version = `v${packageJson.version}`;
            }
        } catch (error) {
            // Versão não disponível
        }

        // Calcular tamanho bruto estimado
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

    private printSummary(outputFile: string, duration: number): void {
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

    private async testSSHConnection(remote: string, sshKey?: string): Promise<boolean> {
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
            
            const ssh = spawn(sshArgs[0], sshArgs.slice(1), { stdio: 'pipe' });
            
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

    private async uploadFileWithSCP(localFile: string, remote: string, sshKey?: string): Promise<boolean> {
        return new Promise((resolve) => {
            const scpArgs = ['scp', '-o', 'ConnectTimeout=30'];
            
            if (sshKey) {
                scpArgs.push('-i', sshKey);
            }
            
            if (this.options.compress) {
                scpArgs.push('-C'); // Compressão
            }
            
            scpArgs.push(localFile, remote);
            
            if (this.options.verbose) {
                console.log(`${colors.CYAN}📤 Enviando: ${localFile} → ${remote}${colors.NC}`);
                console.log(`${colors.YELLOW}🔧 Comando: ${scpArgs.join(' ')}${colors.NC}`);
            }
            
            const scp = spawn(scpArgs[0], scpArgs.slice(1), { stdio: 'pipe' });
            
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

    private async uploadWithRetry(localFile: string, remote: string, sshKey?: string): Promise<boolean> {
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
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Backoff exponencial
                if (this.options.verbose) {
                    console.log(`${colors.YELLOW}⏳ Aguardando ${delay}ms antes da próxima tentativa...${colors.NC}`);
                }
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        return false;
    }

    private parseRemoteDestination(remote: string): { userHost: string; path: string } | null {
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

    // ...existing code...
}

// Função principal
async function main(): Promise<void> {
    const args = process.argv.slice(2);
    
    const options: GenerateOptions = {
        excludePatterns: [],
        includePatterns: [],
        maxSizeKB: 1000,
        verbose: false,
        compress: false,
        retryAttempts: 3
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
                } else {
                    console.error(`❌ Padrão de exclusão necessário após ${arg}`);
                    process.exit(1);
                }
                break;
            case '-i':
            case '--include':
                if (i + 1 < args.length) {
                    options.includePatterns.push(args[++i]);
                } else {
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
                } else {
                    console.error(`❌ Tamanho máximo necessário após ${arg}`);
                    process.exit(1);
                }
                break;
            case '-r':
            case '--remote':
                if (i + 1 < args.length) {
                    options.remote = args[++i];
                } else {
                    console.error(`❌ Destino remoto necessário após ${arg}`);
                    process.exit(1);
                }
                break;
            case '-k':
            case '--ssh-key':
                if (i + 1 < args.length) {
                    options.sshKey = args[++i];
                } else {
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
                } else {
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
                break;
            default:
                if (arg.startsWith('-')) {
                    console.error(`❌ Opção desconhecida: ${arg}`);
                    console.error("Use --help para ajuda");
                    process.exit(1);
                } else {
                    if (sourceDir === '.') {
                        sourceDir = arg;
                    } else if (outputFile === 'lookatni-code.txt') {
                        outputFile = arg;
                    } else {
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
    } catch (error) {
        console.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main().catch(console.error);
}

export { LookAtniGenerator, GenerateOptions, GenerateStats };
