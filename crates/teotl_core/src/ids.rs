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
