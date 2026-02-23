//! teotl_engine — Atmospheric rendering engine and simulation kernels.
//!
//! Responsible for:
//! - Particle system simulation (fog, dust, embers)
//! - Nightmare-mode escalation state machine
//! - Procedural atmospheric parameter generation
//!
//! This crate is designed to compile to both native (for tools/tests) and WASM
//! (via teotl_wasm). Keep it free of direct browser APIs.

pub mod atmospheric;
pub mod nightmare;

pub use teotl_core::version as core_version;
