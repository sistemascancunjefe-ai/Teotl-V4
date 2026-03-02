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
    /// a higher-level notion of engine ticks. This field is **local** to the
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

    /// Get interpolation alpha for rendering.
    ///
    /// This value represents how far we are between the previous and the next
    /// fixed tick, in the range `[0.0, 1.0]`. It is intended to be used by
    /// renderers to interpolate state between simulation steps for smoother
    /// visuals in fixed-timestep engines.
    ///
    /// Note: As of the current phase, this method is not yet exposed through
    /// the WASM API and is not wired into the engine's public interface. It is
    /// kept here intentionally as a future-facing feature (e.g., Phase 2) for
    /// interpolation-based rendering.
    pub fn alpha(&self) -> f32 {
        self.accumulator / self.config.fixed_dt
    }
}

impl Default for TimeAccumulator {
    fn default() -> Self {
        Self::new(TimeConfig::default())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_time_accumulator_ticks() {
        let mut acc = TimeAccumulator::default();
        // One frame at 60fps: ~16.667ms → exactly 1 tick
        let ticks = acc.add_time(1.0 / 60.0);
        assert_eq!(ticks, 1);
    }

    #[test]
    fn test_time_accumulator_multiple_ticks() {
        let mut acc = TimeAccumulator::default();
        // Add 3 separate frames to avoid floating-point precision issues
        acc.add_time(1.0 / 60.0);
        acc.add_time(1.0 / 60.0);
        acc.add_time(1.0 / 60.0);
        assert_eq!(acc.tick_count, 3);
    }

    #[test]
    fn test_time_accumulator_max_dt_clamp() {
        let mut acc = TimeAccumulator::default();
        // Large spike should be clamped to max_dt (0.25s → 15 ticks)
        let ticks = acc.add_time(10.0);
        assert!(ticks <= 15);
    }

    #[test]
    fn test_time_accumulator_total_time() {
        let mut acc = TimeAccumulator::default();
        acc.add_time(1.0 / 60.0);
        acc.add_time(1.0 / 60.0);
        // Each tick advances total_time by fixed_dt (1/60)
        let expected = 2.0 / 60.0;
        assert!((acc.total_time - expected).abs() < 1e-5);
    }

    #[test]
    fn test_time_accumulator_alpha() {
        let acc = TimeAccumulator::default();
        // No time added: alpha should be 0
        assert_eq!(acc.alpha(), 0.0);
    }
}
