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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reset_restores_defaults() {
        let mut state = EngineState {
            nightmare_level: NightmareLevel::Abyss,
            tick_count: 42,
            paused: true,
        };

        state.reset();

        assert_eq!(state.nightmare_level, NightmareLevel::Dormant);
        assert_eq!(state.tick_count, 0);
        assert!(!state.paused);
    }
}
