// Package embedded provides functions to read and parse embedded template files.
package embedded

import (
	"embed"
	"io/fs"
)

// //go:embed all:templates/*
var mdEmbeddedFilesList embed.FS

type LktEmbeddedReader struct {
	FS                    fs.FS         `json:"-" mapstructure:"-"`
	EFS                   []fs.DirEntry `json:"-" mapstructure:"-"`
	TemplateBaseContent   []byte        `json:"-" mapstructure:"-"`
	TemplateParentContent []byte        `json:"-" mapstructure:"-"`
	TemplateNestedContent []byte        `json:"-" mapstructure:"-"`
}

func NewLktEmbeddedReader() (*LktEmbeddedReader, error) {
	lktEmbeddedReader := &LktEmbeddedReader{
		FS: mdEmbeddedFilesList,
	}
	var err error
	// Read the directory entries from the embedded filesystem
	lktEmbeddedReader.EFS, err = fs.ReadDir(lktEmbeddedReader.FS, "templates")
	if err != nil {
		return nil, err
	}
	// Read the base.html template content
	lktEmbeddedReader.TemplateBaseContent, err = fs.ReadFile(lktEmbeddedReader.FS, "templates/base.html")
	if err != nil {
		return nil, err
	}
	// Read the parent.html.tmpl template content
	lktEmbeddedReader.TemplateParentContent, err = fs.ReadFile(lktEmbeddedReader.FS, "templates/parent.html.tmpl")
	if err != nil {
		return nil, err
	}
	// Read the nested.html.tmpl template content
	lktEmbeddedReader.TemplateNestedContent, err = fs.ReadFile(lktEmbeddedReader.FS, "templates/nested.html.tmpl")
	if err != nil {
		return nil, err
	}
	// Return the populated LktEmbeddedReader instance
	return lktEmbeddedReader, nil
}

func (ler *LktEmbeddedReader) GetEmbeddedFS() fs.FS                 { return ler.FS }
func (ler *LktEmbeddedReader) GetEmbeddedDirEntries() []fs.DirEntry { return ler.EFS }
func (ler *LktEmbeddedReader) GetTemplateBaseContent() []byte       { return ler.TemplateBaseContent }
func (ler *LktEmbeddedReader) GetTemplateParentContent() []byte     { return ler.TemplateParentContent }
func (ler *LktEmbeddedReader) GetTemplateNestedContent() []byte     { return ler.TemplateNestedContent }
