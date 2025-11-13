package kubing

type Config struct {
	// Extensões de arquivos a considerar (".ts", ".tsx", ".js", ".go", etc.)
	Extensions []string

	// Número mínimo de linhas por bloco lógico.
	MinLinesPerBlock int

	// Similaridade mínima (0.0–1.0) para considerar um match relevante.
	SimilarityThreshold float64
}

// DefaultConfig retorna uma configuração padrão razoável.
func DefaultConfig() Config {
	return Config{
		Extensions:          []string{".ts", ".tsx", ".js", ".jsx", ".go", ".py", ".rs", ".java", ".cs"},
		MinLinesPerBlock:    4,
		SimilarityThreshold: 0.82,
	}
}
