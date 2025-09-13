# 🚀 LookAtni CLI - Makefile
# Seguindo filosofia Kubex: "Um comando = um resultado"

.PHONY: build clean install test help

# Variáveis
BINARY_NAME=lookatni
BUILD_DIR=bin
VERSION=$(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")
LDFLAGS=-ldflags "-X main.version=$(VERSION)"

# Comando padrão
help: ## Mostra esta ajuda
	@echo "🚀 LookAtni CLI - Build System"
	@echo "=============================="
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Compila o CLI Go
	@echo "🔨 Compilando LookAtni CLI..."
	@mkdir -p $(BUILD_DIR)
	go build $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME) ./cmd/main.go
	@echo "✅ Build completo: $(BUILD_DIR)/$(BINARY_NAME)"

clean: ## Remove arquivos de build
	@echo "🧹 Limpando arquivos de build..."
	rm -rf $(BUILD_DIR)
	@echo "✅ Limpeza completa!"

install: build ## Instala o CLI globalmente
	@echo "📦 Instalando LookAtni CLI globalmente..."
	sudo cp $(BUILD_DIR)/$(BINARY_NAME) /usr/local/bin/
	@echo "✅ Instalado em /usr/local/bin/$(BINARY_NAME)"
	@echo "💡 Use: lookatni --help"

test: build ## Testa o CLI
	@echo "🧪 Testando LookAtni CLI..."
	./$(BUILD_DIR)/$(BINARY_NAME) version
	./$(BUILD_DIR)/$(BINARY_NAME) --help
	@echo "✅ Testes básicos OK!"

dev: ## Build e teste rápido para desenvolvimento
	@echo "⚡ Build desenvolvimento..."
	go build $(LDFLAGS) -o $(BINARY_NAME) ./cmd/main.go
	./$(BINARY_NAME) version
	@echo "✅ Dev build OK!"

# Build cross-platform
build-all: ## Compila para múltiplas plataformas
	@echo "🌍 Compilando para múltiplas plataformas..."
	@mkdir -p $(BUILD_DIR)
	GOOS=linux GOARCH=amd64 go build $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-linux-amd64 ./cmd/main.go
	GOOS=darwin GOARCH=amd64 go build $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-darwin-amd64 ./cmd/main.go
	GOOS=windows GOARCH=amd64 go build $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-windows-amd64.exe ./cmd/main.go
	@echo "✅ Build cross-platform completo!"
	@ls -la $(BUILD_DIR)/

.DEFAULT_GOAL := help
