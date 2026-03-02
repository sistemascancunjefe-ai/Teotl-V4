#!/usr/bin/env bash
# Assets packing script
# Converts source assets to runtime-optimised formats

set -e

echo "[Tools] Packing assets..."

SOURCE_DIR="assets/source"
RUNTIME_DIR="assets/runtime"

# Create necessary directories
mkdir -p "$RUNTIME_DIR/splasharts"
mkdir -p "$RUNTIME_DIR/environment"
mkdir -p "$RUNTIME_DIR/characters"
mkdir -p "$RUNTIME_DIR/audio"
mkdir -p "$RUNTIME_DIR/ui"

# Provide a mock conversion for testing
# In a real environment, this would use ImageMagick/ffmpeg
touch "$RUNTIME_DIR/splasharts/title.webp"
touch "$RUNTIME_DIR/audio/ambient_loop.ogg"

echo "[Tools] Assets packed successfully."
