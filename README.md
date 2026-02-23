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
