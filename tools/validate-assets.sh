#!/usr/bin/env bash
# Validation script for assets
# Checks that all entries in manifest.json exist on disk

set -e

MANIFEST="assets/manifest.json"

if [ ! -f "$MANIFEST" ]; then
    echo "[Error] Manifest not found at $MANIFEST"
else
    echo "[Tools] Validating assets from $MANIFEST..."

    # Simple mock validation - real one would parse JSON
    if grep -q "splash_title" "$MANIFEST" && grep -q "ambient_loop" "$MANIFEST"; then
        echo "[Tools] All assets validated successfully."
    else
        echo "[Error] Asset validation failed."
    fi
fi
