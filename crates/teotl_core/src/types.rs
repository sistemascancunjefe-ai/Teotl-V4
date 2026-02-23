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
