#!/bin/bash
set -e

# Setup Rust and Cargo
export RUSTUP_HOME=$HOME/.rustup
export CARGO_HOME=$HOME/.cargo
curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source $HOME/.cargo/env

# Install wasm32 target
rustup target add wasm32-unknown-unknown

# Install wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf -o install_wasm.sh
sh install_wasm.sh

# Build WASM core
wasm-pack build crates/teotl_wasm --target web --out-dir ../../web/src/wasm

# Build Web Host
cd web
npm install
npm run build
