//! Nightmare-mode escalation state machine — placeholder.
//!
//! TODO: implement escalation timers and level transitions.

/// Nightmare intensity level (0 = dormant, 5 = abyss).
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub struct NightmareLevel(pub u8);

impl NightmareLevel {
    pub const DORMANT:   Self = Self(0);
    pub const AWARE:     Self = Self(1);
    pub const RESTLESS:  Self = Self(2);
    pub const HAUNTED:   Self = Self(3);
    pub const POSSESSED: Self = Self(4);
    pub const ABYSS:     Self = Self(5);

    pub fn name(self) -> &'static str {
        match self.0 {
            0 => "DORMANT",
            1 => "AWARE",
            2 => "RESTLESS",
            3 => "HAUNTED",
            4 => "POSSESSED",
            _ => "ABYSS",
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn level_names_are_non_empty() {
        for i in 0..=5 {
            assert!(!NightmareLevel(i).name().is_empty());
        }
    }
}
