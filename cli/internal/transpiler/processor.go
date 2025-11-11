package transpiler

import (
	"encoding/json"
	"fmt"
	"html"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/gomarkdown/markdown/ast"
	yaml "gopkg.in/yaml.v3"
)

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
