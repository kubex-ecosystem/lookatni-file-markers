package main

import (
	gl "github.com/kubex-ecosystem/logz/logger"
	"github.com/kubex-ecosystem/lookatni-file-markers/internal/module"
)

// main initializes the logger and creates a new LookAtni instance.
func main() {
	if err := module.RegX().Command().Execute(); err != nil {
		gl.Log("fatal", err.Error())
	}
}
