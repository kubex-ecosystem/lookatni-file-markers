package kubing

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

type Match struct {
	Source      Block
	Target      Block
	Similarity  float64
}

// ExtractBlocksFromFile lê um arquivo e quebra em blocos lógicos.
func ExtractBlocksFromFile(path string, cfg Config) ([]Block, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("open file: %w", err)
	}
	defer f.Close()

	var blocks []Block
	var buf []string
	lineNo := 0
	blockStart := 1

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		lineNo++
		line := scanner.Text()

		// Se já temos um bloco razoável e encontramos uma possível declaração,
		// fechamos o bloco atual e começamos um novo.
		if len(buf) >= cfg.MinLinesPerBlock && isProbablyDeclaration(line) {
			blocks = append(blocks, makeBlock(path, blockStart, lineNo-1, buf))
			buf = nil
			blockStart = lineNo
		} else if len(buf) >= cfg.MinLinesPerBlock && isBlankLine(line) {
			// Quebra mais suave: bloco grande seguido de linha em branco.
			blocks = append(blocks, makeBlock(path, blockStart, lineNo-1, buf))
			buf = nil
			blockStart = lineNo + 1
			continue
		}

		buf = append(buf, line)
	}

	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("scan file: %w", err)
	}

	// Último bloco.
	if len(buf) >= cfg.MinLinesPerBlock {
		blocks = append(blocks, makeBlock(path, blockStart, lineNo, buf))
	}

	return blocks, nil
}

func makeBlock(path string, start, end int, lines []string) Block {
	raw := strings.Join(lines, "\n")
	norm := normalizeText(raw)
	hash := computeHash(norm)

	return Block{
		FilePath:   path,
		StartLine:  start,
		EndLine:    end,
		RawText:    raw,
		Normalized: norm,
		Hash:       hash,
	}
}

// LoadBlocksFromDir varre um diretório recursivamente e extrai blocos.
func LoadBlocksFromDir(root string, cfg Config) ([]Block, error) {
	var blocks []Block
	err := filepath.WalkDir(root, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			return nil
		}
		if !hasAllowedExt(path, cfg.Extensions) {
			return nil
		}
		bs, err := ExtractBlocksFromFile(path, cfg)
		if err != nil {
			// Não falha o processo inteiro por um arquivo.
			fmt.Fprintf(os.Stderr, "warn: failed to extract blocks from %s: %v\n", path, err)
			return nil
		}
		blocks = append(blocks, bs...)
		return nil
	})
	if err != nil {
		return nil, err
	}
	return blocks, nil
}

// LoadBlocksFromBlobFile lê um blob grande (por exemplo, LKT) como se fosse um único arquivo.
func LoadBlocksFromBlobFile(blobPath string, cfg Config) ([]Block, error) {
	return ExtractBlocksFromFile(blobPath, cfg)
}

func hasAllowedExt(path string, exts []string) bool {
	ext := strings.ToLower(filepath.Ext(path))
	for _, e := range exts {
		if ext == strings.ToLower(e) {
			return true
		}
	}
	return false
}

// nGrams cria conjunto de n-gramas de caracteres.
func nGrams(s string, n int) map[string]struct{} {
	m := make(map[string]struct{})
	runes := []rune(s)
	if len(runes) < n {
		return m
	}
	for i := 0; i <= len(runes)-n; i++ {
		ng := string(runes[i : i+n])
		m[ng] = struct{}{}
	}
	return m
}

// jaccardSimilarity entre dois conjuntos de n-gramas.
func jaccardSimilarity(a, b map[string]struct{}) float64 {
	if len(a) == 0 || len(b) == 0 {
		return 0.0
	}
	var inter, uni int
	for k := range a {
		uni++
		if _, ok := b[k]; ok {
			inter++
		}
	}
	for k := range b {
		if _, ok := a[k]; !ok {
			uni++
		}
	}
	if uni == 0 {
		return 0.0
	}
	return float64(inter) / float64(uni)
}

// CompareBlocks compara blocos de src vs dst e retorna matches acima do threshold.
func CompareBlocks(srcBlocks, dstBlocks []Block, cfg Config) []Match {
	var matches []Match

	// Pré-calcula n-gramas pra todos os blocos.
	type grammed struct {
		block Block
		grams map[string]struct{}
	}
	var srcG, dstG []grammed

	for _, b := range srcBlocks {
		srcG = append(srcG, grammed{
			block: b,
			grams: nGrams(b.Normalized, 5),
		})
	}
	for _, b := range dstBlocks {
		dstG = append(dstG, grammed{
			block: b,
			grams: nGrams(b.Normalized, 5),
		})
	}

	for _, sb := range dstG { // destino = o que a AI "gerou"
		for _, cb := range srcG { // source = projeto original
			// Filtro rápido: se as linhas são muito diferentes de tamanho, ignora.
			lenSrc := cb.block.EndLine - cb.block.StartLine + 1
			lenDst := sb.block.EndLine - sb.block.StartLine + 1
			if lenSrc == 0 || lenDst == 0 {
				continue
			}
			ratio := float64(min(lenSrc, lenDst)) / float64(max(lenSrc, lenDst))
			if ratio < 0.4 {
				continue
			}

			sim := jaccardSimilarity(cb.grams, sb.grams)
			if sim >= cfg.SimilarityThreshold {
				matches = append(matches, Match{
					Source:     cb.block,
					Target:     sb.block,
					Similarity: sim,
				})
			}
		}
	}

	return matches
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
