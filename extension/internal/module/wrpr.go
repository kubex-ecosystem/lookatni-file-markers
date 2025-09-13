package module

import (
	"os"
)

func RegX() *LookAtni {
	return &LookAtni{
		printBanner: os.Getenv("LOOKATNI_HIDEBANNER") == "true",
	}
}
