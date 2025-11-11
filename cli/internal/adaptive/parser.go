// Package adaptive provides adaptive parsing capabilities for various marker formats.
package adaptive

import (
	"fmt"

	"github.com/kubex-ecosystem/lookatni-file-markers/internal/metadata"
	"github.com/kubex-ecosystem/lookatni-file-markers/internal/module/kbx"
	"github.com/kubex-ecosystem/lookatni-file-markers/internal/parser"
	"github.com/kubex-ecosystem/lookatni-file-markers/internal/utils"
)

// AdaptiveParser handles multiple marker formats based on metadata.
type AdaptiveParser struct {
	defaultParser *parser.MarkerParser
}

// New creates a new adaptive parser.
func New() *AdaptiveParser {
	return &AdaptiveParser{
		defaultParser: parser.New(),
	}
}

// ParseMarkedFile intelligently parses a file with adaptive marker detection.
func (ap *AdaptiveParser) ParseMarkedFile(filePath string) (*parser.ParseResults, *metadata.MarkerConfig, error) {
	// First, try to read the file and detect frontmatter
	content, err := utils.ReadFileContent(filePath)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to read file: %w", err)
	}

	// Parse frontmatter to detect custom marker configuration
	meta, remainingContent, err := metadata.ParseFrontmatter(content)
	if err != nil {
		return nil, nil, fmt.Errorf("frontmatter parsing failed: %w", err)
	}

	var markerConfig metadata.MarkerConfig
	if meta != nil {
		markerConfig = meta.LookAtni
	} else {
		markerConfig = metadata.GetDefaultConfig()
	}

	// Create a custom parser for this specific marker format
	customParser, err := ap.createCustomParser(markerConfig)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create custom parser: %w", err)
	}

	// Parse the remaining content (after frontmatter) using the custom parser
	results, err := customParser.ParseContent(remainingContent)
	if err != nil {
		return nil, nil, fmt.Errorf("content parsing failed: %w", err)
	}

	return results, &markerConfig, nil
}

// ExtractFiles extracts files using adaptive marker detection.
func (ap *AdaptiveParser) ExtractFiles(markedFile, outputDir string, options kbx.ExtractOptions) (*parser.ExtractResults, error) {
	// Parse the file with adaptive detection
	_, markerConfig, err := ap.ParseMarkedFile(markedFile)
	if err != nil {
		return nil, fmt.Errorf("adaptive parsing failed: %w", err)
	}

	// Create custom parser and extract
	customParser, err := ap.createCustomParser(*markerConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create custom parser: %w", err)
	}

	return customParser.ExtractFiles(markedFile, outputDir, options)
}

// ValidateMarkers validates markers using adaptive detection.
func (ap *AdaptiveParser) ValidateMarkers(markedFile string, strict bool) (*utils.ValidationResults, error) {
	// Parse the file with adaptive detection
	_, markerConfig, err := ap.ParseMarkedFile(markedFile)
	if err != nil {
		return nil, fmt.Errorf("adaptive parsing failed: %w", err)
	}

	// Create custom parser and validate
	customParser, err := ap.createCustomParser(*markerConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create custom parser: %w", err)
	}

	return customParser.ValidateMarkers(markedFile, strict)
}

// GenerateFromDirectory creates a marked file with custom marker configuration.
func (ap *AdaptiveParser) GenerateFromDirectory(sourceDir, outputFile string, excludePatterns []string, markerConfig *metadata.MarkerConfig) (*parser.GenerateResults, error) {
	// Use default config if none provided
	if markerConfig == nil {
		defaultConfig := metadata.GetDefaultConfig()
		markerConfig = &defaultConfig
	}

	// Create custom generator
	generator, err := ap.createCustomGenerator(*markerConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create custom generator: %w", err)
	}

	return generator.GenerateFromDirectory(sourceDir, outputFile, excludePatterns, markerConfig)
}

// createCustomParser creates a parser for a specific marker configuration.
func (ap *AdaptiveParser) createCustomParser(config metadata.MarkerConfig) (*CustomParser, error) {
	markerRegex, err := config.GenerateRegex()
	if err != nil {
		return nil, fmt.Errorf("failed to generate regex from config: %w", err)
	}

	return &CustomParser{
		config:      config,
		markerRegex: markerRegex,
	}, nil
}

// createCustomGenerator creates a generator for a specific marker configuration.
func (ap *AdaptiveParser) createCustomGenerator(config metadata.MarkerConfig) (*CustomGenerator, error) {
	return &CustomGenerator{
		config: config,
	}, nil
}
