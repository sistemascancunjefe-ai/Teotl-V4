# Teotl V4 — Roadmap

This is the phased delivery roadmap for **Teotl V4 — Nightmare Mode**.  
Each phase has a goal, a checklist of deliverables, and a mapping to the [parallel agent workstreams](AGENTS.md). Note: the current repository is still a JS-only prototype; establishing and migrating to the Rust/WASM + TypeScript + WASM skeleton is part of Phases 0–1, not an existing baseline.

---

## Phase 0 — Repository Skeleton & Documentation

**Goal:** Establish a solid foundation: repo structure, tooling, documentation, and inter-agent interface contracts so all workstreams can start in parallel.

**Status:** 🔄 In Progress

### Checklist

- [x] `README.md` created with project overview *(All agents)*
- [x] `docs/AGENTS.md` — parallel agent roles defined *(All agents)*
- [x] `docs/ROADMAP.md` — phased roadmap defined *(All agents)*
- [ ] `crate/` — Cargo workspace scaffolded with `wasm-pack` *(Agent 1 — Engine Rust/WASM)*
- [ ] `tsconfig.json` + build config (`vite.config.ts`) *(Agent 2 — Web Host TypeScript)*
- [ ] `src/` directory structure finalised (`engine/`, `ui/`, `atmosphere/`, `host/`) *(Agents 1–4)*
- [ ] `assets/` directory structure finalised with initial `manifest.json` *(Agent 5 — Content Pipeline)*
- [ ] `docs/design/UI_HORROR_STATES.md` — UI horror state spec *(Agent 3 — Horror UI/UX)*
- [ ] `docs/design/ATMOSPHERE_STATES.md` — atmosphere state spec *(Agent 4 — Atmospheric Engine)*
- [ ] `docs/lore/WORLD_BIBLE.md` — initial world bible draft *(Agent 6 — Lore)*
- [ ] `docs/art/ART_BIBLE.md` — initial art bible draft *(Agent 7 — Arte)*
- [ ] WASM API contract documented (`crate/engine/README.md`) *(Agents 1 & 2)*
- [ ] Asset manifest schema documented (`docs/ASSET_PIPELINE.md`) *(Agent 5)*
- [ ] CI/CD pipeline configured (lint, build, test) *(Agent 2)*

---

## Phase 1 — Playable Vertical Slice

**Goal:** Ship a single playable level demonstrating the core loop, Nightmare Mode UI, atmosphere, and a sample of lore content — enough to validate fun and horror feel.

**Status:** ⏳ Pending Phase 0

### Checklist

**Engine (Agent 1 — Engine Rust/WASM)**
- [ ] Fixed-timestep game loop running in browser
- [ ] ECS core (entities, components, systems)
- [ ] Player movement + collision detection
- [ ] Horror-level event emission API
- [ ] Rust unit tests passing in CI

**Web Host (Agent 2 — Web Host TypeScript)**
- [ ] WASM module loads and initialises cleanly
- [ ] `requestAnimationFrame` loop drives `wasm.tick(dt)`
- [ ] Keyboard + mouse input captured and forwarded to WASM
- [ ] Web Audio context initialised on first user gesture
- [ ] Canvas auto-resize with DPR support
- [ ] Production build outputs to `dist/`

**Horror UI (Agent 3 — Psychological Horror UI/UX)**
- [ ] Main menu with atmospheric background
- [ ] In-game HUD (sanity meter, objective indicator)
- [ ] Death / game-over screen with glitch shader
- [ ] UI horror state machine wired to engine events
- [ ] Basic post-processing pass (vignette + chromatic aberration)

**Atmosphere (Agent 4 — Atmospheric Engine)**
- [ ] Ambient audio layer (looping, procedural variation)
- [ ] Adaptive music: calm → tense → terror transitions
- [ ] Dynamic lighting flicker tied to horror level
- [ ] Fog overlay activated at high horror level

**Content Pipeline (Agent 5 — Content Pipeline/Tools)**
- [ ] Sprite-sheet packer operational
- [ ] Level JSON schema defined + validator passing
- [ ] `assets/manifest.json` generated for vertical-slice assets

**Lore (Agent 6 — Lore/Mundo/Personajes)**
- [ ] One protagonist character with full profile
- [ ] Vertical-slice level lore events populated
- [ ] World bible sections covering the starting zone

**Art (Agent 7 — Arte/Splasharts/Identidad Visual)**
- [ ] Title screen splash art
- [ ] Protagonist character sprite sheet
- [ ] Starting zone environment tiles
- [ ] Colour palette + design tokens delivered to Agent 3

---

## Phase 2 — Content Expansion

**Goal:** Expand the game to three playable levels, additional characters, full OST, and polished horror atmosphere across all zones.

**Status:** ⏳ Pending Phase 1

### Checklist

**Engine (Agent 1 — Engine Rust/WASM)**
- [ ] Multi-zone level loading
- [ ] Advanced AI (patrol, chase, hearing)
- [ ] Save/load state serialisation
- [ ] Performance profiling and WASM optimisation

**Web Host (Agent 2 — Web Host TypeScript)**
- [ ] Service Worker / offline caching
- [ ] Save data persistence (IndexedDB)
- [ ] Gamepad API support

**Horror UI (Agent 3 — Psychological Horror UI/UX)**
- [ ] Full trauma screen suite (multiple distortion variants)
- [ ] Inventory / journal UI
- [ ] Settings screen (audio, graphics, accessibility)
- [ ] Reduced-motion accessibility mode

**Atmosphere (Agent 4 — Atmospheric Engine)**
- [ ] Per-zone atmosphere profiles (3 zones)
- [ ] Full adaptive music OST integrated
- [ ] Reverb / spatial audio for enclosed spaces
- [ ] Environmental particle effects (rain, dust, embers)

**Content Pipeline (Agent 5 — Content Pipeline/Tools)**
- [ ] Audio normalisation + format conversion script
- [ ] Pipeline integrated into CI (asset lint on PR)
- [ ] Localisation string extraction tooling

**Lore (Agent 6 — Lore/Mundo/Personajes)**
- [ ] Full character roster (≥ 5 characters)
- [ ] Complete in-universe timeline
- [ ] Faction data populated
- [ ] In-game lore journal content (collectibles)

**Art (Agent 7 — Arte/Splasharts/Identidad Visual)**
- [ ] Character splash arts (≥ 5)
- [ ] Zone environment art (3 zones)
- [ ] UI icon set complete
- [ ] Marketing key art / banner

---

## Phase 3 — Polish, QA & Launch

**Goal:** Production-ready release: full QA pass, performance budget met, analytics, legal/accessibility compliance.

**Status:** ⏳ Pending Phase 2

### Checklist

- [ ] Full end-to-end playthrough QA (all agents)
- [ ] Performance budget met (60 fps on mid-range device) *(Agents 1 & 2)*
- [ ] Lighthouse score ≥ 90 (Performance, Accessibility) *(Agent 2)*
- [ ] All horror UI states tested across browsers (Chrome, Firefox, Safari) *(Agent 3)*
- [ ] Audio mix mastered and normalised *(Agent 4)*
- [ ] Asset manifest validated, no missing references *(Agent 5)*
- [ ] Final lore copy-edit pass *(Agent 6)*
- [ ] Final art polish pass *(Agent 7)*
- [ ] Privacy policy + legal notices added *(All agents)*
- [ ] Release tag `v1.0.0` created and deployed

---

## Phase 4 — Post-Launch

**Goal:** Community feedback integration, DLC content, and engine improvements.

**Status:** ⏳ Pending Launch

### Checklist

- [ ] Bug-fix patch v1.0.x *(All agents)*
- [ ] Community-requested QoL improvements *(Agents 2 & 3)*
- [ ] DLC content pack (new zone, characters, lore) *(Agents 5, 6, 7)*
- [ ] Engine optimisation for lower-end devices *(Agent 1)*
- [ ] Modding / data-driven level format documentation *(Agent 5)*

---

*See [AGENTS.md](AGENTS.md) for full agent role definitions and deliverable paths.*
