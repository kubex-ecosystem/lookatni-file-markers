// Package metadata provides adaptive marker configuration for LookAtni File Markers.
package metadata

import (
	"bytes"
	"fmt"
	"regexp"
	"strings"

	"gopkg.in/yaml.v3"
)

// MarkerConfig defines how file markers should be formatted.
type MarkerConfig struct {
	Version string `yaml:"version,omitempty"`
	Pattern string `yaml:"pattern,omitempty"`
	Start   string `yaml:"start,omitempty"`
	End     string `yaml:"end,omitempty"`
	Format  string `yaml:"format,omitempty"`
}

// LookAtniMetadata represents the frontmatter metadata in a marked file.
type LookAtniMetadata struct {
	LookAtni MarkerConfig `yaml:"lookatni"`
}

// MarkerPreset defines common marker patterns.
type MarkerPreset struct {
	Name        string
	Description string
	Config      MarkerConfig
}

// GetDefaultConfig returns the classic ASCII 28 marker configuration.
func GetDefaultConfig() MarkerConfig {
	return MarkerConfig{
		Version: "2.0",
		Start:   fmt.Sprintf("//%s/", string(rune(28))),
		End:     fmt.Sprintf("/%s//", string(rune(28))),
		Format:  "{start} {filename} {end}",
	}
}

// GetPresetConfigs returns predefined marker configurations.
func GetPresetConfigs() map[string]MarkerPreset {
	return map[string]MarkerPreset{
		"default": {
			Name:        "Default (ASCII 28)",
			Description: "Classic invisible markers using ASCII File Separator",
			Config:      GetDefaultConfig(),
		},
		"html": {
			Name:        "HTML Comments",
			Description: "HTML-friendly comment markers",
			Config: MarkerConfig{
				Version: "2.0",
				Pattern: "<!-- FILE: {filename} -->",
			},
		},
		"markdown": {
			Name:        "Markdown Invisible",
			Description: "Invisible Markdown comment markers",
			Config: MarkerConfig{
				Version: "2.0",
				Pattern: "[//]: # (FILE: {filename})",
			},
		},
		"code": {
			Name:        "Code Comments",
			Description: "Programming language comment style",
			Config: MarkerConfig{
				Version: "2.0",
				Start:   "// === FILE:",
				End:     " ===",
				Format:  "{start} {filename} {end}",
			},
		},
		"visual": {
			Name:        "Visual Separators",
			Description: "Highly visible decorative markers",
			Config: MarkerConfig{
				Version: "2.0",
				Start:   "🔥🔥🔥 FILE:",
				End:     " 🔥🔥🔥",
				Format:  "{start} {filename} {end}",
			},
		},
		"custom": {
			Name:        "Custom Template",
			Description: "User-defined marker pattern",
			Config: MarkerConfig{
				Version: "2.0",
				Pattern: "{custom}",
			},
		},
	}
}

// FormatMarker generates a marker string based on the configuration.
func (mc *MarkerConfig) FormatMarker(filename string) string {
	// Use pattern if defined
	if mc.Pattern != "" {
		return strings.ReplaceAll(mc.Pattern, "{filename}", filename)
	}

	// Use start/end/format if defined
	if mc.Format != "" {
		marker := mc.Format
		marker = strings.ReplaceAll(marker, "{filename}", filename)
		marker = strings.ReplaceAll(marker, "{start}", mc.Start)
		marker = strings.ReplaceAll(marker, "{end}", mc.End)
		return marker
	}

	// Fallback to default format
	defaultConfig := GetDefaultConfig()
	return defaultConfig.FormatMarker(filename)
}

// GenerateRegex creates a regex pattern to match markers based on configuration.
func (mc *MarkerConfig) GenerateRegex() (*regexp.Regexp, error) {
	var pattern string

	if mc.Pattern != "" {
		// Escape special regex characters and replace filename placeholder
		pattern = regexp.QuoteMeta(mc.Pattern)
		pattern = strings.ReplaceAll(pattern, regexp.QuoteMeta("{filename}"), "(.+?)")
	} else if mc.Format != "" {
		// Build pattern from format template
		formatPattern := regexp.QuoteMeta(mc.Format)
		formatPattern = strings.ReplaceAll(formatPattern, regexp.QuoteMeta("{start}"), regexp.QuoteMeta(mc.Start))
		formatPattern = strings.ReplaceAll(formatPattern, regexp.QuoteMeta("{end}"), regexp.QuoteMeta(mc.End))
		formatPattern = strings.ReplaceAll(formatPattern, regexp.QuoteMeta("{filename}"), "(.+?)")
		pattern = "^" + formatPattern + "$"
	} else {
		// Fallback to default pattern
		defaultConfig := GetDefaultConfig()
		return defaultConfig.GenerateRegex()
	}

	return regexp.Compile("^" + pattern + "$")
}

// ParseFrontmatter extracts metadata from the beginning of a marked file.
func ParseFrontmatter(content []byte) (*LookAtniMetadata, []byte, error) {
	// Check if content starts with YAML frontmatter
	if !bytes.HasPrefix(content, []byte("---\n")) {
		return nil, content, nil // No frontmatter found
	}

	// Find the end of frontmatter
	lines := bytes.Split(content, []byte("\n"))
	var endIndex int
	found := false

	for i := 1; i < len(lines); i++ {
		if bytes.Equal(bytes.TrimSpace(lines[i]), []byte("---")) {
			endIndex = i
			found = true
			break
		}
	}

	if !found {
		return nil, content, fmt.Errorf("malformed YAML frontmatter: missing closing ---")
	}

	// Extract frontmatter content
	frontmatterBytes := bytes.Join(lines[1:endIndex], []byte("\n"))
	remainingContent := bytes.Join(lines[endIndex+1:], []byte("\n"))

	// Parse YAML
	var metadata LookAtniMetadata
	if err := yaml.Unmarshal(frontmatterBytes, &metadata); err != nil {
		return nil, content, fmt.Errorf("failed to parse YAML frontmatter: %w", err)
	}

	return &metadata, remainingContent, nil
}

// GenerateFrontmatter creates YAML frontmatter for a marker configuration.
func GenerateFrontmatter(config MarkerConfig) ([]byte, error) {
	metadata := LookAtniMetadata{
		LookAtni: config,
	}

	yamlBytes, err := yaml.Marshal(metadata)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal metadata: %w", err)
	}

	// Wrap in frontmatter delimiters
	frontmatter := fmt.Sprintf("---\n%s---\n", string(yamlBytes))
	return []byte(frontmatter), nil
}
