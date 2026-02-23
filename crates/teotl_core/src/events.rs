//! Event system for input, gameplay, atmosphere, and UI

use serde::{Deserialize, Serialize};
use crate::Vec2;

/// Input event types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum InputEvent {
    KeyDown { key: String },
    KeyUp { key: String },
    MouseMove { position: Vec2 },
    MouseDown { button: u8, position: Vec2 },
    MouseUp { button: u8, position: Vec2 },
}

/// Gameplay events
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum GameplayEvent {
    NightmareLevelChanged { level: u8 },
    EntitySpawned { id: u64 },
    PlayerDamaged { amount: f32 },
}

/// Atmosphere events for audio/visual effects
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AtmosphereEvent {
    /// Trigger ambient sound layer
    AmbientLayer { name: String, intensity: f32 },
    /// Play audio stinger
    Stinger { name: String, volume: f32 },
    /// Update mood/tension level
    MoodChange { tension: f32 },
}

/// UI events
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum UIEvent {
    ShowMessage { text: String },
    GlitchFlash { count: u8 },
    ScreenShake { intensity: f32 },
}

/// Unified event container
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Event {
    Input(InputEvent),
    Gameplay(GameplayEvent),
    Atmosphere(AtmosphereEvent),
    UI(UIEvent),
}

/// Event queue
#[derive(Debug, Default)]
pub struct EventQueue {
    events: Vec<Event>,
}

impl EventQueue {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn push(&mut self, event: Event) {
        self.events.push(event);
    }

    pub fn drain(&mut self) -> Vec<Event> {
        std::mem::take(&mut self.events)
    }

    pub fn clear(&mut self) {
        self.events.clear();
    }

    pub fn is_empty(&self) -> bool {
        self.events.is_empty()
    }

    pub fn len(&self) -> usize {
        self.events.len()
    }
}
