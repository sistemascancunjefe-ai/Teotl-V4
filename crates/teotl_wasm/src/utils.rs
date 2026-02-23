//! WASM utilities

use wasm_bindgen::prelude::*;

/// Set panic hook for better error messages
pub fn set_panic_hook() {
    console_error_panic_hook::set_once();
}

/// Log to browser console
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    pub fn log(s: &str);
}

/// Log macro
#[macro_export]
macro_rules! console_log {
    ($($t:tt)*) => {
        $crate::utils::log(&format_args!($($t)*).to_string())
    }
}
