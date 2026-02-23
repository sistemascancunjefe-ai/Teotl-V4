# Teotl V4 — Parallel Agent Workstreams

This document defines the parallel agent roles and responsibilities for **Teotl V4 — Nightmare Mode**, a browser-based psychological horror videogame built with Rust/WASM + TypeScript.

Work is divided into seven autonomous workstreams that can progress in parallel and synchronise through clearly defined interfaces (file paths, API contracts, asset manifests).

---

## Agent 1 — Engine Rust/WASM

**Objective:** Implement the deterministic game core — ECS, physics, game-loop timing, and the `wasm-bindgen` API surface consumed by the TypeScript host.

**Deliverables**
| File / Path | Description |
|---|---|
| `crate/engine/src/lib.rs` | Root library entry-point |
| `crate/engine/src/loop.rs` | Fixed-timestep game loop |
| `crate/engine/src/ecs/` | Entity-Component-System modules |
| `crate/engine/src/api.rs` | `wasm-bindgen` exported API (init, tick, input events) |
| `pkg/` | Compiled `.wasm` + JS glue (build output, not committed) |

**Tasks**
- [ ] Set up Cargo workspace + `wasm-pack` build pipeline
- [ ] Implement fixed-timestep loop with `requestAnimationFrame` hook
- [ ] Design and expose `wasm-bindgen` API: `init()`, `tick(dt)`, `send_input(event)`
- [ ] Implement ECS core (entity registry, component storage, system dispatch)
- [ ] Add collision detection and basic physics
- [ ] Write Rust unit tests for deterministic logic
- [ ] Document public API surface in `crate/engine/README.md`

---

## Agent 2 — Web Host TypeScript

**Objective:** Bootstrap the browser runtime: load and initialise the WASM module, drive the render canvas, capture keyboard/mouse/gamepad input, manage audio context, and own the build pipeline.

**Deliverables**
| File / Path | Description |
|---|---|
| `src/host/wasm-loader.ts` | WASM module loader + initialiser |
| `src/host/loop.ts` | `requestAnimationFrame` driver calling `wasm.tick()` |
| `src/host/input.ts` | Keyboard / mouse / gamepad capture → WASM events |
| `src/host/audio.ts` | Web Audio context manager |
| `src/host/canvas.ts` | Canvas setup, resize handling, DPR scaling |
| `tsconfig.json` | TypeScript project config |
| `vite.config.ts` (or equivalent) | Build/bundle configuration |

**Tasks**
- [ ] Configure TypeScript strict mode and module resolution
- [ ] Implement WASM loader with graceful error fallback
- [ ] Build `requestAnimationFrame` loop that feeds `dt` to the WASM tick
- [ ] Capture input events and serialise to WASM-compatible structures
- [ ] Initialise Web Audio context (user-gesture gated)
- [ ] Canvas auto-resize with device-pixel-ratio support
- [ ] Set up Vite (or equivalent) bundler with `wasm` plugin
- [ ] Add TypeScript type declarations for `wasm-bindgen` output

---

## Agent 3 — Psychological Horror UI/UX

**Objective:** Design and implement the Nightmare Mode UI — menus, HUD, pause screen, death/trauma screens — with post-processing visual effects (glitch, chromatic aberration, vignette) that respond to the game's horror state machine.

**Deliverables**
| File / Path | Description |
|---|---|
| `src/ui/nightmare-hud.ts` | In-game HUD component |
| `src/ui/menu.ts` | Main menu / pause menu |
| `src/ui/screens/death.ts` | Death / game-over screen |
| `src/ui/screens/trauma.ts` | Trauma level overlay |
| `src/ui/postprocess/` | WebGL post-processing shaders (glitch, vignette, CRT) |
| `src/ui/state-machine.ts` | UI horror state machine (calm → tense → terror → trauma) |
| `src/styles/nightmare.css` | Global dark/horror stylesheet |
| `docs/design/UI_HORROR_STATES.md` | Design spec for UI horror states |

**Tasks**
- [ ] Define UI horror state machine and transition triggers
- [ ] Implement main menu with atmospheric background animation
- [ ] Build in-game HUD (sanity meter, objective indicators)
- [ ] Create death / trauma screens with distortion shaders
- [ ] Implement WebGL post-processing pass (glitch, chromatic aberration, vignette)
- [ ] Ensure UI reacts in real-time to horror-level events from the engine
- [ ] Write accessibility considerations for high-contrast / reduced-motion modes
- [ ] Document UI states in `docs/design/UI_HORROR_STATES.md`

---

## Agent 4 — Atmospheric Engine

**Objective:** Build the audio/ambient/lighting/fog state machine that drives immersion — procedural soundscapes, dynamic lighting layers, and environmental fog — all synchronised with the engine horror level.

**Deliverables**
| File / Path | Description |
|---|---|
| `src/atmosphere/ambient-audio.ts` | Procedural ambient sound manager |
| `src/atmosphere/music.ts` | Adaptive music layer controller |
| `src/atmosphere/lighting.ts` | Dynamic lighting / shadow controller |
| `src/atmosphere/fog.ts` | Fog density state machine |
| `src/atmosphere/state-machine.ts` | Atmosphere state machine (zones × horror level) |
| `assets/audio/` | Audio asset directory (see Content Pipeline) |
| `docs/design/ATMOSPHERE_STATES.md` | Design spec for atmosphere states |

**Tasks**
- [ ] Design atmosphere state machine (zone + horror-level matrix)
- [ ] Implement procedural ambient audio layer (Web Audio oscillators + samples)
- [ ] Implement adaptive music system (stems, transitions)
- [ ] Build dynamic lighting controller (flicker, colour temperature, intensity)
- [ ] Implement fog/particle overlay driven by atmosphere state
- [ ] Expose events API consumed by the WASM engine (`on_horror_level_change`)
- [ ] Document state machine in `docs/design/ATMOSPHERE_STATES.md`

---

## Agent 5 — Content Pipeline / Tools

**Objective:** Build the asset pipeline: packing sprites/audio/levels, validation scripts, and manifest generation so all agents can reference canonical asset paths.

**Deliverables**
| File / Path | Description |
|---|---|
| `tools/pack-assets.ts` | Asset packing CLI |
| `tools/validate-assets.ts` | Asset validation / lint script |
| `tools/gen-manifest.ts` | Manifest generator |
| `assets/manifest.json` | Auto-generated asset manifest (committed) |
| `assets/sprites/` | Sprite sheets directory |
| `assets/audio/` | Audio files directory |
| `assets/levels/` | Level JSON files directory |
| `docs/ASSET_PIPELINE.md` | Pipeline documentation |

**Tasks**
- [ ] Define canonical asset directory structure
- [ ] Implement sprite-sheet packer (bin-packing algorithm)
- [ ] Implement audio normalisation / format conversion script
- [ ] Implement level JSON schema and validator
- [ ] Generate and commit initial `assets/manifest.json`
- [ ] Integrate pipeline into CI (lint assets on PR)
- [ ] Document pipeline in `docs/ASSET_PIPELINE.md`

---

## Agent 6 — Lore / Mundo / Personajes

**Objective:** Define the narrative universe — world bible, timeline, characters, faction data — and deliver it as structured content data (JSON/YAML) consumed by the engine and UI.

**Deliverables**
| File / Path | Description |
|---|---|
| `docs/lore/WORLD_BIBLE.md` | World bible (history, cosmology, factions) |
| `docs/lore/TIMELINE.md` | In-universe timeline |
| `docs/lore/CHARACTERS.md` | Character roster (profiles, arcs, relationships) |
| `content/characters/` | Per-character JSON data files |
| `content/factions/` | Faction JSON data files |
| `content/lore-events/` | Key lore events JSON |

**Tasks**
- [ ] Write world bible: history, cosmology, factions, geography
- [ ] Draft character roster with profiles, motivations, arcs
- [ ] Create in-universe timeline (pre-game events → end states)
- [ ] Define content data schemas (character, faction, lore-event JSON)
- [ ] Populate initial content data for launch characters and factions
- [ ] Cross-reference lore events with level data (Agent 5)
- [ ] Review for internal consistency with the horror tone (Agent 3)

---

## Agent 7 — Arte / Splasharts / Identidad Visual

**Objective:** Establish the visual identity — art bible, colour palette, typography, and the splash-art pipeline — ensuring cohesion across all visual assets.

**Deliverables**
| File / Path | Description |
|---|---|
| `docs/art/ART_BIBLE.md` | Art bible (style guide, mood boards, references) |
| `docs/art/COLOR_PALETTE.md` | Canonical colour palette |
| `docs/art/TYPOGRAPHY.md` | Font choices and usage rules |
| `assets/splasharts/` | Splash-art files directory |
| `assets/ui-icons/` | UI icon set |
| `tools/optimize-images.ts` | Image optimisation / export script |

**Tasks**
- [ ] Write art bible: visual style, mood, pixel-art vs. illustrated direction
- [ ] Define canonical colour palette (horror dark tones, accent colours)
- [ ] Specify typography (display font, body font, horror-mode variant)
- [ ] Create and export initial splash art (title screen, character cards)
- [ ] Design UI icon set aligned with horror aesthetic
- [ ] Build image optimisation script for export pipeline (Agent 5)
- [ ] Deliver design tokens (CSS custom properties) consumed by Agent 3

---

## Inter-Agent Dependencies

```
Agent 1 (Engine) ──▶ Agent 2 (Web Host)  — WASM API contract
Agent 1 (Engine) ──▶ Agent 3 (Horror UI) — horror-level events
Agent 1 (Engine) ──▶ Agent 4 (Atmosphere)— horror-level events
Agent 5 (Pipeline)──▶ Agent 1,2,3,4      — asset manifest + paths
Agent 6 (Lore)   ──▶ Agent 5 (Pipeline) — content data schemas
Agent 7 (Art)    ──▶ Agent 5 (Pipeline) — art assets
Agent 7 (Art)    ──▶ Agent 3 (Horror UI) — design tokens / palette
```

## Communication Protocol

- **Interfaces** are locked before work begins (WASM API, asset manifest schema, event names).
- **Blocking issues** are filed as GitHub Issues tagged with the relevant agent label.
- **Cross-agent changes** require a PR review from both affected agents.
- **Weekly sync** checkpoint aligns on Phase progress (see [ROADMAP.md](ROADMAP.md)).
