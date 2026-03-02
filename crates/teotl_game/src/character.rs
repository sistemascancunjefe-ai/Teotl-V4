//! Character system — placeholder.
//!
//! TODO: implement NPC archetypes, dialogue trees, and horror personality traits.

/// A character or NPC archetype.
#[derive(Debug, Clone)]
pub struct Character {
    pub id: String,
    pub name: String,
    pub archetype: String,
    pub description: String,
}
