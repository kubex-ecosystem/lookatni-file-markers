# 📚 LookAtni Documentation Site

Welcome to the documentation source for LookAtni File Markers! This directory contains the complete documentation website built with MkDocs and Material Theme.

## 🌐 Live Documentation

Visit the live documentation at: **<https://rafa-mori.github.io/lookatni-file-markers>**

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- uv (modern Python package and project manager)

### Install uv

```bash
# Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh
# or
pip install uv
```

### Local Development

1. **Install dependencies**:

   ```bash
   cd docs-site
   uv sync
   ```

2. **Start development server**:

   ```bash
   uv run mkdocs serve
   ```

3. **Open browser**: <http://localhost:8000>

4. **Edit and see live changes**!

### Build for Production

```bash
uv run mkdocs build
```

The built site will be in the `site/` directory.

## 📁 Site Structure

```plaintext
docs-site/
├── mkdocs.yml              # Main configuration
├── requirements.txt        # Python dependencies
├── docs/                   # Documentation content
│   ├── index.md           # Homepage
│   ├── getting-started/   # Installation & quick start
│   ├── features/          # Feature documentation
│   ├── guide/             # User guides
│   ├── advanced/          # Advanced topics
│   ├── examples/          # Real-world examples
│   ├── stylesheets/       # Custom CSS
│   └── javascripts/       # Custom JavaScript
└── site/                  # Built site (auto-generated)
```

## ✨ Features

### Modern Design

- **Material Design** theme with custom styling
- **Dark/Light mode** toggle
- **Responsive design** for all devices
- **Beautiful animations** and transitions

### Enhanced Navigation

- **Tabbed navigation** for easy browsing
- **Search functionality** with suggestions
- **Table of contents** with auto-scroll
- **Breadcrumb navigation**

### Content Features

- **Syntax highlighting** for all languages
- **Copy-to-clipboard** buttons on code blocks
- **Admonitions** for tips, warnings, examples
- **Mermaid diagrams** support
- **Emoji support** 🎉

### SEO & Performance

- **Optimized for search engines**
- **Minified HTML/CSS/JS**
- **Fast loading times**
- **Progressive web app** features

## 🎨 Customization

### Theme Colors

The site uses a purple/deep-purple color scheme that matches the LookAtni brand:

- **Primary**: Deep Purple
- **Accent**: Purple
- **Custom gradients** for hero sections

### Custom Styles

Located in `docs/stylesheets/extra.css`:

- Hero banner styling
- Feature cards grid
- Enhanced code blocks
- Custom animations

### JavaScript Enhancements

Located in `docs/javascripts/extra.js`:

- Copy buttons for code blocks
- Animated counters
- Interactive command examples
- Keyboard shortcuts

## 📝 Writing Documentation

### Markdown Extensions

The site supports advanced Markdown features:

- **Admonitions**: `!!! tip "Title"`
- **Code tabs**: `=== "Tab 1"`
- **Task lists**: `- [x] Completed task`
- **Footnotes**: `Text[^1]`
- **Math**: `$E = mc^2$`

### Content Guidelines

1. **Use clear headings** (H1 for title, H2 for sections)
2. **Include code examples** with syntax highlighting
3. **Add admonitions** for important information
4. **Use emoji** sparingly for visual appeal
5. **Link between pages** for better navigation

### Adding New Pages

1. **Create markdown file** in appropriate directory
2. **Add to navigation** in `mkdocs.yml`
3. **Test locally** with `mkdocs serve`
4. **Commit and push** to deploy

## 🚀 Deployment

### Automatic Deployment

The site automatically deploys to GitHub Pages when:

- Changes are pushed to `main` branch
- Files in `docs-site/` are modified
- Manual workflow dispatch is triggered

### Manual Deployment

```bash
# Build and deploy
uv run mkdocs gh-deploy

# Or build locally and push
uv run mkdocs build
# Then copy site/ contents to gh-pages branch
```

## 🛠️ Development Tips

### Live Reload

Use `uv run mkdocs serve` for instant preview of changes while editing.

### Navigation Testing

Always test navigation after adding new pages:

- Check all internal links work
- Verify breadcrumbs are correct
- Test on mobile devices

### Content Validation

- Use markdown linters
- Check for broken links
- Validate code examples
- Test on different browsers

## 📊 Analytics & Monitoring

The site includes:

- **Google Analytics** (optional)
- **Performance monitoring**
- **Search tracking**
- **User feedback** collection

## 🤝 Contributing

To contribute to the documentation:

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b docs/new-feature`
3. **Make changes** in `docs-site/`
4. **Test locally**: `uv run mkdocs serve`
5. **Submit pull request**

### Writing Style

- **Clear and concise** language
- **Active voice** when possible
- **Step-by-step instructions**
- **Real-world examples**
- **Consistent terminology**

## 📞 Support

For documentation issues:

- **Create GitHub issue** for bugs or improvements
- **Start discussion** for questions
- **Submit PR** for direct fixes

---

***Built with ❤️ using MkDocs Material***

The LookAtni documentation revolution starts here! 🚀
