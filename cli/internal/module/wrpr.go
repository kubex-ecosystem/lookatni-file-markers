package module

import (
	"os"
	"strings"
)

func RegX() *LookAtni {
	var printBannerV = os.Getenv("GROMPT_PRINT_BANNER")
	if printBannerV == "" {
		printBannerV = "true"
	}

	return &LookAtni{
		printBanner: strings.ToLower(printBannerV) == "true",
	}
}
