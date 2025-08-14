BIN_DIR := dist
BIN := $(BIN_DIR)/md_to_html

.PHONY: build clean run

build:
	@mkdir -p $(BIN_DIR)
	go build -o $(BIN) ./md_to_html.go

run: build
	$(BIN)

clean:
	rm -rf $(BIN_DIR) output

