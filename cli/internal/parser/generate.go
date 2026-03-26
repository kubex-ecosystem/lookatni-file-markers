package parser

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

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
