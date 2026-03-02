#!/usr/bin/env bash
# Generator script for WASM TypeScript types
# Generates TypeScript type stubs from wasm-bindgen output

set -e

echo "[Tools] Generating WASM TypeScript types..."

# Ensure we're in the right directory
cd "$(dirname "$0")/../crates"

# Build with wasm-pack and generate types
wasm-pack build teotl_wasm --target web --out-dir ../web/src/wasm

echo "[Tools] WASM types generated successfully in web/src/wasm"
