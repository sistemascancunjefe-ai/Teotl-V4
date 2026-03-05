//! TEOTL V4 — Game Logic
//!
//! Game rules, systems, and gameplay mechanics (stubs for now).

//! teotl_game — Game logic, world state, character systems, and quest engine.
//!
//! Responsibilities:
//! - World graph traversal and location management
//! - Character / NPC state and dialogue trees
//! - Item and inventory systems
//! - Quest tracking and event dispatch
//!
//! TODO: implement game systems once content data is defined.

pub mod character;
pub mod systems;
pub mod world;

pub use systems::*;
