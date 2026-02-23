//! Time management and tick system

/// Fixed timestep configuration
#[derive(Debug, Clone, Copy)]
pub struct TimeConfig {
    /// Target timestep in seconds (e.g., 1.0/60.0 for 60 Hz)
    pub fixed_dt: f32,
    /// Maximum delta time to prevent spiral of death
    pub max_dt: f32,
}

impl Default for TimeConfig {
    fn default() -> Self {
        Self {
            fixed_dt: 1.0 / 60.0, // 60 Hz
            max_dt: 0.25,         // Max 250ms per frame
        }
    }
}

/// Time accumulator for fixed timestep
#[derive(Debug)]
pub struct TimeAccumulator {
    pub config: TimeConfig,
    pub accumulator: f32,
    pub total_time: f32,
    /// Number of fixed ticks that have been produced by this accumulator instance.
    ///
    /// Note: `EngineState` also maintains its own `tick_count`, which typically tracks
    /// a higher‑level notion of engine ticks. This field is **local** to the
    /// `TimeAccumulator` and is not guaranteed to stay in sync with
    /// `EngineState::tick_count`. Code that needs a single canonical tick value
    /// should consistently use one source (usually `EngineState`) instead of
    /// combining or comparing these counters.
    pub tick_count: u64,
}

impl TimeAccumulator {
    pub fn new(config: TimeConfig) -> Self {
        Self {
            config,
            accumulator: 0.0,
            total_time: 0.0,
            tick_count: 0,
        }
    }

    /// Add delta time and return number of fixed ticks to run
    pub fn add_time(&mut self, dt: f32) -> u32 {
        let dt = dt.min(self.config.max_dt);
        self.accumulator += dt;

        let mut ticks = 0;
        while self.accumulator >= self.config.fixed_dt {
            self.accumulator -= self.config.fixed_dt;
            self.total_time += self.config.fixed_dt;
            self.tick_count += 1;
            ticks += 1;
        }

        ticks
    }

    /// Get interpolation alpha for rendering
    pub fn alpha(&self) -> f32 {
        self.accumulator / self.config.fixed_dt
    }
}

impl Default for TimeAccumulator {
    fn default() -> Self {
        Self::new(TimeConfig::default())
    }
}
