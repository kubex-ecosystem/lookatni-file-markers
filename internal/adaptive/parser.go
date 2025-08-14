// Package adaptive provides adaptive parsing capabilities for various marker formats.
package adaptive

import (
	"fmt"
	"regexp"

	"github.com/rafa-mori/lookatni-file-markers/internal/metadata"
	"github.com/rafa-mori/lookatni-file-markers/internal/parser"
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
	content, err := readFileContent(filePath)
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
func (ap *AdaptiveParser) ExtractFiles(markedFile, outputDir string, options parser.ExtractOptions) (*parser.ExtractResults, error) {
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
func (ap *AdaptiveParser) ValidateMarkers(markedFile string) (*parser.ValidationResults, error) {
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

	return customParser.ValidateMarkers(markedFile)
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

// CustomParser handles parsing with a specific marker configuration.
type CustomParser struct {
	config      metadata.MarkerConfig
	markerRegex *regexp.Regexp
}

// ParseContent parses content using the custom marker format.
func (cp *CustomParser) ParseContent(content []byte) (*parser.ParseResults, error) {
	// Implementation similar to original parser but with custom regex
	// This is a simplified version - full implementation would mirror parser.ParseMarkedFile
	results := &parser.ParseResults{
		TotalMarkers: 0,
		TotalFiles:   0,
		TotalBytes:   0,
		Errors:       []parser.ParseError{},
		Markers:      []parser.ParsedMarker{},
	}

	// TODO: Implement full parsing logic with custom regex
	return results, nil
}

// ExtractFiles extracts files using the custom marker format.
func (cp *CustomParser) ExtractFiles(markedFile, outputDir string, options parser.ExtractOptions) (*parser.ExtractResults, error) {
	// TODO: Implement extraction with custom markers
	return &parser.ExtractResults{
		Success:        true,
		ExtractedFiles: []string{},
		Errors:         []string{},
	}, nil
}

// ValidateMarkers validates using the custom marker format.
func (cp *CustomParser) ValidateMarkers(markedFile string) (*parser.ValidationResults, error) {
	// TODO: Implement validation with custom markers
	return &parser.ValidationResults{
		IsValid:            true,
		Errors:             []parser.ValidationError{},
		DuplicateFilenames: []string{},
		InvalidFilenames:   []string{},
		Statistics: parser.ValidationStatistics{
			TotalMarkers: 0,
			EmptyMarkers: 0,
		},
	}, nil
}

// CustomGenerator handles generation with a specific marker configuration.
type CustomGenerator struct {
	config metadata.MarkerConfig
}

// GenerateFromDirectory generates a marked file with custom markers and frontmatter.
func (cg *CustomGenerator) GenerateFromDirectory(sourceDir, outputFile string, excludePatterns []string, markerConfig *metadata.MarkerConfig) (*parser.GenerateResults, error) {
	// TODO: Implement generation with custom markers and frontmatter injection
	return &parser.GenerateResults{
		Success:    true,
		TotalFiles: 0,
		TotalBytes: 0,
		Errors:     []string{},
	}, nil
}

// readFileContent reads the entire file content.
func readFileContent(filePath string) ([]byte, error) {
	// TODO: Implement file reading
	return nil, fmt.Errorf("not implemented")
}
