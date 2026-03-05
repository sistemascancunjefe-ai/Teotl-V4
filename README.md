# Teotl-V4

Teotl V4 Nightmare Mode - A psychological horror browser game with Rust/WASM engine and atmospheric effects.

## Architecture

Hybrid **Rust/WASM + TypeScript** architecture:
- **Core Engine**: Rust compiled to WebAssembly (fixed timestep, game logic)
- **Host Runtime**: TypeScript with Vite (rendering, audio, input, UI)
- **Legacy Host**: JavaScript (original implementation in `/src`)

See [`docs/ENGINE.md`](docs/ENGINE.md) for detailed architecture documentation.

## Features

- 🦀 **Rust/WASM Engine**: Deterministic fixed-timestep game loop
- 🎨 **Psychological Horror UI**: Glitch effects, text corruption, atmospheric distortion
- 🔊 **Procedural Audio**: Web Audio API with tension-driven ambient layers
- 🌫️ **Atmospheric Engine**: Canvas-based particle and fog system
- 😱 **Nightmare Mode**: Dynamic intensity system (5 levels: Dormant → Abyss)
- 📊 **Debug Overlay**: Real-time FPS, delta time, and tension metrics

## Quick Start

### TypeScript/Vite Version (Recommended)

```bash
# Install dependencies
cd web && npm install

# Build WASM engine
wasm-pack build ../crates/teotl_wasm --target web --out-dir ../../web/src/wasm

# Start dev server
npm run dev

# Open http://localhost:3001
```

### Legacy JavaScript Version

```bash
# Install dependencies (root level)
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
├── web/                 # TypeScript/Vite host (recommended)
│   ├── src/
│   │   ├── engine/      # Atmospheric, audio, nightmare engines
│   │   ├── ui/          # Horror UI effects
│   │   ├── wasm/        # WASM build output (generated)
│   │   └── main.ts      # Application bootstrap
│   ├── index.html       # Entry point
│   ├── package.json     # Vite + TypeScript config
│   └── vite.config.ts   # Vite configuration
├── src/                 # Legacy JavaScript host
│   ├── engine/          # Engine hosts (wasm_host, atmospheric, audio, nightmare)
│   ├── ui/              # Horror UI effects
│   └── main.js          # Application bootstrap
├── index.html           # Legacy entry point
├── docs/                # Documentation
└── README.md            # This file
```

## Development

### Building the WASM Engine

```bash
# Check Rust workspace
cargo check --workspace

# Build WASM (for TypeScript/Vite)
wasm-pack build crates/teotl_wasm --target web --out-dir ../../web/src/wasm

# Build WASM (for legacy JavaScript)
wasm-pack build crates/teotl_wasm --target web --out-dir ../../pkg
```

### Running the Development Server

#### TypeScript/Vite (Port 3001)
```bash
cd web
npm run dev
```

#### Legacy JavaScript (Port 3000)
```bash
npm run dev
```

### Type Checking

```bash
cd web
npm run typecheck
```

### Building for Production

```bash
cd web
npm run build
```

## Ports

- **TypeScript/Vite**: `http://localhost:3001`
- **Legacy JavaScript**: `http://localhost:3000`

## Debug Overlay

The TypeScript version includes a real-time debug overlay showing:
- **FPS**: Frames per second
- **dt**: Delta time in seconds
- **Tension**: Current intensity from WASM engine (0.0 - 1.0)
- **Nightmare**: Current nightmare level and name
- **WASM Level**: Nightmare level from WASM engine
- **WASM Time**: Total elapsed time in WASM engine
- **Screen**: Current active screen

The overlay is visible in the top-right corner during development.

## Technologies

- **Rust** - Core game engine
- **WebAssembly** - Compile target
- **wasm-bindgen** - Rust ↔ JavaScript bindings
- **TypeScript** - Type-safe host runtime
- **Vite** - Fast build tool and dev server
- **Web Audio API** - Procedural audio
- **Canvas2D** - Atmospheric rendering
- **ES Modules** - Modern JavaScript module system

## Roadmap

Development follows a phased delivery plan:

- **Phase 0** — Repository skeleton & documentation *(in progress)*
- **Phase 1** — Playable vertical slice *(current)*
- **Phase 2** — Content expansion (3 zones, full OST)
- **Phase 3** — Polish, QA & launch
- **Phase 4** — Post-launch / DLC

See **[docs/ROADMAP.md](docs/ROADMAP.md)** for the full phased roadmap with per-phase checklists.

## Parallel Agent Workstreams

Development is organized into **seven parallel workstreams** (agents) that can progress independently:

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

## License

MIT
