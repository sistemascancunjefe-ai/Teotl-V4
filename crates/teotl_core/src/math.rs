//! Math utilities

use crate::Vec2;

/// Clamp a value between min and max
pub fn clamp(value: f32, min: f32, max: f32) -> f32 {
    value.max(min).min(max)
}

/// Linear interpolation
pub fn lerp(a: f32, b: f32, t: f32) -> f32 {
    a + (b - a) * t
}

/// Smooth step interpolation (0-1)
pub fn smoothstep(t: f32) -> f32 {
    let t = clamp(t, 0.0, 1.0);
    t * t * (3.0 - 2.0 * t)
}

impl Vec2 {
    /// Dot product
    pub fn dot(self, other: Self) -> f32 {
        self.x * other.x + self.y * other.y
    }

    /// Length squared
    pub fn length_sq(self) -> f32 {
        self.dot(self)
    }

    /// Length
    pub fn length(self) -> f32 {
        self.length_sq().sqrt()
    }

    /// Normalize
    pub fn normalize(self) -> Self {
        let len = self.length();
        if len > 0.0 {
            Self::new(self.x / len, self.y / len)
        } else {
            Self::ZERO
        }
    }

    /// Add
    pub fn add(self, other: Self) -> Self {
        Self::new(self.x + other.x, self.y + other.y)
    }

    /// Scale
    pub fn scale(self, scalar: f32) -> Self {
        Self::new(self.x * scalar, self.y * scalar)
    }
}
