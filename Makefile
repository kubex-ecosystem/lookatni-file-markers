BIN_DIR := dist
BIN := $(BIN_DIR)/lookatni
MD_BIN := $(BIN_DIR)/md_to_html

.PHONY: build clean run test transpile help install

# Build the main Go application
build:
	@mkdir -p $(BIN_DIR)
	@echo "🔨 Building LookAtni File Markers..."
	go build -o $(BIN) ./cmd/main.go
	@echo "✅ Built $(BIN)"

# Build legacy md_to_html for compatibility
build-legacy:
	@mkdir -p $(BIN_DIR)
	@echo "🔨 Building legacy md_to_html..."
	go build -o $(MD_BIN) ./md_to_html.go
	@echo "✅ Built $(MD_BIN)"

# Run the transpiler (legacy compatibility)
run: build-legacy
	$(MD_BIN)

# Run the new CLI application
cli: build
	$(BIN) help

# Run transpilation with new CLI
transpile: build
	@echo "🔄 Running transpilation..."
	$(BIN) transpile ./tests ./output/interviews

# Run VS Code integration server
vscode: build
	@echo "🔌 Starting VS Code integration server..."
	$(BIN) --vscode --port 8080

# Extract files example
extract: build
	@echo "📤 Example: Extract files..."
	$(BIN) extract ./tests/example_marked.md ./output/extracted --overwrite --create-dirs

# Validate markers example
validate: build
	@echo "🔍 Example: Validate markers..."
	$(BIN) validate ./tests/example_marked.md

# Run tests
test:
	@echo "🧪 Running tests..."
	go test ./...

# Install binary globally
install: build
	@echo "📦 Installing $(BIN) to /usr/local/bin/lookatni"
	sudo cp $(BIN) /usr/local/bin/lookatni
	@echo "✅ Installed! Run 'lookatni help' to get started"

# Clean build artifacts
clean:
	@echo "🧹 Cleaning up..."
	rm -rf $(BIN_DIR) output

# Show help
help:
	@echo "LookAtni File Markers - Makefile Commands"
	@echo ""
	@echo "Building:"
	@echo "  build        Build the main Go application"
	@echo "  build-legacy Build legacy md_to_html"
	@echo ""
	@echo "Running:"
	@echo "  run          Run legacy transpiler (backward compatibility)"
	@echo "  cli          Show CLI help"
	@echo "  transpile    Run Markdown transpilation"
	@echo "  vscode       Start VS Code integration server"
	@echo ""
	@echo "Examples:"
	@echo "  extract      Example file extraction"
	@echo "  validate     Example marker validation"
	@echo ""
	@echo "Maintenance:"
	@echo "  test         Run tests"
	@echo "  install      Install binary globally"
	@echo "  clean        Clean build artifacts"
	@echo "  help         Show this help"

