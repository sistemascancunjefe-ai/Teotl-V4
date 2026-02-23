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

Planned implementation: layered ambient OGG loops cross-faded dynamically
based on nightmare level. Stingers are one-shot AudioBufferSourceNode playbacks.
