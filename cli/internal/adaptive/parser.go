// Package adaptive provides adaptive parsing capabilities for various marker formats.
package adaptive

import (
    "bufio"
	"fmt"
	"regexp"
    "os"
    "path/filepath"
    "strings"

	"github.com/kubex-ecosystem/lookatni-file-markers/internal/metadata"
	"github.com/kubex-ecosystem/lookatni-file-markers/internal/parser"
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
func (ap *AdaptiveParser) ValidateMarkers(markedFile string, strict bool) (*parser.ValidationResults, error) {
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

// CustomParser handles parsing with a specific marker configuration.
type CustomParser struct {
	config      metadata.MarkerConfig
	markerRegex *regexp.Regexp
}

// ParseContent parses content using the custom marker format.
func (cp *CustomParser) ParseContent(content []byte) (*parser.ParseResults, error) {
	results := &parser.ParseResults{Errors: []parser.ParseError{}, Markers: []parser.ParsedMarker{}}
	lines := strings.Split(string(content), "\n")

	var current *parser.ParsedMarker
	var buf strings.Builder

	for i, line := range lines {
		lineNo := i + 1
		if cp.markerRegex.MatchString(line) {
			// finalize previous
			if current != nil {
				current.Content = strings.TrimRight(buf.String(), "\n")
				current.EndLine = lineNo - 1
				results.Markers = append(results.Markers, *current)
				results.TotalFiles++
				results.TotalBytes += int64(len(current.Content))
			}
			m := cp.markerRegex.FindStringSubmatch(line)
			filename := strings.TrimSpace(m[1])
			if filename == "" {
				results.Errors = append(results.Errors, parser.ParseError{Line: lineNo, Message: "Empty filename in marker", Severity: "error"})
				current = nil
				buf.Reset()
				continue
			}
			current = &parser.ParsedMarker{Filename: filename, StartLine: lineNo}
			buf.Reset()
		} else if current != nil {
			if buf.Len() > 0 { buf.WriteByte('\n') }
			buf.WriteString(line)
		}
	}

	if current != nil {
		current.Content = strings.TrimRight(buf.String(), "\n")
		current.EndLine = len(lines)
		results.Markers = append(results.Markers, *current)
		results.TotalFiles++
		results.TotalBytes += int64(len(current.Content))
	}

	results.TotalMarkers = results.TotalFiles
	return results, nil
}

// ExtractFiles extracts files using the custom marker format.
func (cp *CustomParser) ExtractFiles(markedFile, outputDir string, options parser.ExtractOptions) (*parser.ExtractResults, error) {
	data, err := os.ReadFile(markedFile)
	if err != nil { return nil, fmt.Errorf("failed to read %s: %w", markedFile, err) }
	res, err := cp.ParseContent(data)
	if err != nil { return nil, err }
	out := &parser.ExtractResults{Success: true, ExtractedFiles: []string{}, Errors: []string{}}
	for _, m := range res.Markers {
		p := filepath.Join(outputDir, m.Filename)
		if options.DryRun {
			out.ExtractedFiles = append(out.ExtractedFiles, p)
			continue
		}
		dir := filepath.Dir(p)
		if options.CreateDirs { _ = os.MkdirAll(dir, 0o755) }
		if err := os.WriteFile(p, []byte(m.Content), 0o644); err != nil {
			out.Errors = append(out.Errors, fmt.Sprintf("Failed to write %s: %v", p, err))
			out.Success = false
			continue
		}
		out.ExtractedFiles = append(out.ExtractedFiles, p)
	}
	return out, nil
}

// ValidateMarkers validates using the custom marker format.
func (cp *CustomParser) ValidateMarkers(markedFile string, strict bool) (*parser.ValidationResults, error) {
    data, err := os.ReadFile(markedFile)
    if err != nil { return nil, fmt.Errorf("failed to read %s: %w", markedFile, err) }
    res, err := cp.ParseContent(data)
    if err != nil { return nil, err }

    v := &parser.ValidationResults{
        IsValid:            true,
        Errors:             []parser.ValidationError{},
        DuplicateFilenames: []string{},
        InvalidFilenames:   []string{},
        Statistics:         parser.ValidationStatistics{TotalMarkers: res.TotalMarkers, EmptyMarkers: 0},
    }

    // Strict check: malformed marker-like lines
    if strict {
        scanner := bufio.NewScanner(strings.NewReader(string(data)))
        lineNo := 0
        for scanner.Scan() {
            lineNo++
            line := scanner.Text()
            looksLike := strings.Contains(line, cp.config.Start) || strings.Contains(line, cp.config.End)
            if looksLike && !cp.markerRegex.MatchString(line) {
                v.Errors = append(v.Errors, parser.ValidationError{Line: lineNo, Message: "Malformed marker line (strict mode)", Severity: "error"})
            }
        }
    }

    // Duplicate/empty/invalid filename checks
    seen := map[string]int{}
    for _, m := range res.Markers {
        seen[m.Filename]++
        if strings.TrimSpace(m.Content) == "" { v.Statistics.EmptyMarkers++ }
        if !isValidFilename(m.Filename) {
            v.InvalidFilenames = append(v.InvalidFilenames, m.Filename)
            v.Errors = append(v.Errors, parser.ValidationError{Line: m.StartLine, Message: "Invalid filename", Severity: "error"})
        }
    }
    for name, count := range seen {
        if count > 1 { v.DuplicateFilenames = append(v.DuplicateFilenames, name) }
    }

    if res.TotalMarkers == 0 || len(v.InvalidFilenames) > 0 { v.IsValid = false }
    return v, nil
}

// CustomGenerator handles generation with a specific marker configuration.
type CustomGenerator struct {
	config metadata.MarkerConfig
}

// GenerateFromDirectory generates a marked file with custom markers and frontmatter.
func (cg *CustomGenerator) GenerateFromDirectory(sourceDir, outputFile string, excludePatterns []string, markerConfig *metadata.MarkerConfig) (*parser.GenerateResults, error) {
	// Build frontmatter
    fm, err := metadata.GenerateFrontmatter(*markerConfig)
    if err != nil { return nil, fmt.Errorf("frontmatter: %w", err) }

    // Collect files
    files := []string{}
    err = filepath.Walk(sourceDir, func(p string, info os.FileInfo, err error) error {
        if err != nil { return nil }
        if info.IsDir() { return nil }
        rel, err := filepath.Rel(sourceDir, p)
        if err != nil { return nil }
        for _, ex := range excludePatterns {
            if strings.Contains(rel, ex) { return nil }
        }
        files = append(files, rel)
        return nil
    })
    if err != nil { return nil, err }

    f, err := os.Create(outputFile)
    if err != nil { return nil, fmt.Errorf("create: %w", err) }
    defer f.Close()

    res := &parser.GenerateResults{Success: true, Errors: []string{}}
    if _, err := f.Write(fm); err != nil { return nil, fmt.Errorf("write fm: %w", err) }
    res.TotalBytes += int64(len(fm))

    // Write markers + content
    for _, rel := range files {
        marker := markerConfig.FormatMarker(rel) + "\n"
        if _, err := f.WriteString(marker); err != nil { res.Errors = append(res.Errors, fmt.Sprintf("marker %s: %v", rel, err)); continue }
        data, err := os.ReadFile(filepath.Join(sourceDir, rel))
        if err != nil { res.Errors = append(res.Errors, fmt.Sprintf("read %s: %v", rel, err)); continue }
        if _, err := f.Write(data); err != nil { res.Errors = append(res.Errors, fmt.Sprintf("write %s: %v", rel, err)); continue }
        if len(data) == 0 || data[len(data)-1] != '\n' { _, _ = f.WriteString("\n"); res.TotalBytes++ }
        res.TotalFiles++
        res.TotalBytes += int64(len(marker)) + int64(len(data))
    }

    if len(res.Errors) > 0 { res.Success = false }
    return res, nil
}

// readFileContent reads the entire file content.
func readFileContent(filePath string) ([]byte, error) { return os.ReadFile(filePath) }

func isValidFilename(filename string) bool {
    if filename == "" { return false }
    invalid := []string{"<", ">", ":", "\"", "|", "?", "*"}
    for _, c := range invalid { if strings.Contains(filename, c) { return false } }
    reserved := []string{"CON","PRN","AUX","NUL","COM1","COM2","COM3","COM4","COM5","COM6","COM7","COM8","COM9","LPT1","LPT2","LPT3","LPT4","LPT5","LPT6","LPT7","LPT8","LPT9"}
    u := strings.ToUpper(filename)
    for _, r := range reserved { if u == r || strings.HasPrefix(u, r+".") { return false } }
    return true
}
