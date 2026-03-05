//! Entity and object ID management

use serde::{Deserialize, Serialize};

/// Unique entity identifier
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct EntityId(pub u64);

impl EntityId {
    pub const INVALID: Self = Self(0);

    pub fn new(id: u64) -> Self {
        Self(id)
    }

    pub fn is_valid(&self) -> bool {
        self.0 != 0
    }
}

/// Simple ID generator
pub struct IdGenerator {
    next_id: u64,
}

impl IdGenerator {
    pub fn new() -> Self {
        Self { next_id: 1 }
    }

    pub fn generate(&mut self) -> EntityId {
        let id = EntityId(self.next_id);
        self.next_id += 1;
        id
    }
}

impl Default for IdGenerator {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn generator_produces_sequential_ids() {
        let mut gen = IdGenerator::new();
        let first = gen.generate();
        let second = gen.generate();
        assert!(first.is_valid());
        assert!(second.is_valid());
        assert_eq!(first.0 + 1, second.0);
    }

    #[test]
    fn invalid_constant_is_not_valid() {
        assert!(!EntityId::INVALID.is_valid());
    }

    #[test]
    fn default_generator_starts_at_one() {
        let mut gen = IdGenerator::default();
        let first = gen.generate();
        assert_eq!(first, EntityId(1));
    }
}
