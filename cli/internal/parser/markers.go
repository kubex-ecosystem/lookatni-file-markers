package parser

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/kubex-ecosystem/lookatni-file-markers/internal/module/kbx"
	"github.com/kubex-ecosystem/lookatni-file-markers/internal/utils"
)

// MarkerParser handles parsing and extraction of file markers.
type MarkerParser struct {
	// ASCII 28 (File Separator) character for invisible markers
	fsChar      string
	markerRegex *regexp.Regexp
}

// NewParser creates a new MarkerParser instance.
func NewParser() *MarkerParser {
	fsChar := string(rune(28)) // default FS = ASCII 28
	pattern := fmt.Sprintf(`^\/\/%s\/ (.+?) \/%s\/\/$`, regexp.QuoteMeta(fsChar), regexp.QuoteMeta(fsChar))
	markerRegex := regexp.MustCompile(pattern)
	return &MarkerParser{fsChar: fsChar, markerRegex: markerRegex}
}

// New creates a new MarkerParser instance.
func New() *MarkerParser {
	return NewParser()
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
func (mp *MarkerParser) ExtractFiles(markedFilePath, outputDir string, options kbx.ExtractOptions) (*ExtractResults, error) {
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
func (mp *MarkerParser) ValidateMarkers(filePath string, strict bool) (*utils.ValidationResults, error) {
	parseResults, err := mp.ParseMarkedFile(filePath)
	if err != nil {
		return nil, err
	}

	validation := &utils.ValidationResults{
		IsValid:            len(parseResults.Errors) == 0,
		Errors:             make([]utils.ValidationError, 0),
		DuplicateFilenames: make([]string, 0),
		InvalidFilenames:   make([]string, 0),
		Statistics: utils.ValidationStatistics{
			TotalMarkers: parseResults.TotalMarkers,
			EmptyMarkers: 0,
		},
	}

	// Convert parse errors
	for _, parseErr := range parseResults.Errors {
		validation.Errors = append(validation.Errors, utils.ValidationError(parseErr))
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
					validation.Errors = append(validation.Errors, utils.ValidationError{Line: lineNo, Message: "Malformed marker line (strict mode)", Severity: "error"})
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
