package cli

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/kubex-ecosystem/lookatni-file-markers/internal/kubing"
	"github.com/spf13/cobra"
)

func KubingCmd() *cobra.Command {
	short := `Kubing: Compara blocos de código entre dois projetos/arquivos.`
	long := `Kubing: Compara blocos de código entre dois projetos/arquivos.
Ele carrega blocos de código de um projeto/arquivo de origem e os compara com blocos de um projeto/arquivo de destino, reportando correspondências acima de um limiar de similaridade especificado.`

	cmd := &cobra.Command{
		Use:   "kubing -src <origem> -dst <destino> [-blob] [-t 0.82] [--json]",
		Short: short,
		Long: long,
		Args: cobra.NoArgs,
		Annotations: GetDescriptions([]string{
			short,
			long,
		}, false),
		Run: func(cmd *cobra.Command, args []string) {
			runKubingCmp(input, outputDir, blobMode, threshold, jsonOut)
		},
	}

	cmd.Flags().StringVar(&input, "src", "", "caminho do projeto/arquivo de origem (ex: blob LKT ou diretório original)")
	cmd.Flags().StringVar(&outputDir, "dst", "", "caminho do projeto destino (ex: workspace gerado pela AI)")
	cmd.Flags().BoolVar(&blobMode, "blob", false, "interpreta src como um único blob/arquivo em vez de diretório")
	cmd.Flags().Float64Var(&threshold, "t", 0.82, "similaridade mínima (0.0–1.0) para reportar match")
	cmd.Flags().BoolVar(&jsonOut, "json", false, "saída em JSON")

	return cmd
}

func runKubingCmp(input, outputDir string, blobMode bool, threshold float64, jsonOut bool) {

	if input == "" || outputDir == "" {
		fmt.Fprintln(os.Stderr, "uso: kubingcmp -src <origem> -dst <destino> [-blob] [-t 0.82] [--json]")
		os.Exit(1)
	}

	cfg := kubing.DefaultConfig()
	cfg.SimilarityThreshold = threshold

	start := time.Now()

	var (
		srcBlocks []kubing.Block
		dstBlocks []kubing.Block
		err       error
	)

	if blobMode {
		srcBlocks, err = kubing.LoadBlocksFromBlobFile(input, cfg)
	} else {
		srcBlocks, err = kubing.LoadBlocksFromDir(input, cfg)
	}
	if err != nil {
		fmt.Fprintf(os.Stderr, "erro ao carregar blocos de origem: %v\n", err)
		os.Exit(1)
	}

	dstBlocks, err = kubing.LoadBlocksFromDir(outputDir, cfg)
	if err != nil {
		fmt.Fprintf(os.Stderr, "erro ao carregar blocos de destino: %v\n", err)
		os.Exit(1)
	}

	matches := kubing.CompareBlocks(srcBlocks, dstBlocks, cfg)
	elapsed := time.Since(start)

	if jsonOut {
		type jsonMatch struct {
			SourceFile string  `json:"source_file"`
			SourceFrom int     `json:"source_from"`
			SourceTo   int     `json:"source_to"`
			TargetFile string  `json:"target_file"`
			TargetFrom int     `json:"target_from"`
			TargetTo   int     `json:"target_to"`
			Similarity float64 `json:"similarity"`
		}
		var out []jsonMatch
		for _, m := range matches {
			out = append(out, jsonMatch{
				SourceFile: rel(m.Source.FilePath),
				SourceFrom: m.Source.StartLine,
				SourceTo:   m.Source.EndLine,
				TargetFile: rel(m.Target.FilePath),
				TargetFrom: m.Target.StartLine,
				TargetTo:   m.Target.EndLine,
				Similarity: m.Similarity,
			})
		}
		enc := json.NewEncoder(os.Stdout)
		enc.SetIndent("", "  ")
		if err := enc.Encode(map[string]interface{}{
			"src":       input,
			"dst":       outputDir,
			"threshold": threshold,
			"matches":   out,
			"elapsed":   elapsed.String(),
		}); err != nil {
			fmt.Fprintf(os.Stderr, "erro ao gerar JSON: %v\n", err)
			os.Exit(1)
		}
		return
	}

	fmt.Printf("Fonte:   %s\n", input)
	fmt.Printf("Destino: %s\n", outputDir)
	fmt.Printf("Blocks src: %d | dst: %d | threshold: %.2f | tempo: %s\n\n",
		len(srcBlocks), len(dstBlocks), threshold, elapsed)

	if len(matches) == 0 {
		fmt.Println("Nenhum match acima do limiar.")
		return
	}

	for i, m := range matches {
		fmt.Printf("Match #%d (sim = %.3f)\n", i+1, m.Similarity)
		fmt.Printf("  SRC: %s:%d-%d\n", rel(m.Source.FilePath), m.Source.StartLine, m.Source.EndLine)
		fmt.Printf("  DST: %s:%d-%d\n", rel(m.Target.FilePath), m.Target.StartLine, m.Target.EndLine)
		fmt.Println()
	}
}

func rel(path string) string {
	if r, err := filepath.Rel(".", path); err == nil {
		return r
	}
	return path
}
