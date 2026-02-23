//! teotl_wasm — WebAssembly bindings for Teotl V4.
//!
//! This crate is the single WASM entry point compiled with wasm-pack.
//! It re-exports selected APIs from teotl_engine and teotl_game, wrapped
//! with wasm-bindgen so the TypeScript host can call them.
//!
//! Build command:
//!   wasm-pack build crates/teotl_wasm --target web --out-dir ../../web/src/wasm

use wasm_bindgen::prelude::*;

/// Returns the crate version string — useful for smoke-testing the WASM bridge.
#[wasm_bindgen]
pub fn version() -> String {
    teotl_core::version().to_string()
}

/// Sets up the browser panic hook for better error messages during development.
#[wasm_bindgen(start)]
pub fn start() {
    // Only include in debug builds to keep WASM binary lean
    #[cfg(debug_assertions)]
    console_error_panic_hook();
}

#[cfg(debug_assertions)]
fn console_error_panic_hook() {
    // TODO: add `console_error_panic_hook` crate for dev builds
    // console_error_panic_hook::set_once();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn version_not_empty() {
        assert!(!version().is_empty());
    }
}
