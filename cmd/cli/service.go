package cli

import (
	"fmt"

	"github.com/rafa-mori/lookatni-file-markers/internal/app"
	"github.com/rafa-mori/lookatni-file-markers/internal/metadata"
	"github.com/rafa-mori/lookatni-file-markers/internal/vscode"
	gl "github.com/rafa-mori/lookatni-file-markers/logger"
	"github.com/spf13/cobra"
)

func ServiceCmdList() []*cobra.Command {
	return []*cobra.Command{
		extractCommand(),
		validateCommand(),
		generateCommand(),
		transpileCommand(),
		presetsCommand(),
		vscodeCommand(),
		refactorCommand(),
	}
}

// extractCommand handles file extraction from marked files.
func extractCommand() *cobra.Command {
	var overwrite, createDirs, dryRun bool

	var extractCmd = &cobra.Command{
		Use:   "extract <marked-file> <output-dir>",
		Short: "Extract files FROM marked content",
		Long:  "Extract files from a LookAtni marked file to a directory structure.",
		Args:  cobra.ExactArgs(2),
		Annotations: GetDescriptions([]string{
			"Extract files from marked content to directory structure",
			"Extract files FROM marked content",
		}, false),
		RunE: func(cmd *cobra.Command, args []string) error {
			markedFile := args[0]
			outputDir := args[1]

			// Initialize app
			cliApp := app.New(nil)

			// Build options
			options := []string{
				"extract",
				markedFile,
				outputDir,
			}
			if overwrite {
				options = append(options, "--overwrite")
			}
			if createDirs {
				options = append(options, "--create-dirs")
			}
			if dryRun {
				options = append(options, "--dry-run")
			}

			return cliApp.Run(options)
		},
	}

	extractCmd.Flags().BoolVar(&overwrite, "overwrite", false, "Overwrite existing files")
	extractCmd.Flags().BoolVar(&createDirs, "create-dirs", true, "Create directories as needed")
	extractCmd.Flags().BoolVar(&dryRun, "dry-run", false, "Show what would be done without doing it")

	return extractCmd
}

// validateCommand handles marker validation.
func validateCommand() *cobra.Command {
	var validateCmd = &cobra.Command{
		Use:   "validate <marked-file>",
		Short: "Validate markers in consolidated file",
		Long:  "Validate the integrity and structure of markers in a LookAtni marked file.",
		Args:  cobra.ExactArgs(1),
		Annotations: GetDescriptions([]string{
			"Validate markers in a consolidated LookAtni file",
			"Validate markers in consolidated file",
		}, false),
		RunE: func(cmd *cobra.Command, args []string) error {
			markedFile := args[0]

			// Initialize app
			cliApp := app.New(nil)

			return cliApp.Run([]string{"validate", markedFile})
		},
	}

	return validateCmd
}

// generateCommand handles project consolidation (directory -> marked file).
func generateCommand() *cobra.Command {
	var excludePatterns []string
	var markerPreset, markerStart, markerEnd, markerPattern string

	var generateCmd = &cobra.Command{
		Use:   "generate <source-dir> <output-file>",
		Short: "Consolidate directory INTO marked file",
		Long:  "Generate a LookAtni marked file from a directory structure, consolidating all files.",
		Args:  cobra.ExactArgs(2),
		Annotations: GetDescriptions([]string{
			"Consolidate directory structure into a single marked file",
			"Consolidate directory INTO marked file",
		}, false),
		RunE: func(cmd *cobra.Command, args []string) error {
			sourceDir := args[0]
			outputFile := args[1]

			// Initialize app
			cliApp := app.New(nil)

			// Build options
			options := []string{
				"generate",
				sourceDir,
				outputFile,
			}

			// Add exclude patterns
			for _, pattern := range excludePatterns {
				options = append(options, "--exclude", pattern)
			}

			// TODO: Handle custom marker options when adaptive parser is fully implemented
			_ = markerPreset
			_ = markerStart
			_ = markerEnd
			_ = markerPattern

			return cliApp.Run(options)
		},
	}

	generateCmd.Flags().StringSliceVar(&excludePatterns, "exclude", []string{"*.log", "node_modules", ".git"}, "Exclude files matching pattern")
	generateCmd.Flags().StringVar(&markerPreset, "marker-preset", "", "Use predefined marker format (html, markdown, code, visual)")
	generateCmd.Flags().StringVar(&markerStart, "marker-start", "", "Custom marker start pattern")
	generateCmd.Flags().StringVar(&markerEnd, "marker-end", "", "Custom marker end pattern")
	generateCmd.Flags().StringVar(&markerPattern, "marker-pattern", "", "Custom marker pattern with {filename} placeholder")

	return generateCmd
}

// transpileCommand handles Markdown to HTML transpilation.
func transpileCommand() *cobra.Command {
	var transpileCmd = &cobra.Command{
		Use:   "transpile <input> <output-dir>",
		Short: "Convert Markdown to HTML (NEW!)",
		Long:  "Convert Markdown files to HTML with prompt block DSL support and template generation.",
		Args:  cobra.ExactArgs(2),
		Annotations: GetDescriptions([]string{
			"Convert Markdown files to HTML with advanced templating",
			"Convert Markdown to HTML (NEW!)",
		}, false),
		RunE: func(cmd *cobra.Command, args []string) error {
			input := args[0]
			outputDir := args[1]

			// Initialize app
			cliApp := app.New(nil)

			return cliApp.Run([]string{"transpile", input, outputDir})
		},
	}

	return transpileCmd
}

// presetsCommand lists available marker presets.
func presetsCommand() *cobra.Command {
	var presetsCmd = &cobra.Command{
		Use:   "presets",
		Short: "List available marker presets",
		Long:  "Display all available marker presets with examples and descriptions.",
		Args:  cobra.NoArgs,
		Annotations: GetDescriptions([]string{
			"List all available marker presets for custom formatting",
			"List available marker presets",
		}, false),
		RunE: func(cmd *cobra.Command, args []string) error {
			fmt.Println("🎨 Available Marker Presets:\n")
			presets := metadata.GetPresetConfigs()
			for name, preset := range presets {
				fmt.Printf("  %s: %s\n", name, preset.Name)
				fmt.Printf("    %s\n", preset.Description)

				// Show example
				example := preset.Config.FormatMarker("example.go")
				if example != "" {
					fmt.Printf("    Example: %s\n", example)
				}
				fmt.Println()
			}
			return nil
		},
	}

	return presetsCmd
}

// vscodeCommand starts the VS Code integration server.
func vscodeCommand() *cobra.Command {
	var port int

	var vscodeCmd = &cobra.Command{
		Use:   "vscode",
		Short: "Start VS Code integration server",
		Long:  "Start the HTTP server for VS Code extension integration and communication.",
		Args:  cobra.NoArgs,
		Annotations: GetDescriptions([]string{
			"Start HTTP server for VS Code extension integration",
			"Start VS Code integration server",
		}, false),
		RunE: func(cmd *cobra.Command, args []string) error {
			// Start VS Code integration server
			server := vscode.NewServer(nil, port)
			gl.Log("info", "🌐 Starting VS Code integration server on port %d", port)

			if err := server.Start(); err != nil {
				gl.Log("error", "Failed to start VS Code server: %v", err)
				return err
			}
			return nil
		},
	}

	vscodeCmd.Flags().IntVarP(&port, "port", "p", 8080, "Port for VS Code integration server")

	return vscodeCmd
}

// refactorCommand handles AI-powered code refactoring using Grompt integration.
func refactorCommand() *cobra.Command {
	var rulesFile, provider, outputDir string
	var dryRun, interactive bool

	var refactorCmd = &cobra.Command{
		Use:   "refactor <artifact-file> [options]",
		Short: "AI-powered code refactoring with Grompt",
		Long: `Refactor code using AI through Grompt integration.

This command implements the LookAtni refactor loop:
1. Reads an artifact file (generated by 'lookatni generate')
2. Sends it to AI providers for analysis and improvement suggestions
3. Applies refactoring based on specified rules
4. Optionally extracts the improved code back to files

Supports multiple AI providers (OpenAI, Claude, Gemini, etc.) and custom refactoring rules.`,
		Args: cobra.ExactArgs(1),
		Annotations: GetDescriptions([]string{
			"AI-powered code refactoring using Grompt integration",
			"AI-powered code refactoring with Grompt",
		}, false),
		RunE: func(cmd *cobra.Command, args []string) error {
			artifactFile := args[0]

			// Initialize app
			cliApp := app.New(nil)

			// Build options for refactor
			options := []string{
				"refactor",
				artifactFile,
			}

			if rulesFile != "" {
				options = append(options, "--rules", rulesFile)
			}
			if provider != "" {
				options = append(options, "--provider", provider)
			}
			if outputDir != "" {
				options = append(options, "--output", outputDir)
			}
			if dryRun {
				options = append(options, "--dry-run")
			}
			if interactive {
				options = append(options, "--interactive")
			}

			return cliApp.Run(options)
		},
	}

	refactorCmd.Flags().StringVar(&rulesFile, "rules", "docs/prompt/my-rules.md", "Path to refactoring rules file")
	refactorCmd.Flags().StringVar(&provider, "provider", "", "AI provider to use (openai, claude, gemini, deepseek, ollama)")
	refactorCmd.Flags().StringVar(&outputDir, "output", "", "Output directory for refactored files (if not specified, modifies artifact in-place)")
	refactorCmd.Flags().BoolVar(&dryRun, "dry-run", false, "Show refactoring suggestions without applying them")
	refactorCmd.Flags().BoolVar(&interactive, "interactive", false, "Interactive mode: review each suggestion before applying")

	return refactorCmd
}
