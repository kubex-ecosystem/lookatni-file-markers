// Package integration demonstrates Grompt integration within LookAtni
package integration

import (
	"fmt"

	"github.com/rafa-mori/grompt"
	gl "github.com/rafa-mori/lookatni-file-markers/logger"
)

// GromptIntegration provides prompt engineering capabilities for LookAtni
type GromptIntegration struct {
	engine grompt.PromptEngine
	config grompt.Config
}

// NewGromptIntegration creates a new Grompt integration instance
func NewGromptIntegration() *GromptIntegration {
	config := grompt.DefaultConfig("")
	engine := grompt.NewPromptEngine(config)

	return &GromptIntegration{
		engine: engine,
		config: config,
	}
}

// ProcessMarkdownWithPrompts processes markdown content with prompt blocks
func (g *GromptIntegration) ProcessMarkdownWithPrompts(content string) (string, error) {
	if g.engine == nil {
		return content, fmt.Errorf("Grompt engine not initialized")
	}

	// Example: Process a simple prompt template
	variables := map[string]interface{}{
		"content": content,
		"task":    "markdown_processing",
	}

	template := "Process this markdown content: {{.content}} for task: {{.task}}"

	result, err := g.engine.ProcessPrompt(template, variables)
	if err != nil {
		gl.Log("warn", "Failed to process prompt: %v", err)
		return content, nil // Return original content on error
	}

	gl.Log("info", "✅ Processed markdown with Grompt - ID: %s", result.ID)
	return result.Response, nil
}

// GetAvailableProviders returns the list of available AI providers
func (g *GromptIntegration) GetAvailableProviders() []grompt.Provider {
	if g.engine == nil {
		return nil
	}
	return g.engine.GetProviders()
}

// GetProcessingHistory returns the history of processed prompts
func (g *GromptIntegration) GetProcessingHistory() []grompt.Result {
	if g.engine == nil {
		return nil
	}
	return g.engine.GetHistory()
}

// BatchProcessPrompts processes multiple prompts concurrently
func (g *GromptIntegration) BatchProcessPrompts(prompts []string, commonVars map[string]interface{}) ([]grompt.Result, error) {
	if g.engine == nil {
		return nil, fmt.Errorf("Grompt engine not initialized")
	}

	return g.engine.BatchProcess(prompts, commonVars)
}

// SaveInteraction manually saves a prompt/response pair to history
func (g *GromptIntegration) SaveInteraction(prompt, response string) error {
	if g.engine == nil {
		return fmt.Errorf("Grompt engine not initialized")
	}

	return g.engine.SaveToHistory(prompt, response)
}
