//! World graph — placeholder.
//!
//! TODO: load location data from content/world/locations.yaml via a build
//! script or runtime asset loader.

/// A single world location node.
#[derive(Debug, Clone)]
pub struct Location {
    pub id: String,
    pub name: String,
    pub description: String,
    pub connections: Vec<String>,
}
