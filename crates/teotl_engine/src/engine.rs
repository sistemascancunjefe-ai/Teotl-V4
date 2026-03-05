//! Main engine coordinator

use teotl_core::{Event, EventQueue, TimeAccumulator, NightmareLevel};
use crate::state::EngineState;
use crate::scheduler::Scheduler;

/// Main engine
pub struct Engine {
    pub state: EngineState,
    pub time: TimeAccumulator,
    pub scheduler: Scheduler,
    pub events: EventQueue,
}

impl Engine {
    pub fn new() -> Self {
        Self {
            state: EngineState::new(),
            time: TimeAccumulator::default(),
            scheduler: Scheduler::new(),
            events: EventQueue::new(),
        }
    }

    /// Initialize engine
    pub fn init(&mut self) {
        // Reinitialize engine state and runtime subsystems to their default configuration.
        self.state = EngineState::new();
        self.time = TimeAccumulator::default();
        self.scheduler = Scheduler::new();
        self.events = EventQueue::new();
    }

    /// Process one frame tick
    pub fn tick(&mut self, dt: f32) {
        let ticks = self.time.add_time(dt);

        for _ in 0..ticks {
            self.fixed_update();
        }

        // Run scheduler tasks
        self.scheduler.update(self.time.total_time);
    }

    /// Fixed timestep update
    fn fixed_update(&mut self) {
        // Update game state
        self.state.tick_count += 1;

        // Process any scheduled events
        // (Future: system updates would go here)
    }

    /// Handle input event
    pub fn handle_input(&mut self, event: Event) {
        self.events.push(event);
    }

    /// Get current nightmare intensity (0.0 - 1.0)
    pub fn get_intensity(&self) -> f32 {
        self.state.nightmare_level.intensity()
    }

    /// Set nightmare level
    pub fn set_nightmare_level(&mut self, level: NightmareLevel) {
        if self.state.nightmare_level != level {
            self.state.nightmare_level = level;
            self.events.push(Event::Gameplay(
                teotl_core::GameplayEvent::NightmareLevelChanged {
                    level: level as u8,
                }
            ));
        }
    }
}

impl Default for Engine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use teotl_core::NightmareLevel;

    #[test]
    fn test_engine_initial_state() {
        let mut engine = Engine::new();
        engine.init();
        assert_eq!(engine.state.nightmare_level, NightmareLevel::Dormant);
        assert_eq!(engine.state.tick_count, 0);
        assert!(!engine.state.paused);
    }

    #[test]
    fn test_engine_tick_increments_count() {
        let mut engine = Engine::new();
        engine.init();
        engine.tick(1.0 / 60.0);
        assert_eq!(engine.state.tick_count, 1);
    }

    #[test]
    fn test_engine_set_nightmare_level_emits_event() {
        let mut engine = Engine::new();
        engine.init();
        engine.set_nightmare_level(NightmareLevel::Terror);
        assert_eq!(engine.state.nightmare_level, NightmareLevel::Terror);
        // An event should have been queued
        assert!(!engine.events.is_empty());
    }

    #[test]
    fn test_engine_set_nightmare_level_no_duplicate_event() {
        let mut engine = Engine::new();
        engine.init();
        engine.set_nightmare_level(NightmareLevel::Dread);
        let count_after_first = engine.events.len();
        // Setting the same level again should not emit another event
        engine.set_nightmare_level(NightmareLevel::Dread);
        assert_eq!(engine.events.len(), count_after_first);
    }

    #[test]
    fn test_engine_get_intensity() {
        let mut engine = Engine::new();
        engine.init();
        assert_eq!(engine.get_intensity(), 0.0);
        engine.set_nightmare_level(NightmareLevel::Abyss);
        assert_eq!(engine.get_intensity(), 1.0);
    }
}
