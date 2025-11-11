// Package utils provides utility types and functions for validation.
package utils

import (
	"os"
	"strings"
)

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

// ReadFileContent reads the entire file content.
func ReadFileContent(filePath string) ([]byte, error) { return os.ReadFile(filePath) }

func IsValidFilename(filename string) bool {
	if filename == "" {
		return false
	}
	invalid := []string{"<", ">", ":", "\"", "|", "?", "*"}
	for _, c := range invalid {
		if strings.Contains(filename, c) {
			return false
		}
	}
	reserved := []string{"CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9", "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9"}
	u := strings.ToUpper(filename)
	for _, r := range reserved {
		if u == r || strings.HasPrefix(u, r+".") {
			return false
		}
	}
	return true
}
