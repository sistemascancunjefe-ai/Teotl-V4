//! Game systems (stubs)

use teotl_engine::Engine;

/// Placeholder for future game systems
pub struct GameSystems {
    // Future: entity manager, physics, AI, etc.
}

impl GameSystems {
    pub fn new() -> Self {
        Self {}
    }

    /// Update all game systems
    pub fn update(&mut self, _engine: &mut Engine) {
        // Future: update entity systems, AI, etc.
    }
}

impl Default for GameSystems {
    fn default() -> Self {
        Self::new()
    }
}
