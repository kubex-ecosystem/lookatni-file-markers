# 🚀 Quick Start Guide

Get up and running with LookAtni File Markers in minutes!

## Your First Markers

### Step 1: Try the Quick Demo

Experience LookAtni in action:

1. **Open Command Palette** (`Ctrl+Shift+P`)
2. **Type**: `LookAtni: Quick Demo`
3. **Press Enter** and watch the magic happen!

This creates a sample HTML project and demonstrates the complete workflow.

### Step 2: Generate Markers from Your Project

Transform your existing project into portable markers:

1. **Open your project** in VS Code
2. **Command Palette** → `LookAtni: Generate Markers`
3. **Select source folder** (your project root)
4. **Choose output file** (e.g., `my-project-markers.txt`)
5. **Configure options** (file filters, size limits)
6. **Generate!** ✨

### Step 3: Extract Markers Anywhere

Restore your project from markers:

1. **Get your markers file** (`.txt` file from Step 2)
2. **Command Palette** → `LookAtni: Extract Files`
3. **Select markers file**
4. **Choose destination folder**
5. **Extract!** Your project is restored perfectly

## Real-World Example

Let's create a React project marker:

### Create Sample React Project

```bash
# Create a simple React component
mkdir my-react-app
cd my-react-app

# Create package.json
echo '{
  "name": "my-react-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0"
  }
}' > package.json

# Create a component
mkdir src
echo 'import React from "react";

export function App() {
  return (
    <div>
      <h1>Hello LookAtni!</h1>
      <p>This project was packaged with LookAtni File Markers</p>
    </div>
  );
}' > src/App.jsx
```

### Generate Markers

1. **Open** `my-react-app` in VS Code
2. **Command Palette** → `LookAtni: Generate Markers`
3. **Source**: `./` (current folder)
4. **Output**: `react-app-markers.txt`
5. **Exclude**: `node_modules` (default)
6. **Generate!**

### Share and Extract

Your `react-app-markers.txt` file contains everything:

```
//␜/ package.json /␜//
{
  "name": "my-react-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0"
  }
}

//␜/ src/App.jsx /␜//
import React from "react";

export function App() {
  return (
    <div>
      <h1>Hello LookAtni!</h1>
      <p>This project was packaged with LookAtni File Markers</p>
    </div>
  );
}
```

Anyone can now extract this into a working React project!

## Essential Commands

### Primary Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| `LookAtni: Generate Markers` | Create markers from files | `Ctrl+Alt+G` |
| `LookAtni: Extract Files` | Extract files from markers | `Ctrl+Alt+E` |
| `LookAtni: Validate Markers` | Check marker integrity | `Ctrl+Alt+V` |
| `LookAtni: Quick Demo` | Run demonstration | `Ctrl+Alt+D` |

### Quick Actions

| Command | Description |
|---------|-------------|
| `LookAtni: Visual Markers` | Toggle visual markers |
| `LookAtni: Show Statistics` | Display project stats |
| `LookAtni: Open CLI Tools` | Access CLI commands |
| `LookAtni: Configuration` | Open settings |

## Common Workflows

### Code Review Workflow

1. **Generate markers** for the feature branch
2. **Share markers file** with reviewer
3. **Reviewer extracts** and tests locally
4. **Provide feedback** on the extracted code

### Educational Workflow

1. **Create lesson project** with examples
2. **Generate markers** for distribution
3. **Students extract** and follow along
4. **Include in course materials**

### Backup Workflow

1. **Generate markers** for important projects
2. **Store markers files** in cloud storage
3. **Extract when needed** for recovery
4. **Version control** your markers

## Tips for Success

### File Organization

- **Use descriptive names** for markers files
- **Include version numbers** (e.g., `project-v1.2-markers.txt`)
- **Add date stamps** for time-based tracking
- **Organize by project type** or purpose

### Best Practices

- **Exclude large files** (videos, binaries, dependencies)
- **Use size limits** to keep markers manageable
- **Validate regularly** to catch issues early
- **Document your markers** with comments

### Performance Tips

- **Generate incrementally** for large projects
- **Use file filters** to focus on relevant code
- **Split large projects** into logical markers
- **Monitor file sizes** and optimize as needed

## What's Next?

Now that you've mastered the basics:

1. **Explore [Features](../features/generation.md)** - Dive deeper into capabilities
2. **Read [Best Practices](../guide/best-practices.md)** - Optimize your workflow
3. **Try [Examples](../examples/react-sharing.md)** - Real-world use cases
4. **Check [CLI Tools](../features/cli-tools.md)** - Advanced automation

---

!!! tip "🎯 Pro Tip"
    
    Start small with a simple project, then gradually work up to complex workflows. LookAtni grows with your needs!
