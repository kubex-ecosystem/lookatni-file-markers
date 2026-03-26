// Package kubing provides functionality for extracting, normalizing, and comparing code blocks.
package kubing

import (
	"bufio"
	"crypto/sha256"
	"encoding/hex"
	"regexp"
	"strings"
	"unicode"
)

type Block struct {
	FilePath   string
	StartLine  int
	EndLine    int
	RawText    string
	Normalized string
	Hash       string
}

// regexes bem simples pra comentários comuns
var (
	lineCommentRE   = regexp.MustCompile(`(?m)//.*$`)
	hashCommentRE   = regexp.MustCompile(`(?m)^\s*#.*$`)
	blockCommentRE  = regexp.MustCompile(`(?s)/\*.*?\*/`)
	multiSpaceRE    = regexp.MustCompile(`\s+`)
	lookAtniMarker  = regexp.MustCompile(`^//\s*/\s+.+\s+/`)
	declarationHead = regexp.MustCompile(`^\s*(func|type|class|interface|export|const|var|let|async)\b`)
)

// normalizeText tenta tirar ruído cosmético mantendo a estrutura lógica.
func normalizeText(s string) string {
	// Remove marcadores LookAtni de caminho.
	s = lookAtniMarker.ReplaceAllString(s, "")

	// Remove comentários de linha com //
	s = lineCommentRE.ReplaceAllString(s, "")

	// Remove comentários com #
	s = hashCommentRE.ReplaceAllString(s, "")

	// Remove comentários de bloco /* ... */
	s = blockCommentRE.ReplaceAllString(s, "")

	// Coloca tudo em lower-case.
	s = strings.ToLower(s)

	// Normaliza whitespace.
	s = multiSpaceRE.ReplaceAllString(s, " ")

	// Remove espaços nos extremos de cada linha.
	var cleanedLines []string
	scanner := bufio.NewScanner(strings.NewReader(s))
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}
		cleanedLines = append(cleanedLines, line)
	}

	return strings.Join(cleanedLines, "\n")
}

// computeHash gera um SHA-256 do texto normalizado.
func computeHash(normalized string) string {
	sum := sha256.Sum256([]byte(normalized))
	return hex.EncodeToString(sum[:])
}

// isProbablyDeclaration tenta identificar começo de bloco lógico.
func isProbablyDeclaration(line string) bool {
	line = strings.TrimSpace(line)
	if line == "" {
		return false
	}
	// Se a linha começa com letra e está "colada" na esquerda, provavelmente é algo relevante.
	if declarationHead.MatchString(line) {
		return true
	}
	// Funções JS/TS anônimas etc.
	if strings.HasPrefix(line, "function ") {
		return true
	}
	return false
}

// isBlankLine auxilia na detecção de separações suaves.
func isBlankLine(line string) bool {
	for _, r := range line {
		if !unicode.IsSpace(r) {
			return false
		}
	}
	return true
}
