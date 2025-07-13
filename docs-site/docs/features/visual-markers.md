# 👁️ Visual Markers

Experience enhanced VS Code integration with interactive visual markers, syntax highlighting, and smart navigation features.

## Overview

Visual markers transform your VS Code experience by providing rich visual cues, interactive navigation, and intelligent highlighting for LookAtni marker files.

## Features

### 🎨 Syntax Highlighting

Beautiful syntax highlighting for marker files:

- **File boundaries** - Clear visual separation
- **Path highlighting** - Easy file identification  
- **Content preview** - Syntax-aware code display
- **Metadata display** - File size, type, and properties

### 🧭 Smart Navigation

Navigate large marker files effortlessly:

- **File tree view** - Explorer-style navigation
- **Quick jump** - Go to specific files instantly
- **Breadcrumb navigation** - Track your location
- **Search and filter** - Find files quickly

### ⚡ Interactive Features

Rich interactions within marker files:

- **Hover information** - File details on hover
- **Click to navigate** - Jump to file sections
- **Collapsible sections** - Fold/unfold file content
- **Preview mode** - Quick content preview

## Visual Elements

### File Boundary Markers

```lookatni
═══════════════════════════════════════════════════════════════════
📁 PROJECT: my-react-app
🗂️ FILE: src/components/Header.tsx
📊 SIZE: 2.4 KB | 📅 MODIFIED: 2024-07-12T10:30:00Z
═══════════════════════════════════════════════════════════════════
```

### Content Sections

```typescript
import React from 'react';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  return (
    <header className="app-header">
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
    </header>
  );
};
```

### Metadata Display

```yaml
metadata:
  type: typescript
  size: 2.4KB
  lines: 15
  encoding: utf-8
  dependencies:
    - react
    - react-router-dom
```

## Navigation Features

### File Explorer Panel

The dedicated explorer panel shows:

- **📂 Project structure** - Complete folder hierarchy
- **🔢 File counts** - Number of files per directory
- **📊 Size information** - Total and individual file sizes
- **🔍 Search functionality** - Filter files by name or type

### Quick Actions

Right-click context menu provides:

- **📋 Copy file path** - Copy relative or absolute paths
- **👁️ Preview file** - Quick content preview
- **🔗 Go to definition** - Navigate to related files
- **📤 Extract single file** - Extract just this file

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+P` | Quick file search |
| `Ctrl+G` | Go to line |
| `F12` | Go to definition |
| `Shift+F12` | Find all references |
| `Ctrl+F` | Search in file |
| `Ctrl+Shift+F` | Search in all files |

## Configuration

### Visual Settings

```json
{
  "lookatni.visual.enableSyntaxHighlighting": true,
  "lookatni.visual.showFileTree": true,
  "lookatni.visual.enableHoverInfo": true,
  "lookatni.visual.colorScheme": "material",
  "lookatni.visual.fontSize": 14,
  "lookatni.visual.showMetadata": true
}
```

### Color Themes

Choose from multiple visual themes:

=== "Material Theme"
    - **Primary**: Deep Purple
    - **Accent**: Cyan
    - **Background**: Dark Grey
    - **Text**: White/Light Grey

=== "GitHub Theme"
    - **Primary**: Blue
    - **Accent**: Green
    - **Background**: White
    - **Text**: Dark Grey

=== "Monokai Theme"
    - **Primary**: Orange
    - **Accent**: Green
    - **Background**: Dark
    - **Text**: Light

### Font Settings

```json
{
  "lookatni.visual.fontFamily": "JetBrains Mono, Consolas, monospace",
  "lookatni.visual.fontSize": 14,
  "lookatni.visual.lineHeight": 1.5,
  "lookatni.visual.fontWeight": "normal"
}
```

## Interactive Commands

### File Operations

Available through command palette or context menu:

- **LookAtni: Show File Tree** - Toggle explorer panel
- **LookAtni: Navigate to File** - Quick file navigation
- **LookAtni: Preview File** - Show content preview
- **LookAtni: Extract Selected Files** - Extract specific files

### View Commands

Customize your visual experience:

- **LookAtni: Toggle Syntax Highlighting** - Enable/disable highlighting
- **LookAtni: Change Color Theme** - Switch visual themes
- **LookAtni: Adjust Font Size** - Modify text size
- **LookAtni: Reset Visual Settings** - Restore defaults

## Advanced Features

### Code Folding

Collapse sections for better overview:

```lookatni
📁 src/
  📁 components/ [12 files] ⬇️
  📁 pages/ [5 files] ⬇️
  📁 utils/ [8 files] ⬇️
  📄 App.tsx ⬇️
```

### Minimap Integration

VS Code minimap shows:

- **File boundaries** - Visual sections
- **Content density** - Code vs. comments
- **Search results** - Highlighted matches
- **Error indicators** - Validation issues

### IntelliSense Support

Smart autocomplete for:

- **File paths** - Auto-complete relative paths
- **Import statements** - Suggest available modules
- **Configuration options** - LookAtni settings
- **Command parameters** - CLI option hints

## Performance Optimization

### Large File Handling

For large marker files (>10MB):

- **Virtual scrolling** - Smooth performance
- **Lazy loading** - Load content on demand
- **Memory management** - Efficient resource usage
- **Background processing** - Non-blocking operations

### Rendering Optimization

- **Incremental updates** - Only refresh changed sections
- **GPU acceleration** - Hardware-accelerated rendering
- **Caching** - Cache parsed content for speed
- **Debounced updates** - Reduce unnecessary refreshes

## Accessibility

### Screen Reader Support

- **Semantic markup** - Proper ARIA labels
- **Keyboard navigation** - Full keyboard accessibility
- **Focus management** - Logical tab order
- **Content description** - Descriptive text for elements

### Visual Accessibility

- **High contrast mode** - Enhanced visibility
- **Font scaling** - Adjustable text size
- **Color blind support** - Alternative color schemes
- **Reduced motion** - Respect animation preferences

## Troubleshooting

### Common Issues

!!! warning "Syntax Highlighting Not Working"
    ```json
    // Check language association
    "files.associations": {
      "*.lookatni": "lookatni",
      "*.markers": "lookatni"
    }
    ```

!!! warning "Performance Issues"
    ```json
    // Reduce visual features for large files
    "lookatni.visual.enableForLargeFiles": false,
    "lookatni.visual.maxFileSize": "5MB"
    ```

!!! warning "Theme Conflicts"
    ```json
    // Reset to default theme
    "lookatni.visual.colorScheme": "default"
    ```

---

Next: Learn about [CLI Tools](cli-tools.md) for automation and scripting.
