# teotl_wasm

WASM bindings and API for the Teotl V4 engine.

## Overview

This crate exposes the core engine (`teotl_engine`, `teotl_game`, `teotl_core`) to JavaScript/TypeScript environments running in a web browser using `wasm-bindgen`.

## API

The main export is the `TeotlWasm` class, which handles all communication between the browser runtime (Vite/TypeScript) and the deterministic Rust engine loop.

### Lifecycle Methods

- `constructor()`: Initializes the WASM environment, setting up the console panic hook.
- `tick(dt: number)`: Advances the game simulation by `dt` seconds using a fixed timestep accumulator.

### Inputs

- `handle_input(input_json: string)`: Sends input events (keyboard, mouse) to the engine. The JSON must match the `InputEvent` type serialization format from `teotl_core`.

### Outputs / State Access

- `get_audio_events() -> string`: Returns a JSON array of audio/atmosphere events generated in the last frame.
- `get_render_commands() -> string`: Returns a JSON array of render commands generated in the last frame.
- `set_nightmare_level(level: number)`: Manually overrides the nightmare level (0-4).
- `get_nightmare_level() -> number`: Returns the current nightmare level (0-4).
- `get_nightmare_name() -> string`: Returns the string name of the current level (e.g., "DORMANT").
- `get_intensity() -> number`: Returns the normalized tension scalar (0.0 - 1.0).
- `get_tick_count() -> bigint`: Total fixed ticks elapsed.
- `get_total_time() -> number`: Total simulated time in seconds.

## Example

```typescript
import init, { TeotlWasm } from './wasm/teotl_wasm.js';

await init();
const engine = new TeotlWasm();

function loop(time: number) {
    const dt = calculateDelta(time);
    engine.tick(dt);

    const tension = engine.get_intensity();

    requestAnimationFrame(loop);
}
```
