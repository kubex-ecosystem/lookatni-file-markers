// Package vscode defines types for VS Code integration.
package vscode

import "github.com/kubex-ecosystem/lookatni-file-markers/internal/module/kbx"

// ExtractRequest represents a file extraction request.
type ExtractRequest struct {
	MarkedFile string             `json:"markedFile"`
	OutputDir  string             `json:"outputDir"`
	Options    kbx.ExtractOptions `json:"options"`
}

// ValidateRequest represents a marker validation request.
type ValidateRequest struct {
	MarkedFile string `json:"markedFile"`
	Strict     bool   `json:"strict"`
}

// TranspileRequest represents a Markdown transpilation request.
type TranspileRequest struct {
	Input     string `json:"input"`
	OutputDir string `json:"outputDir"`
}

// GenerateRequest represents a directory consolidation request.
type GenerateRequest struct {
	SourceDir       string   `json:"sourceDir"`
	OutputFile      string   `json:"outputFile"`
	ExcludePatterns []string `json:"excludePatterns"`
}
