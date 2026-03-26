package main

import (
	l "github.com/kubex-ecosystem/logz"
	gl "github.com/kubex-ecosystem/logz/logger"
	"github.com/kubex-ecosystem/lookatni-file-markers/internal/module"
)

var logger = l.GetLogger("lookatni")

func init() {
	l.SetLogger(logger)
	// l.SetLogConfig(logz.LoggerZ.GetConfig())

	l.SetLogLevel("info")
	// l.SetLogWriter(logz.LoggerZ.GetWriter())
}

// main initializes the logger and creates a new LookAtni instance.
func main() {

	if err := module.RegX().Command().Execute(); err != nil {
		gl.Log("fatal", err.Error())
	}
}
