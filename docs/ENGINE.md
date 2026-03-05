# Teotl V4 Engine Architecture

## Overview

Teotl V4 uses a hybrid Rust/WASM + TypeScript architecture for optimal performance and web compatibility. The engine core is written in Rust and compiled to WebAssembly, while the host runtime, rendering, and audio systems are in TypeScript/JavaScript running in the browser.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (TypeScript)                     │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  main.js      │  │ Canvas2D/    │  │  Web Audio API  │  │
│  │  TeotlApp     │  │  WebGL2      │  │  AudioEngine    │  │
│  └───────┬───────┘  └──────▲───────┘  └────────▲────────┘  │
│          │                  │                    │           │
│  ┌───────▼──────────────────┴────────────────────┴────────┐ │
│  │           WasmEngineHost (wasm_host.js)                │ │
│  │  - Load WASM module                                    │ │
│  │  - Game loop (requestAnimationFrame)                  │ │
│  │  - Input marshalling                                  │ │
│  │  - Audio event consumption                            │ │
│  │  - Render command consumption                         │ │
│  └────────────────────────┬──────────────────────────────┘ │
└───────────────────────────┼────────────────────────────────┘
                            │ wasm-bindgen API
┌───────────────────────────▼────────────────────────────────┐
│              Rust/WASM Engine (teotl_wasm)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  TeotlWasm (api.rs)                                  │  │
│  │  - init()                                            │  │
│  │  - tick(dt)                                          │  │
│  │  - handle_input(json)                                │  │
│  │  - get_audio_events() → JSON                         │  │
│  │  - get_render_commands() → JSON                      │  │
│  │  - get_intensity() → f32                             │  │
│  │  - set_nightmare_level(u8)                           │  │
│  └────────────┬─────────────────────────────────────────┘  │
│               │                                             │
│  ┌────────────▼─────────────┬───────────────┐              │
│  │   teotl_engine           │  teotl_game   │              │
│  │  - Engine                │  - Systems    │              │
│  │  - Scheduler             │  - Stubs      │              │
│  │  - State Machine         │               │              │
│  └──────────────────────────┴───────────────┘              │
│               │                                             │
│  ┌────────────▼────────────────────────────────────────┐   │
│  │              teotl_core                             │   │
│  │  - Types (NightmareLevel, Vec2)                     │   │
│  │  - Math utilities                                   │   │
│  │  - IDs and entity management                        │   │
│  │  - Time (fixed timestep)                            │   │
│  │  - Events (Input, Gameplay, Atmosphere, UI)         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Rust ↔ TypeScript Contract

### What Lives in Rust

**Core Logic & State:**
- Game state management (nightmare level, tick count, time)
- Fixed timestep loop with accumulator
- Event queue and processing
- Entity ID generation
- Core math utilities (Vec2, lerp, clamp, etc.)

**Systems (Future):**
- Physics
- AI/pathfinding
- Game rules
- Collision detection

### What Lives in TypeScript

**Platform/Browser Specific:**
- Canvas rendering (2D/WebGL)
- Web Audio API integration
- Input handling (keyboard, mouse, gamepad)
- Asset loading
- UI framework integration
- Settings persistence (localStorage)

**Visual/Audio Effects:**
- Particle systems (atmospheric.js)
- Glitch/horror effects (horror-ui.js)
- Procedural audio generation (audio.js)
- Screen transitions

## wasm-bindgen API

The Rust engine exposes a stable API through `wasm-bindgen`:

### Core Methods

#### `init()`
Initialize the engine. This is invoked internally by the `TeotlWasm` constructor, so typical hosts do not need to call it explicitly. If you construct the engine in a non-standard way, ensure `init()` is called exactly once after the WASM module loads.

```javascript
// Engine is initialized by the constructor; no explicit init() call required.
const wasm = new TeotlWasm();
```

#### `tick(dt: number)`
Main game loop tick. Updates engine with delta time in seconds.

```javascript
// In requestAnimationFrame callback
const dt = (timestamp - lastTime) / 1000;
wasm.tick(dt);
```

#### `handle_input(input_json: string)`
Process input event. Takes JSON string of InputEvent.

```javascript
const inputEvent = {
  KeyDown: { key: "Space" }
};
wasm.handle_input(JSON.stringify(inputEvent));
```

#### `get_audio_events() → string`
Get audio events for the current frame as JSON array.

```javascript
const events = JSON.parse(wasm.get_audio_events());
// Returns: [{ event_type: "stinger", params: "{\"name\":\"heartbeat\",\"volume\":0.5}" }, ...]
```

#### `get_render_commands() → string`
Get render commands for the current frame as JSON array.

```javascript
const commands = JSON.parse(wasm.get_render_commands());
// Returns: [{ cmd_type: "clear", params: "{\"color\":[0,0,0,1]}" }, ...]
```

### Nightmare Mode Methods

#### `set_nightmare_level(level: number)`
Set nightmare intensity (0-4).

#### `get_nightmare_level() → number`
Get current nightmare level (0-4).

#### `get_nightmare_name() → string`
Get nightmare level name ("DORMANT", "AWAKENING", "DREAD", "TERROR", "ABYSS").

#### `get_intensity() → number`
Get normalized intensity (0.0 - 1.0).

### Debug/Info Methods

#### `get_tick_count() → bigint`
Total engine ticks since initialization.

#### `get_total_time() → number`
Total time elapsed in seconds.

## Fixed Timestep

The engine uses a **fixed timestep** with accumulator pattern for deterministic simulation:

- **Fixed delta:** 1/60 seconds (60 Hz)
- **Max delta:** 0.25 seconds (prevents "spiral of death")
- **Accumulator:** Handles variable frame rates smoothly

The TypeScript host calls `tick(dt)` with variable delta time from `requestAnimationFrame`. The Rust engine internally runs fixed updates:

```rust
pub fn tick(&mut self, dt: f32) {
    let ticks = self.time.add_time(dt);

    for _ in 0..ticks {
        self.fixed_update();  // Runs at 60 Hz
    }
}
```

Benefits:
- Deterministic physics/gameplay
- Network synchronization ready
- Replay-friendly
- Frame-rate independent

## Event System

Events flow from Rust → TypeScript for rendering and audio:

### Event Types

1. **Input** (TS → Rust)
   - KeyDown, KeyUp, MouseMove, MouseDown, MouseUp

2. **Gameplay** (Rust internal, converted to Audio/UI)
   - NightmareLevelChanged
   - EntitySpawned
   - PlayerDamaged

3. **Atmosphere** (Rust → TS Audio)
   - AmbientLayer
   - Stinger
   - MoodChange

4. **UI** (Rust → TS UI)
   - ShowMessage
   - GlitchFlash
   - ScreenShake

### Event Flow Example

```
User presses key
    ↓
TS captures input → InputEvent
    ↓
wasm.handle_input(json)
    ↓
Rust processes gameplay
    ↓
Generates AtmosphereEvent::MoodChange
    ↓
TS calls wasm.get_audio_events()
    ↓
AudioEngine adjusts tension/drones
```

## Logging & Tracing

The WASM module uses:
- `console_error_panic_hook` for better panic messages in browser console
- `web_sys::console` for logging from Rust

```rust
web_sys::console::log_1(&"[Engine] Initialized".into());
```

## Building the WASM Module

```bash
# Build release WASM
wasm-pack build crates/teotl_wasm --target web --out-dir ../../pkg

# Output: pkg/teotl_wasm.js, teotl_wasm_bg.wasm, teotl_wasm.d.ts
```

## Integration Example

```javascript
import { WasmEngineHost } from './engine/wasm_host.js';

const engineHost = new WasmEngineHost();
await engineHost.init();

function gameLoop(timestamp) {
  engineHost.tick(timestamp);

  // Get and process audio events
  const audioEvents = engineHost.getAudioEvents();
  for (const event of audioEvents) {
    processAudioEvent(event);
  }

  // Get and process render commands
  const renderCommands = engineHost.getRenderCommands();
  for (const cmd of renderCommands) {
    executeRenderCommand(cmd);
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

## Nightmare Mode Integration

The engine tracks "nightmare intensity" which drives all horror systems:

```javascript
// Set nightmare level
engineHost.setNightmareLevel(3); // TERROR

// Get intensity
const intensity = engineHost.getIntensity(); // 0.75

// React to intensity
atmosphericEngine.setOptions({
  fogSpeed: 3 + intensity * 7,
  opacity: 0.7 + intensity * 0.3
});

audioEngine.setVolume(0.6 + intensity * 0.4);
horrorUI.setGlitchIntensity(1 + intensity * 9);
```

The intensity automatically flows from Rust → TS through:
1. `MoodChange` atmosphere events
2. Direct `get_intensity()` polling

## Future Expansion

### Phase 1 (Current)
- ✅ Core types and structures
- ✅ Fixed timestep loop
- ✅ Event system
- ✅ WASM bindings
- ✅ Nightmare mode state

### Phase 2 (Next)
- Entity-component system
- Physics stubs
- Spatial partitioning
- Asset management

### Phase 3 (Later)
- AI/pathfinding
- Procedural generation
- Save/load system
- Networked multiplayer hooks

## Performance Considerations

1. **Minimize TS ↔ Rust calls:** Batch operations, use JSON arrays
2. **Avoid allocations:** Reuse buffers, pre-allocate vectors
3. **Profile regularly:** Use browser DevTools Performance tab
4. **WASM is not always faster:** Keep rendering/audio in TS/WebAPIs

## Definition of Done (Vertical Slice)

A vertical slice is complete when:

- [x] WASM module builds without errors
- [ ] TypeScript can load and initialize engine
- [x] Game loop runs at stable 60 FPS
- [ ] Input events reach Rust and affect state
- [ ] Audio events flow back to TypeScript
- [ ] Render commands flow back to TypeScript
- [ ] Nightmare level changes propagate correctly
- [ ] At least one game mechanic implemented end-to-end
- [ ] Performance meets targets (60 FPS on mid-range hardware)

---

**Last Updated:** 2026-02-23
**Version:** 4.0.0
**Status:** Phase 1 Complete
# Engine — Teotl V4 · Nightmare Mode

> **Status:** Placeholder — expand during Phase 1 implementation.

## Atmospheric Engine

The atmospheric engine renders the persistent background layer:
fog particles, dust motes, and horror-tinted ambient effects.

### Architecture

- **Simulation (Rust/WASM):** `teotl_engine::atmospheric::AtmosphericEngine`
  ticks particle positions in a flat `Vec<Particle>` buffer each frame.
- **Rendering (TypeScript):** `AtmosphericEngine.ts` reads the particle buffer
  from WASM shared memory and draws to a `<canvas>` via Canvas 2D API.

### Configuration

| Parameter | Default | Description |
|---|---|---|
| `particleCount` | 150 | Number of active particles |
| `fogSpeed` | 3.0 | Base horizontal fog drift speed |
| `opacity` | 0.7 | Canvas composite opacity |

### WASM Memory Layout

> TODO: define shared memory layout once WASM implementation begins.

## Nightmare Engine

Controls the escalation of horror intensity from level 0 (Dormant) to 5 (Abyss).

### Levels

| Level | Name | Description |
|---|---|---|
| 0 | DORMANT | Normal mode — subtle atmospheric effects |
| 1 | AWARE | Increased particle count, slight glitch |
| 2 | RESTLESS | Fog accelerates, UI text starts corrupting |
| 3 | HAUNTED | Heavy glitch, flicker, whisper stingers |
| 4 | POSSESSED | Near-blackout vignette, entity visible |
| 5 | ABYSS | Maximum horror — all systems at peak |

### Escalation

Nightmare mode escalates automatically every `escalationInterval` ms
(default: 30 000 ms) while active. The TypeScript host reacts to
`levelchange` events by:

1. Applying CSS custom properties (`--nightmare-intensity`, etc.)
2. Updating atmospheric engine parameters
3. Triggering horror UI effects
4. Cueing audio stingers

## Audio Engine

> See [ARCHITECTURE](ARCHITECTURE.md) for the Web Audio graph overview.

Implemented in `src/engine/audio.js`.  The engine generates all sound
procedurally via the Web Audio API — no external audio files are required.

### Reactive Audio Hooks (Nightmare Level)

`AudioEngine` reacts to the current `NightmareEngine` level (as defined in the NightmareEngine level table above)
through a single method:

```javascript
audioEngine.setNightmareLevel(level); // integer level from the NightmareEngine table
```

When the level changes the engine performs a **crossfade** (default 2 s) between
the outgoing ambient layer and the incoming one.  Each level has a distinct
configuration:

| Level | Name      | Drone stack                  | Drone gain | Noise gain | Filter cutoff |
|-------|-----------|------------------------------|------------|------------|---------------|
| 0     | DORMANT   | 27.5 Hz, 41.2 Hz             | 0.015      | 0.008      | 80 Hz         |
| 1     | AWAKENING | + 55.0 Hz                    | 0.020      | 0.012      | 100 Hz        |
| 2     | DREAD     | + 73.4 Hz                    | 0.028      | 0.017      | 130 Hz        |
| 3     | TERROR    | + 82.4 Hz                    | 0.036      | 0.023      | 160 Hz        |
| 4     | ABYSS     | + 110.0 Hz                   | 0.045      | 0.030      | 200 Hz        |

#### Crossfade Mechanism

```
current oscillators ──gain ramp→ 0 ──stop after CROSSFADE_TIME──►
new oscillators     ──gain ramp→ target over CROSSFADE_TIME──►
noise layer         ──replaced immediately, gain ramps in──►
```

`CROSSFADE_TIME` is defined internally as a module constant (`2.0` seconds by default).

#### Integration Example

```javascript
// In main.js — wired through NightmareEngine's 'levelchange' event:
nightmare.on('levelchange', ({ level }) => {
  audioEngine.setNightmareLevel(level);
});
nightmare.on('deactivate', () => {
  audioEngine.setNightmareLevel(0);
});
```

### Stingers and Cooldowns

One-shot audio events triggered by gameplay:

```javascript
audioEngine.playStinger('heartbeat'); // plays only if cooldown has elapsed
```

| Type        | Description                          | Cooldown  |
|-------------|--------------------------------------|-----------|
| `click`     | Short transient pop (UI feedback)    | 500 ms    |
| `heartbeat` | Double-thump (level escalation)      | 3 000 ms  |
| `whisper`   | Band-passed noise burst (DREAD+)     | 8 000 ms  |
| `screech`   | Descending sawtooth screech (ABYSS)  | 15 000 ms |

Each stinger type tracks the timestamp of its last play (`_stingerLastPlayed`
Map).  `playStinger()` silently returns if the cooldown has not elapsed, so
callers do not need to manage timing themselves.

#### Suggested Trigger Points

| Event                              | Stinger      |
|------------------------------------|--------------|
| Any button / UI interaction        | `click`      |
| Nightmare level escalation         | `heartbeat`  |
| Level ≥ 2 and player is idle       | `whisper`    |
| Level ≥ 3 jump-scare               | `screech`    |

### NightmareEngine Connection

`main.js` wires the two engines together in `_applyNightmareLevel`:

```javascript
// src/main.js — _applyNightmareLevel(level, name)
this._audio.setNightmareLevel(level);   // crossfade ambient
// … on escalation:
this._audio.playStinger('heartbeat');   // announce level change
```

The legacy `setNightmareMode(active)` method is still available and maps
`active=true` → level 1, `active=false` → level 0.
