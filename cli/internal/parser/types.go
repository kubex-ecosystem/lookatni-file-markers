// Package parser defines types used in the parsing process.
package parser

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



// ExtractResults contains the results of file extraction.
type ExtractResults struct {
	Success        bool     `json:"success"`
	ExtractedFiles []string `json:"extractedFiles"`
	Errors         []string `json:"errors"`
}
