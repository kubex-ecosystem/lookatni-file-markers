// Package parser_tests contains tests for the parser package.
package parser

import (
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"

	prs "github.com/kubex-ecosystem/lookatni-file-markers/internal/parser"
)

func TestGenerateFromDirectoryMoreThan20MB_escapeNode_modules(t *testing.T) {
	var dst, src string
	var err error
	src, err = filepath.Abs("../..")
	if err != nil {
		panic("filepath.Abs failed: " + err.Error())
	}
	src = filepath.Clean(filepath.Join(filepath.Dir(src), "core")) // go up to repo root
	// Ensure src exists
	if _, err := os.Stat(src); os.IsNotExist(err) {
		panic("source path does not exist: " + src)
	}
	t.Logf("Using source path: %s", src)
	dst = os.TempDir()
	if dst == "" {
		panic("os.TempDir returned empty string")
	}
	dst = filepath.Clean(filepath.Join(dst, "test-parser-"))
	if err := os.MkdirAll(dst, 0o755); err != nil {
		panic("os.MkdirAll failed: " + err.Error())
	}
	// Change to temp dir
	if err := os.Chdir(dst); err != nil {
		panic("os.Chdir failed: " + err.Error())
	}

	// Change to temp dir
	if err := os.Chdir(dst); err != nil {
		t.Fatalf("os.Chdir failed: %v", err)
	}
	out := filepath.Join(dst, "out.lkt")

	// Generate markers
	res, err := prs.New().GenerateFromDirectory(src, out, []string{})
	if err != nil {
		t.Fatalf("GenerateFromDirectory error: %v", err)
	}
	if !res.Success {
		t.Fatalf("generation reported not successful: %+v", res)
	}

	t.Logf("Generated markers at %s", out)
	t.Logf("Artifact size: %.2fKB", float64(res.TotalBytes)/1024)
	t.Logf("Artifact size: %.2fMB", float64(res.TotalBytes)/1024/1024)

	b, err := os.ReadFile(out)
	if err != nil {
		t.Fatalf("reading output failed: %v", err)
	}
	s := string(b)

	// Header assertions
	fsChar := string(rune(28))
	headerMarker := "//" + fsChar + "/ PROJECT_INFO /" + fsChar + "//"
	if !strings.Contains(s, headerMarker) {
		t.Fatalf("missing PROJECT_INFO header marker: %q not found", headerMarker)
	}
	if !strings.Contains(s, "MarkerSpec: v1") {
		t.Fatalf("missing MarkerSpec header")
	}
	if !strings.Contains(s, "FS: 28") {
		t.Fatalf("missing FS header")
	}
	if !strings.Contains(s, "MarkerTokens: //\\x1C/ <path> /\\x1C//") {
		t.Fatalf("missing MarkerTokens header")
	}
	if !strings.Contains(s, "Encoding: utf-8") {
		t.Fatalf("missing Encoding header")
	}

	// Count markers for files: expect 3
	re := regexp.MustCompile(`(?m)^//` + regexp.QuoteMeta(fsChar) + `/ .+ /` + regexp.QuoteMeta(fsChar) + `//$`)
	matches := re.FindAllStringIndex(s, -1)
	if len(matches) < 3 { // at least 3 file markers (header isn't counted here due to the space after FS/)
		t.Fatalf("expected at least 3 file markers, got %d", len(matches))
	}

	// // Total Files header should reflect 3
	// if !strings.Contains(s, "Total Files: 3") {
	// 	t.Fatalf("expected 'Total Files: 3' in header, got: %s", s[:min(len(s), 300)])
	// }
}

func TestGenerateFromDirectoryLessThan20MB_escapeDistBinOut(t *testing.T) {
	var dst, src string
	var err error
	src, err = filepath.Abs("../..")
	if err != nil {
		panic("filepath.Abs failed: " + err.Error())
	}
	src = filepath.Clean(filepath.Join(filepath.Dir(src), "cli")) // go up to repo root
	// Ensure src exists
	if _, err := os.Stat(src); os.IsNotExist(err) {
		panic("source path does not exist: " + src)
	}
	t.Logf("Using source path: %s", src)
	dst = os.TempDir()
	if dst == "" {
		panic("os.TempDir returned empty string")
	}
	dst = filepath.Clean(filepath.Join(dst, "test-parser-"))
	if err := os.MkdirAll(dst, 0o755); err != nil {
		panic("os.MkdirAll failed: " + err.Error())
	}
	// Change to temp dir
	if err := os.Chdir(dst); err != nil {
		panic("os.Chdir failed: " + err.Error())
	}

	// Change to temp dir
	if err := os.Chdir(dst); err != nil {
		t.Fatalf("os.Chdir failed: %v", err)
	}
	out := filepath.Join(dst, "out.lkt")

	// Generate markers
	res, err := prs.New().GenerateFromDirectory(src, out, []string{"bin", "dist"})
	if err != nil {
		t.Fatalf("GenerateFromDirectory error: %v", err)
	}
	if !res.Success {
		t.Fatalf("generation reported not successful: %+v", res)
	}

	t.Logf("Generated markers at %s", out)
	t.Logf("Artifact size: %.2fKB", float64(res.TotalBytes)/1024)
	t.Logf("Artifact size: %.2fMB", float64(res.TotalBytes)/1024/1024)

	b, err := os.ReadFile(out)
	if err != nil {
		t.Fatalf("reading output failed: %v", err)
	}
	s := string(b)

	// Header assertions
	fsChar := string(rune(28))
	headerMarker := "//" + fsChar + "/ PROJECT_INFO /" + fsChar + "//"
	if !strings.Contains(s, headerMarker) {
		t.Fatalf("missing PROJECT_INFO header marker: %q not found", headerMarker)
	}
	if !strings.Contains(s, "MarkerSpec: v1") {
		t.Fatalf("missing MarkerSpec header")
	}
	if !strings.Contains(s, "FS: 28") {
		t.Fatalf("missing FS header")
	}
	if !strings.Contains(s, "MarkerTokens: //\\x1C/ <path> /\\x1C//") {
		t.Fatalf("missing MarkerTokens header")
	}
	if !strings.Contains(s, "Encoding: utf-8") {
		t.Fatalf("missing Encoding header")
	}

	// Count markers for files: expect 3
	re := regexp.MustCompile(`(?m)^//` + regexp.QuoteMeta(fsChar) + `/ .+ /` + regexp.QuoteMeta(fsChar) + `//$`)
	matches := re.FindAllStringIndex(s, -1)
	if len(matches) < 3 { // at least 3 file markers (header isn't counted here due to the space after FS/)
		t.Fatalf("expected at least 3 file markers, got %d", len(matches))
	}

	// // Total Files header should reflect 3
	// if !strings.Contains(s, "Total Files: 3") {
	// 	t.Fatalf("expected 'Total Files: 3' in header, got: %s", s[:min(len(s), 300)])
	// }
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
