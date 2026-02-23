//! Render and audio command structures

use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Render command for Canvas/WebGL
#[derive(Debug, Clone, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct RenderCommand {
    /// Command type: "clear", "rect", "circle", "text", etc.
    #[wasm_bindgen(skip)]
    pub cmd_type: String,

    /// JSON-encoded parameters
    #[wasm_bindgen(skip)]
    pub params: String,
}

#[wasm_bindgen]
impl RenderCommand {
    #[wasm_bindgen(getter)]
    pub fn cmd_type(&self) -> String {
        self.cmd_type.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn params(&self) -> String {
        self.params.clone()
    }
}

/// Audio event for Web Audio API
#[derive(Debug, Clone, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct AudioEvent {
    /// Event type: "stinger", "ambient", "mood"
    #[wasm_bindgen(skip)]
    pub event_type: String,

    /// JSON-encoded parameters
    #[wasm_bindgen(skip)]
    pub params: String,
}

#[wasm_bindgen]
impl AudioEvent {
    #[wasm_bindgen(getter)]
    pub fn event_type(&self) -> String {
        self.event_type.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn params(&self) -> String {
        self.params.clone()
    }
}
