// Package logger provides structured logging for LookAtni File Markers.
package logger

import (
	"fmt"
	"log"
	"os"
	"time"
)

// Config holds logger configuration.
type Config struct {
	Verbose bool
	Prefix  string
}

// Logger provides structured logging with different levels.
type Logger struct {
	verbose bool
	prefix  string
	info    *log.Logger
	warn    *log.Logger
	error   *log.Logger
	debug   *log.Logger
}

// New creates a new logger instance.
func New(config Config) *Logger {
	prefix := config.Prefix
	if prefix == "" {
		prefix = "lookatni"
	}

	return &Logger{
		verbose: config.Verbose,
		prefix:  prefix,
		info:    log.New(os.Stdout, fmt.Sprintf("✅ [%s] ", prefix), 0),
		warn:    log.New(os.Stdout, fmt.Sprintf("⚠️  [%s] ", prefix), 0),
		error:   log.New(os.Stderr, fmt.Sprintf("❌ [%s] ", prefix), 0),
		debug:   log.New(os.Stdout, fmt.Sprintf("🔍 [%s] ", prefix), 0),
	}
}

// Info logs an info message.
func (l *Logger) Info(format string, args ...interface{}) {
	l.info.Printf(format, args...)
}

// Warn logs a warning message.
func (l *Logger) Warn(format string, args ...interface{}) {
	l.warn.Printf(format, args...)
}

// Error logs an error message.
func (l *Logger) Error(format string, args ...interface{}) {
	l.error.Printf(format, args...)
}

// Debug logs a debug message (only if verbose is enabled).
func (l *Logger) Debug(format string, args ...interface{}) {
	if l.verbose {
		l.debug.Printf(format, args...)
	}
}

// WithTimestamp adds timestamp to message.
func (l *Logger) WithTimestamp(format string, args ...interface{}) string {
	timestamp := time.Now().Format("15:04:05")
	return fmt.Sprintf("[%s] %s", timestamp, fmt.Sprintf(format, args...))
}
