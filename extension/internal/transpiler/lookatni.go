// Package transpiler provides core LookAtni functionality for processing markdown files with embedded prompts.
package transpiler

import (
	"embed"
	"encoding/json"
	"fmt"
	"html"
	"io/fs"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"html/template"

	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/ast"

	mhtml "github.com/gomarkdown/markdown/html"
	yaml "gopkg.in/yaml.v3"

	"github.com/gomarkdown/markdown/parser"

	gl "github.com/kubex-ecosystem/lookatni-file-markers/internal/module/logger"
)

type mdFileContainer struct {
	ReadFile func(name string) ([]byte, error)
	FileInfo *fs.FileInfo
	Content  []byte
}

type IndexData struct {
	Files       []FileInfo
	FileCount   int
	TotalSize   string
	GeneratedAt string
}

// //go:embed all:embedded/resources/markdown/*
var mdEmbeddedFilesList embed.FS

//go:embed templates/template.html.tmpl
var templateContentByteArr []byte

//go:embed templates/index.html.tmpl
var indexTemplateByteArr []byte

var (
	// mdFiles is initialized with the embedded files
	mdFiles = make(map[string]*mdFileContainer)

	_ = mdFiles
	_ = mdEmbeddedFilesList
)

func EmbeddedMarkdownToHTML() {
	// Initialize the embedded file system
	mdFilesList, err := mdEmbeddedFilesList.ReadDir("tests")
	if err != nil {
		gl.Log("fatal", fmt.Sprintf("Error reading embedded files: %v", err))
	}

	// Collect information about generated files for index
	var generatedFiles []FileInfo
	var totalSizeBytes int64

	// Get the target directory
	currentDir, err := os.Getwd()
	if err != nil {
		gl.Log("fatal", fmt.Sprintf("Error getting current directory: %v", err))
	}
	outputPath := filepath.Join(currentDir, "output", "interviews")

	for _, file := range mdFilesList {
		if !file.IsDir() && strings.HasPrefix(file.Name(), "interview_") && strings.HasSuffix(file.Name(), ".md") {
			// Read the file info
			fileInfo, err := file.Info()
			if err != nil {
				gl.Log("warn", fmt.Sprintf("Error getting file info for %s: %v", file.Name(), err))
				continue
			}

			mdFiles[file.Name()] = &mdFileContainer{
				ReadFile: func(name string) ([]byte, error) {
					return mdEmbeddedFilesList.ReadFile(filepath.Join("tests", name))
				},
				FileInfo: &fileInfo,
				Content:  make([]byte, 0),
			}
			if fileInfo.IsDir() || !strings.HasSuffix(file.Name(), ".md") {
				gl.Log("warn", fmt.Sprintf("Skipping %s: not a valid source entry\n", file.Name()))
				continue
			}

			mdFiles[file.Name()] = &mdFileContainer{
				ReadFile: func(name string) ([]byte, error) {
					return mdEmbeddedFilesList.ReadFile(filepath.Join("tests", name))
				},
				FileInfo: &fileInfo,
				Content:  make([]byte, 0),
			}

			containerFile := mdFiles[file.Name()]
			containerFile.Content, err = mdFiles[file.Name()].ReadFile(file.Name())
			if err != nil {
				gl.Log("error", fmt.Sprintf("Error reading %s: %v\n", file.Name(), err))
				continue
			}

			// Preprocess: frontmatter + fenced prompt blocks → custom components
			pre, _, count := preprocessMarkdown(string(containerFile.Content))

			htmlFileInfo, err := convertMarkdownToHTML(file.Name(), []byte(pre), count)
			if err != nil {
				gl.Log("error", fmt.Sprintf("Error converting %s to HTML: %v\n", file.Name(), err))
			} else {
				generatedFiles = append(generatedFiles, htmlFileInfo)
				// Get file size for total calculation
				if stat, err := os.Stat(filepath.Join(outputPath, htmlFileInfo.FileName)); err == nil {
					totalSizeBytes += stat.Size()
				}
			}
		}
	}

	// Generate index.html after all files are processed
	if err := generateIndex(generatedFiles, totalSizeBytes); err != nil {
		gl.Log("error", fmt.Sprintf("Error generating index: %v\n", err))
	}
	if err := writeAggregateIndexJSON(generatedFiles); err != nil {
		gl.Log("error", fmt.Sprintf("Error writing aggregate index: %v\n", err))
	}
}

func convertMarkdownToHTML(mdFileTitle string, mdFileContent []byte, blockCount int) (FileInfo, error) {
	// Get the target directory
	currentDir, err := os.Getwd()
	if err != nil {
		gl.Log("fatal", fmt.Sprintf("Error getting current directory: %v", err))
	}

	outputPath := filepath.Join(currentDir, "output", "interviews")
	if err := os.MkdirAll(outputPath, 0755); err != nil {
		gl.Log("fatal", fmt.Sprintf("Error creating output directory: %v", err))
	}

	htmlFilePath := filepath.Join(
		outputPath,
		fmt.Sprintf(
			"./%s_view.html",
			strings.TrimSuffix(strings.TrimPrefix(mdFileTitle, "interview_"), ".md"),
		),
	)

	if len(mdFileContent) > 0 {
		// Log the conversion process
		gl.Log("info", fmt.Sprintf("Converting %s to HTML at %s. (%d bytes)", mdFileTitle, htmlFilePath, len(mdFileContent)))

		// The template content is embedded in the binary
		// And it has the simple structure bellow:
		// {{ .Content | markdown }}

		// Parse the template content
		var templateRenderer = template.Must(
			template.New("markdown").
				Option("missingkey=zero").
				Parse(string(templateContentByteArr)),
		)

		// Convert markdown to HTML first
		extensions := parser.CommonExtensions | parser.AutoHeadingIDs
		p := parser.NewWithExtensions(extensions)
		doc := p.Parse(mdFileContent)

		htmlFlags := mhtml.CommonFlags | mhtml.HrefTargetBlank
		opts := mhtml.RendererOptions{Flags: htmlFlags}
		renderer := mhtml.NewRenderer(opts)

		htmlContent := markdown.Render(doc, renderer)

		// Read the Markdown file content
		var ioWriter = strings.Builder{}

		// Execute the template with the HTML content
		if err := templateRenderer.Execute(&ioWriter, template.HTML(htmlContent)); err != nil {
			gl.Log("error", fmt.Sprintf("Error executing template: %v", err))
			return FileInfo{}, err
		}

		// Convert the template output to final HTML
		finalHTML := []byte(ioWriter.String())

		// Write the HTML file
		if err = os.WriteFile(htmlFilePath, finalHTML, 0644); err != nil {
			gl.Log("error", fmt.Sprintf("Error writing HTML file: %v", err))
			return FileInfo{}, err
		}

		gl.Log("info", fmt.Sprintf("HTML file %s generated successfully.", htmlFilePath))

		// Additionally, write TOC and per-doc index JSONs
		if err := writeTocJSON(doc, outputPath, htmlFilePath); err != nil {
			gl.Log("error", fmt.Sprintf("Error writing TOC JSON: %v", err))
		}
		if err := writeDocIndexJSON(outputPath, htmlFilePath, mdFileTitle, doc, blockCount); err != nil {
			gl.Log("error", fmt.Sprintf("Error writing index JSON: %v", err))
		}

		// Create FileInfo for index
		htmlFileName := filepath.Base(htmlFilePath)
		fileInfo := FileInfo{
			FileName:    htmlFileName,
			Title:       generateTitle(mdFileTitle),
			Description: generateDescription(mdFileTitle),
			Size:        fmt.Sprintf("%.1f", float64(len(finalHTML))/1024),
			Icon:        getFileIcon(mdFileTitle),
		}

		return fileInfo, nil
	} else {
		gl.Log("info", "No HTML content generated.")
		return FileInfo{}, fmt.Errorf("no content to convert")
	}
}

// generateTitle creates a human-readable title from the markdown filename
func generateTitle(mdFileName string) string {
	// Remove "interview_" prefix and ".md" suffix
	title := strings.TrimPrefix(mdFileName, "interview_")
	title = strings.TrimSuffix(title, ".md")

	// Convert underscores to spaces and capitalize
	title = strings.ReplaceAll(title, "_", " ")
	words := strings.Fields(title)
	for i, word := range words {
		if len(word) > 0 {
			words[i] = strings.ToUpper(word[:1]) + word[1:]
		}
	}

	return strings.Join(words, " ")
}

// generateDescription creates a description based on the file type
func generateDescription(mdFileName string) string {
	if strings.Contains(mdFileName, "test") {
		return "Versão de teste com perguntas e respostas simuladas para prática."
	} else if strings.Contains(mdFileName, "v2") {
		return "Versão refinada e polida com respostas mais elaboradas."
	} else {
		return "Documento principal de preparação com todas as seções essenciais."
	}
}

// getFileIcon returns an emoji icon based on the file type
func getFileIcon(mdFileName string) string {
	if strings.Contains(mdFileName, "test") {
		return "🧪"
	} else if strings.Contains(mdFileName, "v2") {
		return "✨"
	} else {
		return "📋"
	}
}

// generateIndex creates the index.html file with links to all generated files
func generateIndex(files []FileInfo, totalSizeBytes int64) error {
	currentDir, err := os.Getwd()
	if err != nil {
		gl.Log("fatal", fmt.Sprintf("Error getting current directory: %v", err))
		return fmt.Errorf("error getting current directory: %v", err)
	}

	outputPath := filepath.Join(currentDir, "output", "interviews")
	indexPath := filepath.Join(outputPath, "index.html")

	// Prepare data for template
	indexData := IndexData{
		Files:       files,
		FileCount:   len(files),
		TotalSize:   fmt.Sprintf("%.1f", float64(totalSizeBytes)/1024),
		GeneratedAt: time.Now().Format("02/01/2006 às 15:04"),
	}

	// Parse the index template
	indexTemplate := template.Must(
		template.New("index").Parse(string(indexTemplateByteArr)),
	)

	// Execute template
	var indexWriter strings.Builder
	if err := indexTemplate.Execute(&indexWriter, indexData); err != nil {
		gl.Log("error", fmt.Sprintf("Error executing index template: %v", err))
		return fmt.Errorf("error executing index template: %v", err)
	}

	// Write index.html
	if err := os.WriteFile(indexPath, []byte(indexWriter.String()), 0644); err != nil {
		gl.Log("error", fmt.Sprintf("Error writing index file: %v", err))
		return fmt.Errorf("error writing index file: %v", err)
	}

	gl.Log("info", fmt.Sprintf("Index file %s generated successfully with %d files.", indexPath, len(files)))
	return nil
}

// writeAggregateIndexJSON writes output/interviews/index.json with basic metadata for search
func writeAggregateIndexJSON(files []FileInfo) error {
	currentDir, err := os.Getwd()
	if err != nil {
		return err
	}
	outputPath := filepath.Join(currentDir, "output", "interviews")
	idx := map[string]any{
		"generatedAt": time.Now().Format(time.RFC3339),
		"count":       len(files),
		"files":       files,
	}
	data, _ := json.MarshalIndent(idx, "", "  ")
	return os.WriteFile(filepath.Join(outputPath, "index.json"), data, 0644)
}

// ===== DSL + Frontmatter Preprocess =====

type frontmatter struct {
	Title    any            `yaml:"title"`
	Tags     []string       `yaml:"tags"`
	Context  map[string]any `yaml:"context"`
	Defaults struct {
		Model       string   `yaml:"model"`
		Temperature float64  `yaml:"temperature"`
		ToolHints   []string `yaml:"toolHints"`
	} `yaml:"defaults"`
}

type promptInput struct {
	Name   string   `yaml:"name"`
	Type   string   `yaml:"type"`
	Values []string `yaml:"values"`
}

type promptBody struct {
	Role     string        `yaml:"role"`
	Goal     string        `yaml:"goal"`
	Inputs   []promptInput `yaml:"inputs"`
	Template string        `yaml:"template"`
}

type promptAttrs struct {
	ID        string
	Mode      string
	ToolHints []string
}

var (
	fmRegex     = regexp.MustCompile(`(?s)^---\n(.*?)\n---\n`)
	fenceRegex  = regexp.MustCompile("(?s)```prompt\\s*([^\\n]*)\\n(.*?)```\\s*")
	attrKVRegex = regexp.MustCompile(`(\w+)=([^\s]+)`) // key=value (quote or bracket value allowed)
	quoteTrim   = regexp.MustCompile(`^\"|\"$`)
	bracketTrim = regexp.MustCompile(`^[\[]|[\]]$`)
	listSplit   = regexp.MustCompile(`\s*,\s*`)
)

// preprocessMarkdown parses optional YAML frontmatter and transpiles fenced `prompt` code blocks
// into Kortex custom elements, returning body (without frontmatter), parsed frontmatter, and count.
func preprocessMarkdown(src string) (string, *frontmatter, int) {
	var fm *frontmatter
	// Extract frontmatter if present
	if m := fmRegex.FindStringSubmatch(src); len(m) == 2 {
		fm = &frontmatter{}
		if err := yaml.Unmarshal([]byte(m[1]), fm); err != nil {
			// Ignore FM errors; proceed without FM
			fm = nil
		}
		src = src[len(m[0]):]
	}

	replaced := 0
	out := fenceRegex.ReplaceAllStringFunc(src, func(full string) string {
		m := fenceRegex.FindStringSubmatch(full)
		if len(m) != 3 {
			return full
		}
		attrLine := strings.TrimSpace(m[1])
		bodyYAML := strings.TrimSpace(m[2])

		attrs := parsePromptAttrs(attrLine)
		var pb promptBody
		if err := yaml.Unmarshal([]byte(bodyYAML), &pb); err != nil {
			// leave original block if YAML fails
			return full
		}

		// Defaults from FM + block
		defaults := map[string]any{}
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
		templateAttr := html.EscapeString(pb.Template)

		// Build inputs HTML
		var fields []string
		for _, in := range pb.Inputs {
			valuesJSON, _ := json.Marshal(in.Values)
			fields = append(fields, fmt.Sprintf(
				`<kx-field name="%s" type="%s" values='%s'></kx-field>`,
				html.EscapeString(in.Name), html.EscapeString(in.Type), html.EscapeString(string(valuesJSON)),
			))
		}
		inner := strings.Join(fields, "\n  ") + "\n  <button class=\"run\">Run with MCP</button>\n  <pre class=\"preview\"></pre>"

		htmlBlock := fmt.Sprintf(
			`<kx-prompt-block data-id="%s" data-defaults='%s' data-template="%s">
  %s
</kx-prompt-block>`,
			html.EscapeString(attrs.ID), html.EscapeString(string(defJSON)), templateAttr, inner,
		)

		replaced++
		return htmlBlock
	})

	return out, fm, replaced
}

func parsePromptAttrs(line string) promptAttrs {
	pa := promptAttrs{}
	for _, m := range attrKVRegex.FindAllStringSubmatch(line, -1) {
		if len(m) != 3 {
			continue
		}
		key := m[1]
		val := m[2]
		// Unwrap quotes or brackets
		if strings.HasPrefix(val, "\"") && strings.HasSuffix(val, "\"") {
			val = quoteTrim.ReplaceAllString(val, "")
		} else if strings.HasPrefix(val, "[") && strings.HasSuffix(val, "]") {
			raw := bracketTrim.ReplaceAllString(val, "")
			items := []string{}
			for _, it := range listSplit.Split(raw, -1) {
				it = strings.TrimSpace(it)
				it = quoteTrim.ReplaceAllString(it, "")
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

// writeTocJSON generates a simple toc.json next to the HTML file
func writeTocJSON(doc ast.Node, outDir, htmlPath string) error {
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
			id := slugify(text)
			items = append(items, tocItem{Level: h.Level, Text: text, ID: id})
		}
		return ast.GoToNext
	})
	data, _ := json.MarshalIndent(items, "", "  ")
	base := strings.TrimSuffix(filepath.Base(htmlPath), filepath.Ext(htmlPath))
	return os.WriteFile(filepath.Join(outDir, base+"_toc.json"), data, 0644)
}

// writeDocIndexJSON writes a minimal index.json per document with metadata and prompt blocks count
func writeDocIndexJSON(outDir, htmlPath, srcName string, doc ast.Node, blockCount int) error {
	// Count kx-prompt-blocks by looking for our injected tags in the rendered HTML is expensive;
	// here we count occurrences in source name for now (simple placeholder), set 0.
	idx := map[string]any{
		"source":      srcName,
		"title":       generateTitle(srcName),
		"blocks":      blockCount,
		"generatedAt": time.Now().Format(time.RFC3339),
	}
	data, _ := json.MarshalIndent(idx, "", "  ")
	base := strings.TrimSuffix(filepath.Base(htmlPath), filepath.Ext(htmlPath))
	return os.WriteFile(filepath.Join(outDir, base+"_index.json"), data, 0644)
}

func slugify(s string) string {
	s = strings.ToLower(s)
	// replace non-alphanum with dash
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
