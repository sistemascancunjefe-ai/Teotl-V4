//! Math utilities

use std::ops::{Add, Mul, Sub};

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
}

impl Add for Vec2 {
    type Output = Self;
    fn add(self, other: Self) -> Self {
        Self::new(self.x + other.x, self.y + other.y)
    }
}

impl Sub for Vec2 {
    type Output = Self;
    fn sub(self, other: Self) -> Self {
        Self::new(self.x - other.x, self.y - other.y)
    }
}

impl Mul<f32> for Vec2 {
    type Output = Self;
    fn mul(self, scalar: f32) -> Self {
        Self::new(self.x * scalar, self.y * scalar)
    }
}

impl Mul<Vec2> for f32 {
    type Output = Vec2;
    fn mul(self, vec: Vec2) -> Vec2 {
        Vec2::new(vec.x * self, vec.y * self)
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    use crate::Vec2;

    #[test]
    fn test_clamp() {
        assert_eq!(clamp(0.5, 0.0, 1.0), 0.5);
        assert_eq!(clamp(-1.0, 0.0, 1.0), 0.0);
        assert_eq!(clamp(2.0, 0.0, 1.0), 1.0);
    }

    #[test]
    fn test_lerp() {
        assert_eq!(lerp(0.0, 10.0, 0.5), 5.0);
        assert_eq!(lerp(0.0, 10.0, 0.0), 0.0);
        assert_eq!(lerp(0.0, 10.0, 1.0), 10.0);
    }

    #[test]
    fn test_smoothstep() {
        assert_eq!(smoothstep(0.0), 0.0);
        assert_eq!(smoothstep(1.0), 1.0);
        // smoothstep(0.5) = 0.5*0.5*(3-2*0.5) = 0.25*2 = 0.5
        assert!((smoothstep(0.5) - 0.5).abs() < 1e-6);
    }

    #[test]
    fn test_vec2_add() {
        let a = Vec2::new(1.0, 2.0);
        let b = Vec2::new(3.0, 4.0);
        let c = a + b;
        assert_eq!(c.x, 4.0);
        assert_eq!(c.y, 6.0);
    }

    #[test]
    fn test_vec2_sub() {
        let a = Vec2::new(5.0, 3.0);
        let b = Vec2::new(2.0, 1.0);
        let c = a - b;
        assert_eq!(c.x, 3.0);
        assert_eq!(c.y, 2.0);
    }

    #[test]
    fn test_vec2_mul() {
        let a = Vec2::new(2.0, 3.0);
        let c = a * 2.0;
        assert_eq!(c.x, 4.0);
        assert_eq!(c.y, 6.0);
    }

    #[test]
    fn test_vec2_length() {
        let a = Vec2::new(3.0, 4.0);
        assert!((a.length() - 5.0).abs() < 1e-6);
    }

    #[test]
    fn test_vec2_normalize() {
        let a = Vec2::new(3.0, 4.0);
        let n = a.normalize();
        assert!((n.length() - 1.0).abs() < 1e-6);
    }

    #[test]
    fn test_vec2_normalize_zero() {
        let z = Vec2::ZERO;
        let n = z.normalize();
        assert_eq!(n, Vec2::ZERO);
    }
}
