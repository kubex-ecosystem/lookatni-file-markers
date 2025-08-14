// Package version provides build-time version information.
package version

var (
	// Version is the semantic version of the application
	Version = "2.0.0-dev"

	// BuildHash is the git commit hash (injected at build time)
	BuildHash = "dev"

	// BuildDate is the build timestamp (injected at build time)
	BuildDate = "dev"

	// GoVersion is the Go version used for building
	GoVersion = "go1.23"
)

// Info returns version information as a structured object.
func Info() map[string]string {
	return map[string]string{
		"version":   Version,
		"buildHash": BuildHash,
		"buildDate": BuildDate,
		"goVersion": GoVersion,
	}
}
