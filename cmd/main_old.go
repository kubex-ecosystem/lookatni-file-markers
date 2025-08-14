// Package main provides the LookAtni File Markers CLI application.
package main

import (
	"flag"
	"fmt"
	"os"

	l "github.com/rafa-mori/logz"
	"github.com/rafa-mori/lookatni-file-markers/internal/app"
	"github.com/rafa-mori/lookatni-file-markers/internal/metadata"
	"github.com/rafa-mori/lookatni-file-markers/internal/vscode"
	gl "github.com/rafa-mori/lookatni-file-markers/logger"
	"github.com/rafa-mori/lookatni-file-markers/version"
)

func Main() {
	var (
		versionFlag = flag.Bool("version", false, "Show version information")
		vscodeMode  = flag.Bool("vscode", false, "Run in VS Code integration mode")
		port        = flag.Int("port", 8080, "Port for VS Code integration server")
		//verbose     = flag.Bool("v", false, "Enable verbose logging")
		listPresets = flag.Bool("list-presets", false, "List available marker presets")
	)
	flag.Parse()

	// Initialize logger
	log := gl.GetLogger[l.Logger](nil) /* logger.New(logger.Config{
		Verbose: *verbose,
		Prefix:  "lookatni",
	}) */

	if *listPresets {
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
		return
	}

	if *versionFlag {
		fmt.Printf("LookAtni File Markers v%s\n", version.Version)
		fmt.Printf("Build: %s\n", version.BuildHash)
		fmt.Printf("Date: %s\n", version.BuildDate)
		return
	}

	if *vscodeMode {
		// Start VS Code integration server
		server := vscode.NewServer(log, *port)
		log.Log("info", "🔌 Starting VS Code integration server on port %d", *port)
		if err := server.Start(); err != nil {
			log.Log("error", "Failed to start VS Code server: %v", err)
			os.Exit(1)
		}
		return
	}

	// Run CLI application
	cliApp := app.New(log)
	if err := cliApp.Run(flag.Args()); err != nil {
		log.Log("error", "CLI error: %v", err)
		os.Exit(1)
	}
}
