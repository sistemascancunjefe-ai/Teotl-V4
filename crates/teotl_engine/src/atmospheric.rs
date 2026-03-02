//! Atmospheric simulation module — placeholder.
//!
//! TODO: implement particle/fog simulation kernels.

/// Configuration for the atmospheric particle system.
#[derive(Debug, Clone)]
pub struct AtmosphericConfig {
    pub particle_count: u32,
    pub fog_speed:      f32,
    pub opacity:        f32,
}

impl Default for AtmosphericConfig {
    fn default() -> Self {
        Self {
            particle_count: 150,
            fog_speed:      3.0,
            opacity:        0.7,
        }
    }
}

/// Placeholder atmospheric engine.
pub struct AtmosphericEngine {
    config: AtmosphericConfig,
}

impl AtmosphericEngine {
    pub fn new(config: AtmosphericConfig) -> Self {
        Self { config }
    }

    /// Tick the simulation by `delta_ms` milliseconds.
    /// TODO: implement particle physics.
    pub fn tick(&mut self, _delta_ms: f32) {}

    pub fn config(&self) -> &AtmosphericConfig {
        &self.config
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_config_is_valid() {
        let cfg = AtmosphericConfig::default();
        assert!(cfg.particle_count > 0);
        assert!(cfg.opacity > 0.0 && cfg.opacity <= 1.0);
    }
}
