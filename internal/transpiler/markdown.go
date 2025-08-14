// Package transpiler provides Markdown to HTML transpilation with prompt block support.
package transpiler

import (
	"encoding/json"
	"fmt"
	htmlpkg "html"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/ast"
	"github.com/gomarkdown/markdown/html"
	"github.com/gomarkdown/markdown/parser"
	"gopkg.in/yaml.v3"
)

// Frontmatter represents YAML frontmatter in Markdown files.
type Frontmatter struct {
	Title    interface{}        `yaml:"title"`
	Tags     []string          `yaml:"tags"`
	Context  map[string]interface{} `yaml:"context"`
	Defaults struct {
		Model       string   `yaml:"model"`
		Temperature float64  `yaml:"temperature"`
		ToolHints   []string `yaml:"toolHints"`
	} `yaml:"defaults"`
}

// PromptInput represents an input field in a prompt block.
type PromptInput struct {
	Name   string   `yaml:"name"`
	Type   string   `yaml:"type"`
	Values []string `yaml:"values"`
}

// PromptBody represents the YAML content of a prompt block.
type PromptBody struct {
	Role     string        `yaml:"role"`
	Goal     string        `yaml:"goal"`
	Inputs   []PromptInput `yaml:"inputs"`
	Template string        `yaml:"template"`
}

// PromptAttrs represents attributes from the prompt fence line.
type PromptAttrs struct {
	ID        string
	Mode      string
	ToolHints []string
}

// FileInfo represents information about a generated HTML file.
type FileInfo struct {
	FileName    string `json:"fileName"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Size        string `json:"size"`
	Icon        string `json:"icon"`
}

// Transpiler handles Markdown to HTML conversion with prompt blocks.
type Transpiler struct {
	// Compiled regex patterns
	fmRegex     *regexp.Regexp
	fenceRegex  *regexp.Regexp
	attrKVRegex *regexp.Regexp
	quoteTrim   *regexp.Regexp
	bracketTrim *regexp.Regexp
	listSplit   *regexp.Regexp
	
	// HTML template
	htmlTemplate string
}

// New creates a new Transpiler instance.
func New(htmlTemplate string) *Transpiler {
	return &Transpiler{
		fmRegex:     regexp.MustCompile(`(?s)^---\n(.*?)\n---\n`),
		fenceRegex:  regexp.MustCompile("(?s)```prompt\\s*([^\\n]*)\\n(.*?)```\\s*"),
		attrKVRegex: regexp.MustCompile(`(\w+)=([^\s]+)`),
		quoteTrim:   regexp.MustCompile(`^\"|\"$`),
		bracketTrim: regexp.MustCompile(`^[\[]|[\]]$`),
		listSplit:   regexp.MustCompile(`\s*,\s*`),
		htmlTemplate: htmlTemplate,
	}
}

// ConvertMarkdownToHTML converts a Markdown file to HTML with prompt block processing.
func (t *Transpiler) ConvertMarkdownToHTML(filename string, content []byte, outputDir string) (*FileInfo, error) {
	// Preprocess markdown (frontmatter + prompt blocks)
	processed, frontmatter, blockCount := t.preprocessMarkdown(string(content))
	
	// Generate HTML file path
	baseName := strings.TrimSuffix(strings.TrimPrefix(filename, "interview_"), ".md")
	htmlFileName := fmt.Sprintf("%s_view.html", baseName)
	htmlFilePath := filepath.Join(outputDir, htmlFileName)
	
	// Ensure output directory exists
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create output directory: %w", err)
	}
	
	// Convert markdown to HTML
	extensions := parser.CommonExtensions | parser.AutoHeadingIDs
	p := parser.NewWithExtensions(extensions)
	doc := p.Parse([]byte(processed))
	
	htmlFlags := html.CommonFlags | html.HrefTargetBlank
	opts := html.RendererOptions{Flags: htmlFlags}
	renderer := html.NewRenderer(opts)
	
	htmlContent := markdown.Render(doc, renderer)
	
	// Apply HTML template
	finalHTML := strings.ReplaceAll(t.htmlTemplate, "{{.Content}}", string(htmlContent))
	
	// Write HTML file
	if err := os.WriteFile(htmlFilePath, []byte(finalHTML), 0644); err != nil {
		return nil, fmt.Errorf("failed to write HTML file: %w", err)
	}
	
	// Generate supplementary files
	if err := t.writeTocJSON(doc, outputDir, htmlFilePath); err != nil {
		return nil, fmt.Errorf("failed to write TOC JSON: %w", err)
	}
	
	if err := t.writeDocIndexJSON(outputDir, htmlFilePath, filename, doc, blockCount); err != nil {
		return nil, fmt.Errorf("failed to write doc index JSON: %w", err)
	}
	
	// Calculate file size
	stat, err := os.Stat(htmlFilePath)
	if err != nil {
		return nil, fmt.Errorf("failed to stat HTML file: %w", err)
	}
	
	fileInfo := &FileInfo{
		FileName:    htmlFileName,
		Title:       t.generateTitle(filename),
		Description: t.generateDescription(frontmatter),
		Size:        fmt.Sprintf("%.1f", float64(stat.Size())/1024),
		Icon:        t.generateIcon(filename),
	}
	
	return fileInfo, nil
}

// preprocessMarkdown parses frontmatter and transpiles prompt blocks.
func (t *Transpiler) preprocessMarkdown(src string) (string, *Frontmatter, int) {
	var fm *Frontmatter
	
	// Extract frontmatter if present
	if m := t.fmRegex.FindStringSubmatch(src); len(m) == 2 {
		fm = &Frontmatter{}
		if err := yaml.Unmarshal([]byte(m[1]), fm); err != nil {
			// Ignore FM errors; proceed without FM
			fm = nil
		}
		src = src[len(m[0]):]
	}
	
	replaced := 0
	out := t.fenceRegex.ReplaceAllStringFunc(src, func(full string) string {
		m := t.fenceRegex.FindStringSubmatch(full)
		if len(m) != 3 {
			return full
		}
		
		attrLine := strings.TrimSpace(m[1])
		bodyYAML := strings.TrimSpace(m[2])
		
		attrs := t.parsePromptAttrs(attrLine)
		var pb PromptBody
		if err := yaml.Unmarshal([]byte(bodyYAML), &pb); err != nil {
			// leave original block if YAML fails
			return full
		}
		
		// Merge defaults from frontmatter and block
		defaults := make(map[string]interface{})
		if fm != nil {
			if fm.Defaults.Model != "" {
				defaults["model"] = fm.Defaults.Model
			}
			if fm.Defaults.Temperature != 0 {
				defaults["temperature"] = fm.Defaults.Temperature
			}
			if len(fm.Defaults.ToolHints) > 0 {
				defaults["toolHints"] = fm.Defaults.ToolHints
			}
		}
		if pb.Role != "" {
			defaults["role"] = pb.Role
		}
		if pb.Goal != "" {
			defaults["goal"] = pb.Goal
		}
		if attrs.Mode != "" {
			defaults["mode"] = attrs.Mode
		}
		if len(attrs.ToolHints) > 0 {
			defaults["toolHints"] = attrs.ToolHints
		}
		
		defJSON, _ := json.Marshal(defaults)
		templateAttr := htmlpkg.EscapeString(pb.Template)
		
		// Build inputs HTML
		var fields []string
		for _, in := range pb.Inputs {
			valuesJSON, _ := json.Marshal(in.Values)
			fields = append(fields, fmt.Sprintf(
				`<kx-field name="%s" type="%s" values='%s'></kx-field>`,
				htmlpkg.EscapeString(in.Name), htmlpkg.EscapeString(in.Type), htmlpkg.EscapeString(string(valuesJSON)),
			))
		}
		inner := strings.Join(fields, "\n  ") + "\n  <button class=\"run\">Run with MCP</button>\n  <pre class=\"preview\"></pre>"
		
		htmlBlock := fmt.Sprintf(
			`<kx-prompt-block data-id="%s" data-defaults='%s' data-template="%s">
  %s
</kx-prompt-block>`,
			htmlpkg.EscapeString(attrs.ID), htmlpkg.EscapeString(string(defJSON)), templateAttr, inner,
		)
		
		replaced++
		return htmlBlock
	})
	
	return out, fm, replaced
}

// parsePromptAttrs parses attributes from the prompt fence line.
func (t *Transpiler) parsePromptAttrs(line string) PromptAttrs {
	pa := PromptAttrs{}
	for _, m := range t.attrKVRegex.FindAllStringSubmatch(line, -1) {
		if len(m) != 3 {
			continue
		}
		key := m[1]
		val := m[2]
		
		// Unwrap quotes or brackets
		if strings.HasPrefix(val, "\"") && strings.HasSuffix(val, "\"") {
			val = t.quoteTrim.ReplaceAllString(val, "")
		} else if strings.HasPrefix(val, "[") && strings.HasSuffix(val, "]") {
			raw := t.bracketTrim.ReplaceAllString(val, "")
			items := []string{}
			for _, it := range t.listSplit.Split(raw, -1) {
				it = strings.TrimSpace(it)
				it = t.quoteTrim.ReplaceAllString(it, "")
				if it != "" {
					items = append(items, it)
				}
			}
			if key == "toolHints" {
				pa.ToolHints = items
			}
			continue
		}
		
		switch key {
		case "id":
			pa.ID = val
		case "mode":
			pa.Mode = val
		case "toolHints":
			// already handled above if bracket form
			if val != "" {
				pa.ToolHints = append(pa.ToolHints, val)
			}
		}
	}
	return pa
}

// writeTocJSON generates a table of contents JSON file.
func (t *Transpiler) writeTocJSON(doc ast.Node, outDir, htmlPath string) error {
	type tocItem struct {
		Level int    `json:"level"`
		Text  string `json:"text"`
		ID    string `json:"id"`
	}
	
	var items []tocItem
	ast.WalkFunc(doc, func(n ast.Node, entering bool) ast.WalkStatus {
		if !entering {
			return ast.GoToNext
		}
		if h, ok := n.(*ast.Heading); ok {
			// gather text
			var b strings.Builder
			for _, c := range n.GetChildren() {
				if t, ok := c.(*ast.Text); ok {
					b.Write(t.Literal)
				}
			}
			text := b.String()
			id := t.slugify(text)
			items = append(items, tocItem{Level: h.Level, Text: text, ID: id})
		}
		return ast.GoToNext
	})
	
	data, _ := json.MarshalIndent(items, "", "  ")
	base := strings.TrimSuffix(filepath.Base(htmlPath), filepath.Ext(htmlPath))
	return os.WriteFile(filepath.Join(outDir, base+"_toc.json"), data, 0644)
}

// writeDocIndexJSON writes document metadata JSON.
func (t *Transpiler) writeDocIndexJSON(outDir, htmlPath, srcName string, doc ast.Node, blockCount int) error {
	idx := map[string]interface{}{
		"source":      srcName,
		"title":       t.generateTitle(srcName),
		"blocks":      blockCount,
		"generatedAt": time.Now().Format(time.RFC3339),
	}
	
	data, _ := json.MarshalIndent(idx, "", "  ")
	base := strings.TrimSuffix(filepath.Base(htmlPath), filepath.Ext(htmlPath))
	return os.WriteFile(filepath.Join(outDir, base+"_index.json"), data, 0644)
}

// generateTitle creates a human-readable title from filename.
func (t *Transpiler) generateTitle(filename string) string {
	name := strings.TrimSuffix(strings.TrimPrefix(filename, "interview_"), ".md")
	name = strings.ReplaceAll(name, "_", " ")
	
	// Capitalize first letter of each word
	words := strings.Fields(name)
	for i, word := range words {
		if len(word) > 0 {
			words[i] = strings.ToUpper(word[:1]) + word[1:]
		}
	}
	
	return strings.Join(words, " ")
}

// generateDescription creates a description from frontmatter or filename.
func (t *Transpiler) generateDescription(fm *Frontmatter) string {
	if fm != nil && fm.Title != nil {
		if title, ok := fm.Title.(string); ok {
			return title
		}
	}
	return "Documento de preparação para entrevista técnica."
}

// generateIcon returns an appropriate icon for the file type.
func (t *Transpiler) generateIcon(filename string) string {
	if strings.Contains(filename, "test") {
		return "🧪"
	}
	if strings.Contains(filename, "v2") || strings.Contains(filename, "refined") {
		return "🔄"
	}
	return "📋"
}

// slugify converts text to URL-friendly slug.
func (t *Transpiler) slugify(s string) string {
	s = strings.ToLower(s)
	var b strings.Builder
	dash := false
	
	for _, r := range s {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == ' ' || r == '-' {
			if r == ' ' {
				r = '-'
			}
			if r == '-' {
				if dash {
					continue
				}
				dash = true
			} else {
				dash = false
			}
			b.WriteRune(r)
		}
	}
	
	out := b.String()
	out = strings.Trim(out, "-")
	return out
}

// GenerateIndex creates an index.html and index.json for multiple files.
func (t *Transpiler) GenerateIndex(files []FileInfo, totalSizeBytes int64, outputDir string) error {
	// Generate index.html
	indexTemplate := `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Interview Index</title>
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 2rem; line-height: 1.6; }
      .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
      .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
      .title { font-size: 1.1rem; margin: 0 0 8px; }
      .meta { color: #6b7280; font-size: .9rem; }
      a.btn { display: inline-block; margin-top: 10px; padding: 8px 12px; background: #0b69c7; color: white; border-radius: 6px; text-decoration: none; }
      a.btn:hover { background: #0a5db0; }
    </style>
  </head>
  <body>
    <h1>Interview Prep – HTML Index</h1>
    <p class="meta">Arquivos: %d • Tamanho total: %.1f KB • Gerado em %s</p>
    <div class="grid">%s</div>
  </body>
</html>`

	var cards strings.Builder
	for _, file := range files {
		cards.WriteString(fmt.Sprintf(`
      <div class="card">
        <div class="title">%s %s</div>
        <div class="meta">%s • %s KB</div>
        <a class="btn" href="./%s">Abrir</a>
      </div>`, file.Icon, file.Title, file.Description, file.Size, file.FileName))
	}

	indexHTML := fmt.Sprintf(indexTemplate, 
		len(files), 
		float64(totalSizeBytes)/1024, 
		time.Now().Format("02/01/2006 às 15:04"),
		cards.String())

	if err := os.WriteFile(filepath.Join(outputDir, "index.html"), []byte(indexHTML), 0644); err != nil {
		return fmt.Errorf("failed to write index.html: %w", err)
	}

	// Generate index.json
	idx := map[string]interface{}{
		"generatedAt": time.Now().Format(time.RFC3339),
		"count":       len(files),
		"files":       files,
	}
	
	data, _ := json.MarshalIndent(idx, "", "  ")
	return os.WriteFile(filepath.Join(outputDir, "index.json"), data, 0644)
}
