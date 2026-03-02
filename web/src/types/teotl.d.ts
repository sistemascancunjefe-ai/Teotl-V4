/**
 * Teotl V4 — Shared TypeScript type declarations
 *
 * Central type definitions shared across the web host codebase.
 */

// ---- Game state ----------------------------------------------------------------

export type ScreenName = 'title' | 'main' | 'settings';

export interface GameState {
  screen:         ScreenName;
  nightmareLevel: number;
  audioEnabled:   boolean;
  volume:         number;
}

// ---- Asset manifest ------------------------------------------------------------

export interface AssetEntry {
  id:   string;
  path: string;
  type: 'image' | 'audio' | 'wasm' | 'json';
  /** Human-readable tag for the content pipeline */
  tags?: string[];
}

export interface AssetManifest {
  version: string;
  assets:  AssetEntry[];
}

// ---- Content data --------------------------------------------------------------

export interface LocationData {
  id:          string;
  name:        string;
  description: string;
  connections: string[];
}

export interface CharacterData {
  id:          string;
  name:        string;
  archetype:   string;
  description: string;
}

// ---- WASM interop (mirrored from teotl_wasm crate) ----------------------------

export interface WasmParticleConfig {
  count:    number;
  speed:    number;
  opacity:  number;
}
