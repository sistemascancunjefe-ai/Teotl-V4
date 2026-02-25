//! Main WASM API exposed to TypeScript

use wasm_bindgen::prelude::*;
use teotl_core::{Event, InputEvent, NightmareLevel, AtmosphereEvent};
use teotl_engine::Engine;
use teotl_game::GameSystems;
use crate::utils::set_panic_hook;
use crate::commands::{RenderCommand, AudioEvent};

/// Main Teotl WASM instance
#[wasm_bindgen]
pub struct TeotlWasm {
    engine: Engine,
    systems: GameSystems,
    audio_events: Vec<AudioEvent>,
    render_commands: Vec<RenderCommand>,
}

#[wasm_bindgen]
impl TeotlWasm {
    /// Create a new instance
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        set_panic_hook();

        let mut engine = Engine::new();
        engine.init();

        Self {
            engine,
            systems: GameSystems::new(),
            audio_events: Vec::new(),
            render_commands: Vec::new(),
        }
    }

    /// Initialize the engine
    #[wasm_bindgen]
    pub fn init(&mut self) {
        self.engine.init();
        web_sys::console::log_1(&"[TeotlWasm] Engine initialized".into());
    }

    /// Main game loop tick
    /// @param dt - Delta time in seconds (e.g., 0.016 for 60fps)
    #[wasm_bindgen]
    pub fn tick(&mut self, dt: f32) {
        // Update engine
        self.engine.tick(dt);

        // Update game systems
        self.systems.update(&mut self.engine);

        // Generate render commands
        self.generate_render_commands();

        // Generate audio events
        self.generate_audio_events();
    }

    /// Handle input event
    /// @param input_json - JSON string of input event
    #[wasm_bindgen]
    pub fn handle_input(&mut self, input_json: &str) -> Result<(), JsValue> {
        let event: InputEvent = serde_json::from_str(input_json)
            .map_err(|e| JsValue::from_str(&format!("Failed to parse input: {}", e)))?;

        self.engine.handle_input(Event::Input(event));
        Ok(())
    }

    /// Get audio events as JSON array
    #[wasm_bindgen]
    pub fn get_audio_events(&mut self) -> String {
        let events = std::mem::take(&mut self.audio_events);
        serde_json::to_string(&events).unwrap_or_else(|_| "[]".to_string())
    }

    /// Get render commands as JSON array
    #[wasm_bindgen]
    pub fn get_render_commands(&mut self) -> String {
        let commands = std::mem::take(&mut self.render_commands);
        serde_json::to_string(&commands).unwrap_or_else(|_| "[]".to_string())
    }

    /// Get current mood/intensity (0.0 - 1.0)
    #[wasm_bindgen]
    pub fn get_intensity(&self) -> f32 {
        self.engine.get_intensity()
    }

    /// Set nightmare level (0-4)
    #[wasm_bindgen]
    pub fn set_nightmare_level(&mut self, level: u8) {
        let nightmare_level = NightmareLevel::from_level(level);
        self.engine.set_nightmare_level(nightmare_level);
    }

    /// Get current nightmare level (0-4)
    #[wasm_bindgen]
    pub fn get_nightmare_level(&self) -> u8 {
        self.engine.state.nightmare_level as u8
    }

    /// Get nightmare level name
    #[wasm_bindgen]
    pub fn get_nightmare_name(&self) -> String {
        self.engine.state.nightmare_level.name().to_string()
    }

    /// Get total tick count
    #[wasm_bindgen]
    pub fn get_tick_count(&self) -> u64 {
        self.engine.state.tick_count
    }

    /// Get total time elapsed
    #[wasm_bindgen]
    pub fn get_total_time(&self) -> f32 {
        self.engine.get_total_time()
    }
}

impl TeotlWasm {
    /// Generate render commands for the current frame
    fn generate_render_commands(&mut self) {
        self.render_commands.clear();

        // Example: clear screen
        self.render_commands.push(RenderCommand {
            cmd_type: "clear".to_string(),
            params: r#"{"color": [0, 0, 0, 1]}"#.to_string(),
        });

        // Example: render based on intensity
        let intensity = self.engine.get_intensity();
        if intensity > 0.0 {
            let params = format!(
                r#"{{"intensity": {}, "level": {}}}"#,
                intensity,
                self.engine.get_nightmare_level() as u8
            );
            self.render_commands.push(RenderCommand {
                cmd_type: "nightmare_overlay".to_string(),
                params,
            });
        }

        // Future: entity rendering, particle systems, etc.
    }

    /// Generate audio events for the current frame
    fn generate_audio_events(&mut self) {
        self.audio_events.clear();

        // Drain engine events and convert to audio events
        let events = self.engine.events.drain();

        for event in events {
            match event {
                Event::Atmosphere(atmo) => {
                    match atmo {
                        AtmosphereEvent::Stinger { name, volume } => {
                            let params = format!(
                                r#"{{"name": "{}", "volume": {}}}"#,
                                name, volume
                            );
                            self.audio_events.push(AudioEvent {
                                event_type: "stinger".to_string(),
                                params,
                            });
                        }
                        AtmosphereEvent::MoodChange { tension } => {
                            let params = format!(r#"{{"tension": {}}}"#, tension);
                            self.audio_events.push(AudioEvent {
                                event_type: "mood".to_string(),
                                params,
                            });
                        }
                        AtmosphereEvent::AmbientLayer { name, intensity } => {
                            let params = format!(
                                r#"{{"name": "{}", "intensity": {}}}"#,
                                name, intensity
                            );
                            self.audio_events.push(AudioEvent {
                                event_type: "ambient".to_string(),
                                params,
                            });
                        }
                    }
                }
                Event::Gameplay(gameplay) => {
                    // Convert gameplay events to audio if needed
                    match gameplay {
                        teotl_core::GameplayEvent::NightmareLevelChanged { level } => {
                            let intensity = NightmareLevel::from_level(level).intensity();
                            let params = format!(r#"{{"tension": {}}}"#, intensity);
                            self.audio_events.push(AudioEvent {
                                event_type: "mood".to_string(),
                                params,
                            });
                        }
                        _ => {}
                    }
                }
                _ => {}
            }
        }
    }
}

impl Default for TeotlWasm {
    fn default() -> Self {
        Self::new()
    }
}
