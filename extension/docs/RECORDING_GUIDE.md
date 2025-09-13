# 🎬 LookAtni Demo Recording Guide

This guide will help you create a smooth, professional demo video showcasing LookAtni's golden feature: **AI Code Extraction**.

## 🎯 Demo Objective

Show how AI-generated code in a single document can be extracted into a complete project structure with invisible markers.

## 🛠️ Setup Requirements

### 1. Recording Tools
- **Chronicler Extension** (VS Code marketplace)
- **FFmpeg** installed on your system
- **Clean VS Code workspace** (no extra files/folders)

### 2. VS Code Settings for Chronicler
```json
{
  "chronicler.recording-defaults.animatedGif": true,
  "chronicler.ffmpeg-binary": "/usr/bin/ffmpeg"
}
```

## 🚀 Automated Demo Sequence

### Option 1: Fully Automated (Recommended for Recording)

1. **Clean environment and start recording:**
   ```bash
   ./docs/automated_demo.sh
   code .
   ```

2. **Start Chronicler recording** (Ctrl+Shift+P → "Chronicler: Start Recording")

3. **Run automated demo:**
   - Ctrl+Shift+P → "LookAtni: Automated Demo (Recording)"
   - Watch the automated sequence execute smoothly

4. **Stop recording** and export GIF

### Option 2: Manual with Prepared Content

1. **Prepare environment:**
   ```bash
   ./docs/automated_demo.sh
   code .
   ```

2. **Start recording and follow this sequence:**
   - Open `demo-automated/ai-generated-project.txt`
   - Show the content (AI-generated React project)
   - Right-click → "LookAtni: Extract Files"
   - Choose destination: `demo-automated/extracted-project`
   - Show extracted file structure
   - Open extracted files to show they work

## 📋 Demo Script Checklist

### Pre-Recording (2 minutes)
- [ ] Run `./docs/automated_demo.sh` to prepare environment
- [ ] Open VS Code in clean workspace
- [ ] Close all unnecessary panels/tabs
- [ ] Set zoom level for readability (Ctrl + '+' until comfortable)
- [ ] Position windows for optimal recording area

### Recording Sequence (30-45 seconds)
1. **Show AI-generated content** (5 seconds)
   - [ ] Open `ai-generated-project.txt`
   - [ ] Scroll through showing it's a single file with React project

2. **Highlight invisible markers** (5 seconds)  
   - [ ] Briefly highlight that markers are invisible
   - [ ] Maybe show cursor over marker areas (they won't show)

3. **Extract files** (10 seconds)
   - [ ] Right-click file → "LookAtni: Extract Files"
   - [ ] Select destination folder
   - [ ] Show progress/completion message

4. **Show results** (15 seconds)
   - [ ] Open Explorer to show extracted structure
   - [ ] Open a few key files (package.json, App.js)
   - [ ] Show complete, working project structure

5. **Closing highlight** (5 seconds)
   - [ ] Quick overview of what was accomplished
   - [ ] Maybe show both original and extracted side by side

### Post-Recording
- [ ] Stop Chronicler recording
- [ ] Export to optimized GIF using included script
- [ ] Test GIF quality and size
- [ ] Add to README.md

## 🎨 Visual Tips for Great Recording

### VS Code Theme & Settings
```json
{
  "workbench.colorTheme": "Dark+ (default dark)",
  "editor.fontSize": 16,
  "editor.fontFamily": "Fira Code, Consolas, monospace",
  "editor.minimap.enabled": false,
  "workbench.activityBar.visible": true,
  "workbench.statusBar.visible": true
}
```

### Recording Best Practices
- **Slow, deliberate movements** - Give viewers time to follow
- **Clear mouse cursor** - Make sure cursor is visible
- **Steady hands** - Avoid shaky mouse movements  
- **Pause briefly** - At each step to let action complete
- **Show results clearly** - Open multiple files to prove it works

## 📊 Success Criteria

Your demo should clearly show:
- ✅ Single file with AI-generated content
- ✅ Invisible markers (mention they exist but don't show)
- ✅ One-click extraction process
- ✅ Complete project structure created
- ✅ Working files with proper content
- ✅ Zero manual file creation needed

## 🎯 Final Output

- **Duration**: 30-45 seconds max
- **Format**: Optimized GIF (< 2MB)
- **Quality**: Clear, readable text
- **Focus**: The "golden feature" - AI to project extraction

## 🚀 Ready to Record!

Run the automated demo script and you'll have everything prepared for a perfect recording session!

```bash
chmod +x docs/automated_demo.sh
./docs/automated_demo.sh
```

Then follow the recording sequence above for a professional demo video.
