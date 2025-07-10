#!/bin/bash

# Script para gerar marcadores únicos a partir de arquivos existentes
# Complemento do extract-files.sh - LookAtni v3.0
# Uso: ./generate-markers.sh [diretorio] [arquivo_saida]

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_help() {
    echo -e "${CYAN}🔧 LookAtni Marker Generator v3.0${NC}"
    echo "================================================"
    echo "Gera arquivo com marcadores únicos a partir de estrutura existente"
    echo ""
    echo "Uso: $0 [diretorio] [arquivo_saida] [opcoes]"
    echo ""
    echo "Parâmetros:"
    echo "  diretorio      : Diretório para escanear (padrão: .)"
    echo "  arquivo_saida  : Arquivo de saída (padrão: lookatni-code.txt)"
    echo ""
    echo "Opções:"
    echo "  -e, --exclude PATTERN : Excluir arquivos/diretórios (pode usar múltiplas vezes)"
    echo "  -i, --include PATTERN : Incluir apenas arquivos que correspondem ao padrão"
    echo "  -m, --max-size SIZE   : Tamanho máximo do arquivo em KB (padrão: 1000)"
    echo "  -h, --help           : Esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 ./src projeto.txt"
    echo "  $0 . codigo.txt --exclude node_modules --exclude .git"
    echo "  $0 ./meu-projeto saida.txt --include '*.js' --include '*.ts'"
    echo ""
    echo "💡 O arquivo gerado pode ser usado com:"
    echo "  ./extract-files.sh codigo.txt ./novo-projeto"
}

# Variáveis padrão
SOURCE_DIR="."
OUTPUT_FILE="lookatni-code.txt"
EXCLUDE_PATTERNS=()
INCLUDE_PATTERNS=()
MAX_SIZE=1000  # KB

# Processar argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--exclude)
            EXCLUDE_PATTERNS+=("$2")
            shift 2
            ;;
        -i|--include)
            INCLUDE_PATTERNS+=("$2")
            shift 2
            ;;
        -m|--max-size)
            MAX_SIZE="$2"
            shift 2
            ;;
        -h|--help)
            print_help
            exit 0
            ;;
        -*)
            echo -e "${RED}❌ Opção desconhecida: $1${NC}"
            echo "Use --help para ajuda"
            exit 1
            ;;
        *)
            if [ -z "$SOURCE_DIR_SET" ]; then
                SOURCE_DIR="$1"
                SOURCE_DIR_SET=true
            elif [ -z "$OUTPUT_FILE_SET" ]; then
                OUTPUT_FILE="$1"
                OUTPUT_FILE_SET=true
            else
                echo -e "${RED}❌ Muitos argumentos!${NC}"
                exit 1
            fi
            shift
            ;;
    esac
done

# Função para verificar se deve incluir arquivo
should_include_file() {
    local file="$1"
    local filename
    filename=$(basename "$file")
    
    # Verificar exclusões
    for pattern in "${EXCLUDE_PATTERNS[@]}"; do
        if [[ "$file" == *"$pattern"* ]]; then
            return 1
        fi
    done
    
    # Verificar inclusões (se especificadas)
    if [ ${#INCLUDE_PATTERNS[@]} -gt 0 ]; then
        local include_match=false
        for pattern in "${INCLUDE_PATTERNS[@]}"; do
            if [[ "$filename" == "$pattern" ]]; then
                include_match=true
                break
            fi
        done
        if [ "$include_match" = false ]; then
            return 1
        fi
    fi
    
    return 0
}

# Função para verificar se é arquivo de código
is_code_file() {
    local file="$1"
    local ext="${file##*.}"
    
    # Extensões de código mais comuns
    case "$ext" in
        # Web
        js|ts|jsx|tsx|html|css|scss|sass|less|vue|svelte|json|yaml|yml|xml)
            return 0
            ;;
        # Backend
        py|java|cpp|c|h|cs|php|rb|go|rs|swift|kt|sql)
            return 0
            ;;
        # Shell/Config
        sh|bash|zsh|fish|ps1|bat|cmd|conf|config|ini|properties|env|toml)
            return 0
            ;;
        # Outros
        r|R|scala|clj|hs|elm|dart|lua|perl|pl|pm|tcl|dockerfile|makefile)
            return 0
            ;;
        *)
            # Arquivos sem extensão específicos
            local basename_file
            basename_file=$(basename "$file")
            case "$basename_file" in
                Dockerfile|Makefile|Rakefile|Gemfile|Podfile|Fastfile|Brewfile|Vagrantfile|Berksfile|Capfile|Guardfile|Procfile)
                    return 0
                    ;;
                *)
                    return 1
                    ;;
            esac
            ;;
    esac
}

echo -e "${CYAN}🔧 LookAtni Marker Generator v3.0${NC}"
echo "================================================"

# Verificar se diretório existe
if [ ! -d "$SOURCE_DIR" ]; then
    echo -e "${RED}❌ Erro: Diretório '$SOURCE_DIR' não encontrado!${NC}"
    exit 1
fi

echo -e "${BLUE}📁 Diretório fonte: $SOURCE_DIR${NC}"
echo -e "${BLUE}📄 Arquivo de saída: $OUTPUT_FILE${NC}"
echo -e "${BLUE}📏 Tamanho máximo por arquivo: ${MAX_SIZE}KB${NC}"

if [ ${#EXCLUDE_PATTERNS[@]} -gt 0 ]; then
    echo -e "${YELLOW}🚫 Padrões de exclusão: ${EXCLUDE_PATTERNS[*]}${NC}"
fi

if [ ${#INCLUDE_PATTERNS[@]} -gt 0 ]; then
    echo -e "${GREEN}✅ Padrões de inclusão: ${INCLUDE_PATTERNS[*]}${NC}"
fi

echo ""

# Encontrar arquivos
echo -e "${PURPLE}🔍 Escaneando arquivos...${NC}"

# Padrões de exclusão padrão
DEFAULT_EXCLUDES=(
    "node_modules"
    ".git"
    ".svn"
    ".hg"
    ".DS_Store"
    "Thumbs.db"
    "*.tmp"
    "*.temp"
    "*.log"
    "*.cache"
    "*.pid"
    "*.lock"
    "*.swp"
    "*.swo"
    "*~"
    ".idea"
    ".vscode"
    ".vs"
    "__pycache__"
    "*.pyc"
    "*.pyo"
    "*.pyd"
    ".pytest_cache"
    ".mypy_cache"
    ".tox"
    ".coverage"
    ".nyc_output"
    "coverage"
    "build"
    "dist"
    "out"
    "target"
    "bin"
    "obj"
    "*.class"
    "*.o"
    "*.so"
    "*.dylib"
    "*.dll"
    "*.exe"
    "*.app"
    "*.dmg"
    "*.pkg"
    "*.deb"
    "*.rpm"
    "*.tar"
    "*.zip"
    "*.rar"
    "*.7z"
    "*.gz"
    "*.bz2"
    "*.xz"
    "*.iso"
    "*.img"
    "*.jpg"
    "*.jpeg"
    "*.png"
    "*.gif"
    "*.bmp"
    "*.tiff"
    "*.svg"
    "*.ico"
    "*.webp"
    "*.mp3"
    "*.mp4"
    "*.avi"
    "*.mov"
    "*.wmv"
    "*.flv"
    "*.mkv"
    "*.webm"
    "*.wav"
    "*.flac"
    "*.ogg"
    "*.aac"
    "*.m4a"
    "*.pdf"
    "*.doc"
    "*.docx"
    "*.xls"
    "*.xlsx"
    "*.ppt"
    "*.pptx"
    "*.odt"
    "*.ods"
    "*.odp"
    "*.rtf"
    "*.epub"
    "*.mobi"
    "*.azw"
    "*.azw3"
    "*.kf8"
    "*.kfx"
    "*.fb2"
    "*.lit"
    "*.lrf"
    "*.pdb"
    "*.pml"
    "*.rb"
    "*.snb"
    "*.tcr"
    "*.txt"
    "*.md"
    "*.rst"
    "*.adoc"
    "*.org"
    "*.tex"
    "*.bib"
    "*.aux"
    "*.bbl"
    "*.blg"
    "*.fdb_latexmk"
    "*.fls"
    "*.synctex.gz"
    "*.toc"
    "*.lof"
    "*.lot"
    "*.out"
    "*.bcf"
    "*.run.xml"
    "*.figsize"
    "*.fignumber"
    "*.figformat"
    "*.figdpi"
    "*.figfacecolor"
    "*.figedgecolor"
    "*.figlinewidth"
    "*.figalpha"
    "*.figframeon"
    "*.figtight_layout"
    "*.figbbox_inches"
    "*.figpad_inches"
    "*.figformat"
    "*.figdpi"
    "*.figfacecolor"
    "*.figedgecolor"
    "*.figlinewidth"
    "*.figalpha"
    "*.figframeon"
    "*.figtight_layout"
    "*.figbbox_inches"
    "*.figpad_inches"
)

# Combinar exclusões padrão com as do usuário
ALL_EXCLUDES=("${DEFAULT_EXCLUDES[@]}" "${EXCLUDE_PATTERNS[@]}")

# Encontrar arquivos de código
arquivos_encontrados=()
total_arquivos=0
total_bytes=0

while IFS= read -r -d '' file; do
    # Verificar se deve incluir
    if should_include_file "$file"; then
        # Verificar se é arquivo de código
        if is_code_file "$file"; then
            # Verificar tamanho
            size_kb=$(( $(stat -c%s "$file") / 1024 ))
            if [ "$size_kb" -le "$MAX_SIZE" ]; then
                arquivos_encontrados+=("$file")
                ((total_arquivos++))
                ((total_bytes += $(stat -c%s "$file")))
            else
                echo -e "${YELLOW}⚠️  Arquivo muito grande ignorado: $file (${size_kb}KB)${NC}"
            fi
        fi
    fi
done < <(find "$SOURCE_DIR" -type f -print0)

echo -e "${GREEN}✅ Encontrados $total_arquivos arquivos (${total_bytes} bytes)${NC}"
echo ""

# Gerar arquivo com marcadores
echo -e "${CYAN}🚀 Gerando arquivo com marcadores...${NC}"

# Backup se arquivo já existe
if [ -f "$OUTPUT_FILE" ]; then
    backup_file="${OUTPUT_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    mv "$OUTPUT_FILE" "$backup_file"
    echo -e "${YELLOW}💾 Backup criado: $backup_file${NC}"
fi

# Criar arquivo de saída
{
    echo "# LookAtni Generated Code v3.0"
    echo "# Generated on: $(date)"
    echo "# Source directory: $SOURCE_DIR"
    echo "# Total files: $total_arquivos"
    echo "# Total size: $total_bytes bytes"
    echo "#"
    echo "# Usage: ./extract-files.sh $(basename "$OUTPUT_FILE") ./extracted"
    echo "# Format: //m/ file/path /m//"
    echo ""
} > "$OUTPUT_FILE"

# Adicionar cada arquivo com marcadores
for file in "${arquivos_encontrados[@]}"; do
    # Calcular caminho relativo
    rel_path=$(realpath --relative-to="$SOURCE_DIR" "$file")
    
    echo "//m/ $rel_path /m//" >> "$OUTPUT_FILE"
    cat "$file" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
done

echo -e "${GREEN}✅ Arquivo gerado: $OUTPUT_FILE${NC}"
echo ""

# Estatísticas finais
output_size=$(stat -c%s "$OUTPUT_FILE")
echo -e "${PURPLE}📊 Estatísticas:${NC}"
echo "  • Arquivos processados: $total_arquivos"
echo "  • Tamanho total original: $total_bytes bytes"
echo "  • Tamanho arquivo gerado: $output_size bytes"
echo "  • Compressão: $(( (output_size - total_bytes) * 100 / total_bytes ))% (overhead dos marcadores)"
echo ""

echo -e "${CYAN}🚀 Próximos passos:${NC}"
echo -e "  ${YELLOW}# Extrair arquivos:${NC}"
echo -e "  ./extract-files.sh $(basename "$OUTPUT_FILE") ./novo-projeto"
echo -e "  ${YELLOW}# Visualizar marcadores:${NC}"
echo -e "  grep '^//m/' $(basename "$OUTPUT_FILE")"
echo -e "  ${YELLOW}# Testar extração:${NC}"
echo -e "  ./extract-files.sh $(basename "$OUTPUT_FILE") ./test --dry-run --stats"
echo ""

echo -e "${GREEN}🎉 Geração concluída com sucesso!${NC}"
