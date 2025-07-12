#!/usr/bin/env bash
#
# record_demo.sh — Record a VSCode session via Chronicler and convert to GIF.
#
# Usage: ./record_demo.sh output_base_name
#
# Requirements:
# - VSCode extension "Chronicler"
# - VSCode settings:
#   "chronicler.recording-defaults.animatedGif": true
#   "chronicler.ffmpeg-binary": "/usr/bin/ffmpeg" (or your path)
# - FFmpeg installed in your PATH (≥ v2.6)
#

set -e

NAME=${1:-demo}
MP4_FILE="${NAME}.mp4"
GIF_FILE="assets/${NAME}.gif"

echo "🎬 Recording in VSCode via Chronicler..."
echo "  Start recording, then play your demo sequence (split by markers, etc.)."
echo "  After finishing, stop the recording. You should get 2 files:"
echo "   - $(pwd)/${MP4_FILE}"
echo "   - and a GIF (auto-exported by Chronicler via FFmpeg)."
echo "Press ENTER after stopping recording."
read -r

echo "🎥 Checking for existing .mp4 file..."
if [[ ! -f "${MP4_FILE}" ]]; then
  echo "❌ ${MP4_FILE} not found. Make sure Chronicler saved it."
  exit 1
fi

echo "📦 Converting .mp4 to optimized GIF..."
mkdir -p assets

ffmpeg -i "${MP4_FILE}" \
  -filter_complex "[0:v] fps=10,scale=640:-1,split[a][b];[a]palettegen[p];[b][p]paletteuse" \
  -loop 0 "${GIF_FILE}"

echo "✅ GIF created: ${GIF_FILE}"
echo "- Add it to your README.md under assets/demo.gif"
echo "- Update Git, bump version, and publish!"
echo "🎉 Demo recording complete! 🎉"
