// Package parser provides marker parsing functionality for LookAtni File Markers.
package parser

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

// ParsedMarker represents a single file marker found in source.
type ParsedMarker struct {
	Filename  string `json:"filename"`
	Content   string `json:"content"`
	StartLine int    `json:"startLine"`
	EndLine   int    `json:"endLine"`
	Size      int64  `json:"size"`
}

// ParseResults contains the results of parsing a marked file.
type ParseResults struct {
	TotalMarkers int            `json:"totalMarkers"`
	TotalFiles   int            `json:"totalFiles"`
	TotalBytes   int64          `json:"totalBytes"`
	Errors       []ParseError   `json:"errors"`
	Markers      []ParsedMarker `json:"markers"`
}

// ParseError represents an error found during parsing.
type ParseError struct {
	Line     int    `json:"line"`
	Message  string `json:"message"`
	Severity string `json:"severity"` // "error", "warning"
}

// ExtractOptions defines options for file extraction.
type ExtractOptions struct {
	Overwrite  bool `json:"overwrite"`
	CreateDirs bool `json:"createDirs"`
	DryRun     bool `json:"dryRun"`
}

// ExtractResults contains the results of file extraction.
type ExtractResults struct {
	Success        bool     `json:"success"`
	ExtractedFiles []string `json:"extractedFiles"`
	Errors         []string `json:"errors"`
}

// MarkerParser handles parsing and extraction of file markers.
type MarkerParser struct {
	// ASCII 28 (File Separator) character for invisible markers
	fsChar      string
	markerRegex *regexp.Regexp
}

// New creates a new MarkerParser instance.
func New() *MarkerParser {
	fsChar := string(rune(28)) // default FS = ASCII 28
	pattern := fmt.Sprintf(`^\/\/%s\/ (.+?) \/%s\/\/$`, regexp.QuoteMeta(fsChar), regexp.QuoteMeta(fsChar))
	markerRegex := regexp.MustCompile(pattern)
	return &MarkerParser{fsChar: fsChar, markerRegex: markerRegex}
}

// ParseMarkedFile parses a file containing LookAtni markers.
func (mp *MarkerParser) ParseMarkedFile(filePath string) (*ParseResults, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open file %s: %w", filePath, err)
	}
	defer file.Close()

	return mp.ParseMarkedReader(file, filePath)
}

// ParseMarkedReader parses markers from a reader.
func (mp *MarkerParser) ParseMarkedReader(reader io.Reader, sourceName string) (*ParseResults, error) {
	results := &ParseResults{Errors: make([]ParseError, 0), Markers: make([]ParsedMarker, 0)}

	// Read all lines first to allow FS detection
	var lines []string
	bufScanner := bufio.NewScanner(reader)
	for bufScanner.Scan() {
		lines = append(lines, bufScanner.Text())
	}
	if err := bufScanner.Err(); err != nil {
		return nil, fmt.Errorf("error reading %s: %w", sourceName, err)
	}

	// Detect FS char dynamically using backreference
	generic := regexp.MustCompile(`^//([\x00-\x1F])/ (.+?) /1//$`)
	detected := ""
	for _, line := range lines {
		if m := generic.FindStringSubmatch(line); m != nil {
			detected = m[1]
			break
		}
	}
	if detected != "" {
		mp.fsChar = detected
		mp.markerRegex = regexp.MustCompile(fmt.Sprintf(`^\/\/%s\/ (.+?) \/%s\/\/$`, regexp.QuoteMeta(detected), regexp.QuoteMeta(detected)))
	}

	lineNumber := 0
	var currentMarker *ParsedMarker
	var currentContent strings.Builder

	for _, line := range lines {
		lineNumber++
		if match := mp.markerRegex.FindStringSubmatch(line); match != nil {
			if currentMarker != nil {
				mp.finalizeMarker(currentMarker, &currentContent, results, lineNumber-1)
			}
			filename := strings.TrimSpace(match[1])
			if filename == "" {
				results.Errors = append(results.Errors, ParseError{Line: lineNumber, Message: "Empty filename in marker", Severity: "error"})
				currentMarker = nil
				currentContent.Reset()
				continue
			}
			currentMarker = &ParsedMarker{Filename: filename, StartLine: lineNumber}
			currentContent.Reset()
			results.TotalMarkers++
		} else if currentMarker != nil {
			if currentContent.Len() > 0 {
				currentContent.WriteByte('\n')
			}
			currentContent.WriteString(line)
		}
	}

	if currentMarker != nil {
		mp.finalizeMarker(currentMarker, &currentContent, results, lineNumber)
	}

	return results, nil
}

// finalizeMarker completes a marker and adds it to results.
func (mp *MarkerParser) finalizeMarker(marker *ParsedMarker, content *strings.Builder, results *ParseResults, endLine int) {
	// Remove trailing empty lines
	finalContent := strings.TrimRight(content.String(), "\n")

	marker.Content = finalContent
	marker.EndLine = endLine
	marker.Size = int64(len(finalContent))

	results.Markers = append(results.Markers, *marker)
	results.TotalFiles++
	results.TotalBytes += marker.Size
}

// ExtractFiles extracts all markers to files in the specified directory.
func (mp *MarkerParser) ExtractFiles(markedFilePath, outputDir string, options ExtractOptions) (*ExtractResults, error) {
	result := &ExtractResults{
		Success:        true,
		ExtractedFiles: make([]string, 0),
		Errors:         make([]string, 0),
	}

	parseResults, err := mp.ParseMarkedFile(markedFilePath)
	if err != nil {
		return nil, fmt.Errorf("failed to parse marked file: %w", err)
	}

	// Add parse errors to result
	for _, parseErr := range parseResults.Errors {
		result.Errors = append(result.Errors, fmt.Sprintf("Line %d: %s", parseErr.Line, parseErr.Message))
	}

	for _, marker := range parseResults.Markers {
		outputPath := filepath.Join(outputDir, marker.Filename)

		// Check if file exists and overwrite is disabled
		if !options.Overwrite {
			if _, err := os.Stat(outputPath); err == nil {
				if options.DryRun {
					result.Errors = append(result.Errors, fmt.Sprintf("Would skip existing file: %s", outputPath))
				} else {
					result.Errors = append(result.Errors, fmt.Sprintf("File exists (use --overwrite): %s", outputPath))
				}
				continue
			}
		}

		if options.DryRun {
			result.ExtractedFiles = append(result.ExtractedFiles, outputPath)
			continue
		}

		// Create directory if needed
		if options.CreateDirs {
			dir := filepath.Dir(outputPath)
			if err := os.MkdirAll(dir, 0755); err != nil {
				result.Errors = append(result.Errors, fmt.Sprintf("Failed to create directory %s: %v", dir, err))
				result.Success = false
				continue
			}
		}

		// Write file
		if err := os.WriteFile(outputPath, []byte(marker.Content), 0644); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("Failed to write %s: %v", outputPath, err))
			result.Success = false
			continue
		}

		result.ExtractedFiles = append(result.ExtractedFiles, outputPath)
	}

	return result, nil
}

// ValidateMarkers validates markers in a file and returns detailed information.
func (mp *MarkerParser) ValidateMarkers(filePath string, strict bool) (*ValidationResults, error) {
	parseResults, err := mp.ParseMarkedFile(filePath)
	if err != nil {
		return nil, err
	}

	validation := &ValidationResults{
		IsValid:            len(parseResults.Errors) == 0,
		Errors:             make([]ValidationError, 0),
		DuplicateFilenames: make([]string, 0),
		InvalidFilenames:   make([]string, 0),
		Statistics: ValidationStatistics{
			TotalMarkers: parseResults.TotalMarkers,
			EmptyMarkers: 0,
		},
	}

	// Convert parse errors
	for _, parseErr := range parseResults.Errors {
		validation.Errors = append(validation.Errors, ValidationError(parseErr))
	}

	// Strict mode: flag malformed marker-like lines that don't match canonical regex
	if strict {
		startToken := fmt.Sprintf("//%s/", mp.fsChar)
		endToken := fmt.Sprintf("/%s//", mp.fsChar)
		file, err := os.Open(filePath)
		if err == nil {
			defer file.Close()
			scanner := bufio.NewScanner(file)
			lineNo := 0
			for scanner.Scan() {
				lineNo++
				line := scanner.Text()
				looksLike := strings.Contains(line, startToken) || strings.Contains(line, endToken) || (strings.Contains(line, mp.fsChar) && strings.Contains(line, "//"))
				if looksLike && !mp.markerRegex.MatchString(line) {
					validation.Errors = append(validation.Errors, ValidationError{Line: lineNo, Message: "Malformed marker line (strict mode)", Severity: "error"})
				}
			}
		}
	}

	// Check for duplicates and validation issues
	filenameCount := make(map[string]int)
	for _, marker := range parseResults.Markers {
		filenameCount[marker.Filename]++

		// Check for empty markers
		if strings.TrimSpace(marker.Content) == "" {
			validation.Statistics.EmptyMarkers++
		}

		// Validate filename
		if !mp.isValidFilename(marker.Filename) {
			validation.InvalidFilenames = append(validation.InvalidFilenames, marker.Filename)
		}
	}

	// Find duplicates
	for filename, count := range filenameCount {
		if count > 1 {
			validation.DuplicateFilenames = append(validation.DuplicateFilenames, filename)
		}
	}

	// No markers at all -> invalid
	if parseResults.TotalMarkers == 0 {
		validation.IsValid = false
	}

	// Update validity
	if len(validation.DuplicateFilenames) > 0 || len(validation.InvalidFilenames) > 0 || validation.Statistics.EmptyMarkers > 0 {
		validation.IsValid = false
	} else if validation.Statistics.TotalMarkers == 0 {
		validation.IsValid = false
	}

	return validation, nil
}

// ValidationResults contains marker validation results.
type ValidationResults struct {
	IsValid            bool                 `json:"isValid"`
	Errors             []ValidationError    `json:"errors"`
	DuplicateFilenames []string             `json:"duplicateFilenames"`
	InvalidFilenames   []string             `json:"invalidFilenames"`
	Statistics         ValidationStatistics `json:"statistics"`
}

// ValidationError represents a validation error.
type ValidationError struct {
	Line     int    `json:"line"`
	Message  string `json:"message"`
	Severity string `json:"severity"`
}

// ValidationStatistics contains validation statistics.
type ValidationStatistics struct {
	TotalMarkers int `json:"totalMarkers"`
	EmptyMarkers int `json:"emptyMarkers"`
}

// isValidFilename checks if a filename is valid for the current OS.
func (mp *MarkerParser) isValidFilename(filename string) bool {
	if filename == "" {
		return false
	}

	// Check for invalid characters (basic check)
	invalidChars := []string{"<", ">", ":", "\"", "|", "?", "*"}
	for _, char := range invalidChars {
		if strings.Contains(filename, char) {
			return false
		}
	}

	// Check for reserved names (Windows)
	reserved := []string{"CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9", "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9"}
	upper := strings.ToUpper(filename)
	for _, res := range reserved {
		if upper == res || strings.HasPrefix(upper, res+".") {
			return false
		}
	}

	return true
}

// GenerateResults contains the results of directory consolidation.
type GenerateResults struct {
	Success    bool     `json:"success"`
	TotalFiles int      `json:"totalFiles"`
	TotalBytes int64    `json:"totalBytes"`
	Errors     []string `json:"errors"`
}

// GenerateFromDirectory consolidates a directory into a marked file.
func (mp *MarkerParser) GenerateFromDirectory(sourceDir, outputFile string, excludePatterns []string) (*GenerateResults, error) {
	result := &GenerateResults{Success: true, Errors: []string{}}

	// Check if source directory exists
	if _, err := os.Stat(sourceDir); os.IsNotExist(err) {
		return nil, fmt.Errorf("source directory does not exist: %s", sourceDir)
	}

	// First pass: collect files respecting excludes
	fileList := []string{}
	err := filepath.Walk(sourceDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("Error accessing %s: %v", path, err))
			return nil // Continue walking
		}

		// Skip directories
		if info.IsDir() {
			return nil
		}

		// Get relative path
		relPath, err := filepath.Rel(sourceDir, path)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("Failed to get relative path for %s: %v", path, err))
			return nil
		}

		// Check exclusion patterns (glob and substring contains)
		for _, pattern := range excludePatterns {
			if matched, _ := filepath.Match(pattern, filepath.Base(relPath)); matched {
				return nil
			}
			if matched, _ := filepath.Match(pattern, relPath); matched {
				return nil
			}
			if strings.Contains(relPath, pattern) {
				return nil
			}
		}
		fileList = append(fileList, relPath)
		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("failed to walk directory: %w", err)
	}

	// Create output file and write header with real count
	outFile, err := os.Create(outputFile)
	if err != nil {
		return nil, fmt.Errorf("failed to create output file: %w", err)
	}
	defer outFile.Close()

	fsChar := string(rune(28))
	header := fmt.Sprintf("//%s/ PROJECT_INFO /%s//\n", fsChar, fsChar)
	header += fmt.Sprintf("Project: %s\n", filepath.Base(sourceDir))
	header += fmt.Sprintf("Generated: %s\n", nowISO8601())
	header += fmt.Sprintf("Total Files: %d\n", len(fileList))
	header += fmt.Sprintf("Source: %s\n", sourceDir)
	header += "Generator: lookatni-cli v1.1.0\n"
	header += "MarkerSpec: v1\n"
	header += "FS: 28\n"
	header += "MarkerTokens: //\\x1C/ <path> /\\x1C//\n"
	header += "Encoding: utf-8\n\n"
	if _, err := outFile.WriteString(header); err != nil {
		return nil, fmt.Errorf("failed to write header: %w", err)
	}
	result.TotalBytes += int64(len(header))

	for _, relPath := range fileList {
		abs := filepath.Join(sourceDir, relPath)
		content, err := os.ReadFile(abs)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("Failed to read %s: %v", relPath, err))
			continue
		}
		marker := fmt.Sprintf("//%s/ %s /%s//\n", fsChar, relPath, fsChar)
		if _, err := outFile.WriteString(marker); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("Failed to write marker for %s: %v", relPath, err))
			continue
		}
		if _, err := outFile.Write(content); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("Failed to write content for %s: %v", relPath, err))
			continue
		}
		if len(content) > 0 && content[len(content)-1] != '\n' {
			if _, err := outFile.WriteString("\n"); err != nil {
				result.Errors = append(result.Errors, fmt.Sprintf("Failed to write newline for %s: %v", relPath, err))
				continue
			}
			result.TotalBytes++
		}
		result.TotalFiles++
		result.TotalBytes += int64(len(content)) + int64(len(marker))
	}

	if len(result.Errors) > 0 {
		result.Success = false
	}

	return result, nil
}

func nowISO8601() string {
	return time.Now().UTC().Format(time.RFC3339)
}
