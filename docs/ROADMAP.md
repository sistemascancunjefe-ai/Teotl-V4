# Roadmap — Teotl V4 · Nightmare Mode

> **Status:** Draft — subject to change.

## Phase 0 — Architecture & Scaffold *(current)*

- [x] Monorepo structure: `web/`, `crates/`, `assets/`, `content/`, `docs/`
- [x] TypeScript scaffold with Vite
- [x] Rust workspace with placeholder crates
- [x] Placeholder docs and content files
- [x] CI workflow stubs

## Phase 1 — Core Engine

- [ ] `teotl_core`: Vec2/Vec3, colour types, RNG seeding
- [ ] `teotl_engine`: particle system simulation (CPU-side)
- [ ] `teotl_engine`: nightmare escalation state machine with timed transitions
- [ ] `teotl_wasm`: compile crates to WASM with `wasm-pack`
- [ ] `WasmBridge`: load WASM and expose particle tick to TypeScript
- [ ] `AtmosphericEngine`: connect WASM particle data to Canvas 2D rendering

## Phase 2 — Horror UI

- [ ] Glitch shader / CSS animation system driven by nightmare level
- [ ] Corrupted-text generator (procedural character substitution)
- [ ] Flicker engine (randomised CSS transitions)
- [ ] Atmospheric text cycling with horror phrases from `content/`

## Phase 3 — Audio

- [ ] Web Audio API ambient soundscape (layered OGG loops)
- [ ] Horror stingers (click, heartbeat, whisper, scream)
- [ ] Nightmare-mode audio cross-fade
- [ ] Procedural audio intensity scaling with nightmare level

## Phase 4 — Game Content

- [ ] World graph navigation (locations, transitions)
- [ ] NPC encounter system
- [ ] Item pickup / inventory
- [ ] Quest tracker

## Phase 5 — Polish & Release

- [ ] Splashart assets (title screen, loading, endings)
- [ ] Responsive layout for mobile browsers
- [ ] Accessibility (reduced-motion, audio description)
- [ ] Performance profiling (WASM vs JS hot-path)
- [ ] Public demo deployment (GitHub Pages / Vercel)
