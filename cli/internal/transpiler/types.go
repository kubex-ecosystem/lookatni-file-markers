package transpiler

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
