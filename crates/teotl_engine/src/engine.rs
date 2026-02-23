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
        self.state.nightmare_level = NightmareLevel::Dormant;
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
