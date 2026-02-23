//! Engine state machine

use teotl_core::NightmareLevel;

/// Global engine state
#[derive(Debug)]
pub struct EngineState {
    pub nightmare_level: NightmareLevel,
    pub tick_count: u64,
    pub paused: bool,
}

impl EngineState {
    pub fn new() -> Self {
        Self {
            nightmare_level: NightmareLevel::Dormant,
            tick_count: 0,
            paused: false,
        }
    }

    /// Reset to initial state
    pub fn reset(&mut self) {
        self.nightmare_level = NightmareLevel::Dormant;
        self.tick_count = 0;
        self.paused = false;
    }
}

impl Default for EngineState {
    fn default() -> Self {
        Self::new()
    }
}
