// Package config provides functions to manage and manipulate configuration settings.
package config

import (
	"github.com/kubex-ecosystem/lookatni-file-markers/config/embedded"
	"github.com/kubex-ecosystem/lookatni-file-markers/internal/module/kbx"
)

type LktConfig struct {
	*kbx.InitArgs
	*embedded.LktEmbeddedReader
}

func LoadEmbeddedConfig(initArgs kbx.InitArgs) (*LktConfig, error) {
	ler, err := embedded.NewLktEmbeddedReader()
	if err != nil {
		return nil, err
	}
	lktConfig := &LktConfig{
		InitArgs:          getInitArgsHardCopy(initArgs),
		LktEmbeddedReader: ler,
	}
	return lktConfig, nil
}

func getInitArgsHardCopy(initArgs kbx.InitArgs) *kbx.InitArgs {
	return kbx.NewInitArgs(
		initArgs.ConfigFile,
		initArgs.ConfigType,
		initArgs.ConfigDBFile,
		initArgs.ConfigDBType,
		initArgs.EnvFile,
		initArgs.LogFile,

		initArgs.Cwd,
		initArgs.TempDir,

		initArgs.Name,
		initArgs.Debug,
		initArgs.ReleaseMode,
		initArgs.IsConfidential,
		initArgs.Background,

		initArgs.Port,
		initArgs.Bind,
		initArgs.PubCertKeyPath,
		initArgs.PubKeyPath,
		initArgs.PrivKeyPath,

		initArgs.Timeout,
		initArgs.HistorySize,
		initArgs.DefaultProvider,
		initArgs.DefaultTemperature,
		initArgs.ProviderConfigPath,

		initArgs.OpenAIConfig,
		initArgs.ChatGPTConfig,
		initArgs.ClaudeConfig,
		initArgs.AnthropicConfig,
		initArgs.DeepSeekConfig,
		initArgs.GeminiConfig,
		initArgs.OllamaConfig,

		initArgs.NotificationProvider,
		initArgs.NotificationTimeoutSeconds,
	)
}
