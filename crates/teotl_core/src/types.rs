//! Core types for Teotl V4

use serde::{Deserialize, Serialize};

/// Nightmare intensity levels
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum NightmareLevel {
    Dormant = 0,
    Awakening = 1,
    Dread = 2,
    Terror = 3,
    Abyss = 4,
}

impl NightmareLevel {
    /// Get normalized intensity (0.0 - 1.0)
    pub fn intensity(&self) -> f32 {
        (*self as u8 as f32) / 4.0
    }

    /// From integer level
    pub fn from_level(level: u8) -> Self {
        match level.min(4) {
            0 => Self::Dormant,
            1 => Self::Awakening,
            2 => Self::Dread,
            3 => Self::Terror,
            _ => Self::Abyss,
        }
    }

    /// Get name string
    pub fn name(&self) -> &'static str {
        match self {
            Self::Dormant => "DORMANT",
            Self::Awakening => "AWAKENING",
            Self::Dread => "DREAD",
            Self::Terror => "TERROR",
            Self::Abyss => "ABYSS",
        }
    }
}

/// 2D Vector
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct Vec2 {
    pub x: f32,
    pub y: f32,
}

impl Vec2 {
    pub const fn new(x: f32, y: f32) -> Self {
        Self { x, y }
    }

    pub const ZERO: Self = Self::new(0.0, 0.0);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_nightmare_level_intensity() {
        assert_eq!(NightmareLevel::Dormant.intensity(), 0.0);
        assert_eq!(NightmareLevel::Awakening.intensity(), 0.25);
        assert_eq!(NightmareLevel::Dread.intensity(), 0.5);
        assert_eq!(NightmareLevel::Terror.intensity(), 0.75);
        assert_eq!(NightmareLevel::Abyss.intensity(), 1.0);
    }

    #[test]
    fn test_nightmare_level_from_level() {
        assert_eq!(NightmareLevel::from_level(0), NightmareLevel::Dormant);
        assert_eq!(NightmareLevel::from_level(1), NightmareLevel::Awakening);
        assert_eq!(NightmareLevel::from_level(2), NightmareLevel::Dread);
        assert_eq!(NightmareLevel::from_level(3), NightmareLevel::Terror);
        assert_eq!(NightmareLevel::from_level(4), NightmareLevel::Abyss);
        // Values above 4 are clamped to Abyss
        assert_eq!(NightmareLevel::from_level(99), NightmareLevel::Abyss);
    }

    #[test]
    fn test_nightmare_level_name() {
        assert_eq!(NightmareLevel::Dormant.name(), "DORMANT");
        assert_eq!(NightmareLevel::Abyss.name(), "ABYSS");
    }

    #[test]
    fn test_vec2_zero() {
        assert_eq!(Vec2::ZERO.x, 0.0);
        assert_eq!(Vec2::ZERO.y, 0.0);
    }
}
