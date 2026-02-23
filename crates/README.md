# Teotl V4 - Rust/WASM Engine Crates

This directory contains the Rust/WASM engine for Teotl V4 - Nightmare Mode.

## Crate Structure

### `teotl_core`
Foundation library containing:
- **Types**: `NightmareLevel`, `Vec2`, core data structures
- **Math**: Utilities (lerp, clamp, smoothstep, vector operations)
- **IDs**: Entity ID management and generation
- **Time**: Fixed timestep accumulator and time management
- **Events**: Event system (Input, Gameplay, Atmosphere, UI)

### `teotl_engine`
Game engine orchestration:
- **Engine**: Main coordinator with fixed timestep loop
- **State**: Engine state machine
- **Scheduler**: Task scheduling system

### `teotl_game`
Game logic and systems (currently stubs for future expansion):
- **Systems**: Entity systems, physics, AI placeholders

### `teotl_wasm`
WebAssembly bindings via `wasm-bindgen`:
- **API**: Stable TypeScript interface
- **Commands**: Render and audio command structures
- **Utils**: WASM utilities and logging

## Building

### Prerequisites
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install wasm-pack
cargo install wasm-pack
```

### Build for Web
```bash
# From repository root
wasm-pack build crates/teotl_wasm --target web --out-dir ../../pkg
```

Output will be in `pkg/`:
- `teotl_wasm.js` - JavaScript glue code
- `teotl_wasm_bg.wasm` - Compiled WebAssembly module
- `teotl_wasm.d.ts` - TypeScript definitions

### Development
```bash
# Check all crates
cargo check --workspace

# Run tests
cargo test --workspace

# Build optimized (slower, smaller)
wasm-pack build crates/teotl_wasm --target web --release
```

## API Overview

The WASM module exposes:

```typescript
class TeotlWasm {
  constructor();
  init(): void;
  tick(dt: number): void;
  handle_input(input_json: string): void;
  get_audio_events(): string;
  get_render_commands(): string;
  get_intensity(): number;
  set_nightmare_level(level: number): void;
  get_nightmare_level(): number;
  get_nightmare_name(): string;
  get_tick_count(): bigint;
  get_total_time(): number;
}
```

See `docs/ENGINE.md` for detailed architecture and API documentation.

## License

MIT
