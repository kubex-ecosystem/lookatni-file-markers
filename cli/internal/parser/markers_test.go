package parser

import (
    "os"
    "path/filepath"
    "regexp"
    "strings"
    "testing"
)

func TestGenerateFromDirectory_HeaderAndCount(t *testing.T) {
    tmp := t.TempDir()

    // Create sample files
    mustWrite(t, filepath.Join(tmp, "README.md"), "# Hello\n")
    mustWrite(t, filepath.Join(tmp, "src", "index.js"), "console.log('ok')\n")
    mustWrite(t, filepath.Join(tmp, "extras", "test.txt"), "ok\n")

    out := filepath.Join(tmp, "out.lkt")

    mp := New()
    res, err := mp.GenerateFromDirectory(tmp, out, []string{})
    if err != nil {
        t.Fatalf("GenerateFromDirectory error: %v", err)
    }
    if !res.Success {
        t.Fatalf("generation reported not successful: %+v", res)
    }

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

    // Total Files header should reflect 3
    if !strings.Contains(s, "Total Files: 3") {
        t.Fatalf("expected 'Total Files: 3' in header, got: %s", s[:min(len(s), 300)])
    }
}

func mustWrite(t *testing.T, path string, content string) {
    t.Helper()
    if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
        t.Fatalf("mkdir: %v", err)
    }
    if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
        t.Fatalf("write: %v", err)
    }
}

func min(a, b int) int { if a < b { return a }; return b }

