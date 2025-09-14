package main

import (
	"github.com/kubex-ecosystem/lookatni-file-markers/internal/module"
	gl "github.com/kubex-ecosystem/lookatni-file-markers/internal/module/logger"
)

// main initializes the logger and creates a new LookAtni instance.
func main() {
	if err := module.RegX().Command().Execute(); err != nil {
		gl.Log("fatal", err.Error())
	}
}
