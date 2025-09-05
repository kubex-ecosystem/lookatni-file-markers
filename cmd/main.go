package main

import (
	l "github.com/rafa-mori/logz"
	"github.com/rafa-mori/lookatni-file-markers/internal/module"
	gl "github.com/rafa-mori/lookatni-file-markers/internal/module/logger"
)

var logger l.Logger

// main initializes the logger and creates a new LookAtni instance.
func main() {
	if err := module.RegX().Command().Execute(); err != nil {
		gl.Log("fatal", err.Error())
	}
}
