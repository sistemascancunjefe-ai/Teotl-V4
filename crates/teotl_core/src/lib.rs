//! teotl_core — Core data types, math utilities, and shared primitives.
//!
//! This crate contains no platform-specific code and serves as a shared foundation.
//! All other crates depend on this one.

/// Placeholder version check — replace with real core types.
pub fn version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn version_is_semver() {
        let v = version();
        assert!(!v.is_empty(), "version should not be empty");
    }
}
