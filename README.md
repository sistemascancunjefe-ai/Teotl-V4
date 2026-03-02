# Teotl-V4

Teotl V4 Nightmare Mode - A psychological horror browser game with Rust/WASM engine and atmospheric effects.

## Architecture

Hybrid **Rust/WASM + TypeScript** architecture:
- **Core Engine**: Rust compiled to WebAssembly (fixed timestep, game logic)
- **Host Runtime**: TypeScript (rendering, audio, input, UI)

See [`docs/ENGINE.md`](docs/ENGINE.md) for detailed architecture documentation.

## Features

- 🦀 **Rust/WASM Engine**: Deterministic fixed-timestep game loop
- 🎨 **Psychological Horror UI**: Glitch effects, text corruption, atmospheric distortion
- 🔊 **Procedural Audio**: Web Audio API with tension-driven ambient layers
- 🌫️ **Atmospheric Engine**: Canvas-based particle and fog system
- 😱 **Nightmare Mode**: Dynamic intensity system (5 levels: Dormant → Abyss)

## Quick Start

```bash
# Install dependencies
npm install

# Build WASM engine
wasm-pack build crates/teotl_wasm --target web --out-dir ../../pkg

# Start dev server
npm run dev

# Open http://localhost:3000
```

## Project Structure

```
.
├── crates/              # Rust/WASM engine
│   ├── teotl_core/      # Core types, math, events
│   ├── teotl_engine/    # Game loop, scheduler
│   ├── teotl_game/      # Game systems (stubs)
│   └── teotl_wasm/      # WASM bindings
├── src/                 # TypeScript/JavaScript
│   ├── engine/          # Engine hosts (wasm_host, atmospheric, audio, nightmare)
│   ├── ui/              # Horror UI effects
│   └── main.js          # Application bootstrap
├── pkg/                 # WASM build output (generated)
├── docs/                # Documentation
└── index.html           # Entry point
```

## Documentation

- [Engine Architecture](docs/ENGINE.md) - Rust/WASM engine design and API

## Development

```bash
# Check Rust workspace
cargo check --workspace

# Build WASM (development)
wasm-pack build crates/teotl_wasm --target web --out-dir ../../pkg

# Start dev server
npm run dev
```

## Technologies

- **Rust** - Core game engine
- **WebAssembly** - Compile target
- **wasm-bindgen** - Rust ↔ JavaScript bindings
- **TypeScript/JavaScript** - Host runtime
- **Web Audio API** - Procedural audio
- **Canvas2D** - Atmospheric rendering
- **Native ES Modules** - No build step required

## License

MIT
9# Teotl-V4
Teotl V4 Nightmare Mode with psychological horror UI and atmospheric engine

## Overview

**Teotl V4 — Nightmare Mode** is currently a browser-based psychological horror videogame prototype implemented as a no-build JavaScript app driven by `src/main.js`. The target architecture is **Rust/WASM + TypeScript**, where the core engine will run as a WebAssembly module compiled from Rust and the browser host (canvas, input, audio) will be driven by TypeScript. Nightmare Mode aims to deliver a dynamic psychological horror experience through a reactive UI state machine and a procedural atmospheric engine.

## Parallel Agent Workstreams

Development is organised into **seven parallel workstreams** (agents) that can progress independently and synchronise through well-defined interfaces:

| Agent | Workstream |
|---|---|
| 1 | Engine Rust/WASM — core loop + wasm-bindgen API |
| 2 | Web Host TypeScript — runtime, canvas, input/audio, build |
| 3 | Psychological Horror UI/UX — Nightmare Mode UI states and post-processing |
| 4 | Atmospheric Engine — audio/ambient/lighting/fog state machine |
| 5 | Content Pipeline/Tools — asset packing, validation, manifests |
| 6 | Lore/Mundo/Personajes — world bible, characters, timeline, content data |
| 7 | Arte/Splasharts/Identidad Visual — art bible, splash art pipeline |

See **[docs/AGENTS.md](docs/AGENTS.md)** for full role definitions, deliverables, and task lists.

## Roadmap

Development follows a phased delivery plan:

- **Phase 0** — Repository skeleton & documentation *(in progress)*
- **Phase 1** — Playable vertical slice
- **Phase 2** — Content expansion (3 zones, full OST)
- **Phase 3** — Polish, QA & launch
- **Phase 4** — Post-launch / DLC

See **[docs/ROADMAP.md](docs/ROADMAP.md)** for the full phased roadmap with per-phase checklists.
