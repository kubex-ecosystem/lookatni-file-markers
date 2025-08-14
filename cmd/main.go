// Package main provides the LookAtni File Markers CLI application.
package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/rafa-mori/lookatni-file-markers/internal/app"
	"github.com/rafa-mori/lookatni-file-markers/internal/vscode"
	"github.com/rafa-mori/lookatni-file-markers/logger"
	"github.com/rafa-mori/lookatni-file-markers/version"
)

func main() {
	var (
		versionFlag = flag.Bool("version", false, "Show version information")
		vscodeMode  = flag.Bool("vscode", false, "Run in VS Code integration mode")
		port        = flag.Int("port", 8080, "Port for VS Code integration server")
		verbose     = flag.Bool("v", false, "Enable verbose logging")
	)
	flag.Parse()

	// Initialize logger
	log := logger.New(logger.Config{
		Verbose: *verbose,
		Prefix:  "lookatni",
	})

	if *versionFlag {
		fmt.Printf("LookAtni File Markers v%s\n", version.Version)
		fmt.Printf("Build: %s\n", version.BuildHash)
		fmt.Printf("Date: %s\n", version.BuildDate)
		return
	}

	if *vscodeMode {
		// Start VS Code integration server
		server := vscode.NewServer(log, *port)
		log.Info("🔌 Starting VS Code integration server on port %d", *port)
		if err := server.Start(); err != nil {
			log.Error("Failed to start VS Code server: %v", err)
			os.Exit(1)
		}
		return
	}

	// Run CLI application
	cliApp := app.New(log)
	if err := cliApp.Run(flag.Args()); err != nil {
		log.Error("CLI error: %v", err)
		os.Exit(1)
	}
}
