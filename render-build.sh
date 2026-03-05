#!/bin/bash
set -e

# Setup Rust and Cargo
export RUSTUP_HOME=$HOME/.rustup
export CARGO_HOME=$HOME/.cargo
curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs -o rustup.sh
bash rustup.sh -y
source $HOME/.cargo/env

# Install wasm32 target
rustup target add wasm32-unknown-unknown

# Install wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf -o init.sh
bash init.sh

# Build WASM core for both web and legacy
wasm-pack build crates/teotl_wasm --target web --out-dir ../../web/src/wasm
wasm-pack build crates/teotl_wasm --target web --out-dir ../../pkg

# Build Web Host (Vite frontend)
cd web
npm install
npm run build
