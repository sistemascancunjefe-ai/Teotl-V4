# Architecture — Teotl V4 · Nightmare Mode

> **Status:** Placeholder — will be expanded as implementation progresses.

## Overview

Teotl V4 is a browser-based psychological-horror video game built on a
**Rust → WebAssembly + TypeScript** stack.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Browser (Player)                            │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                  TypeScript Web Host (web/)                  │  │
│  │                                                              │  │
│  │   main.ts ──► AtmosphericEngine ──► <canvas>                │  │
│  │               AudioEngine        ──► Web Audio API          │  │
│  │               NightmareEngine    ──► CSS custom properties  │  │
│  │               HorrorUI           ──► DOM manipulation       │  │
│  │               WasmBridge         ──┐                        │  │
│  └──────────────────────────────────┼─┘                        │  │
│                                     │                           │  │
│  ┌──────────────────────────────────▼───────────────────────┐  │  │
│  │               teotl_wasm (.wasm via wasm-pack)           │  │  │
│  │                                                          │  │  │
│  │   teotl_engine ── particle sim, nightmare state machine  │  │  │
│  │   teotl_game   ── world graph, characters, quests        │  │  │
│  │   teotl_core   ── shared primitives, math, types         │  │  │
│  └──────────────────────────────────────────────────────────┘  │  │
└─────────────────────────────────────────────────────────────────────┘
```

## Crate Responsibilities

| Crate | Role |
|---|---|
| `teotl_core` | Shared primitives, math, serialisable data types. No platform deps. |
| `teotl_engine` | Particle/fog simulation, nightmare escalation state machine. |
| `teotl_game` | World graph, NPC system, item registry, quest tracker. |
| `teotl_wasm` | `wasm-bindgen` entry point exposing selected APIs to TypeScript. |

## TypeScript Modules

| Module | Role |
|---|---|
| `engine/atmospheric.ts` | Canvas rendering loop, delegating heavy work to WASM. |
| `engine/audio.ts` | Web Audio API management, horror stingers. |
| `engine/nightmare.ts` | Nightmare-mode escalation UI controller. |
| `engine/wasm-bridge.ts` | Loads and wraps the `teotl_wasm` WASM module. |
| `ui/horror-ui.ts` | Psychological-horror DOM effects (glitch, flicker, corrupt text). |

## Data Flow

1. `main.ts` initialises all engines and `WasmBridge`.
2. `WasmBridge` loads the compiled `.wasm` binary dynamically.
3. Each frame, `AtmosphericEngine` calls into WASM for particle updates.
4. `NightmareEngine` tracks escalation level and pushes CSS vars + atmospheric params.
5. `HorrorUI` reacts to level changes with DOM/CSS effects.

## See Also

- [ROADMAP](ROADMAP.md)
- [ENGINE](ENGINE.md)
- [CONTENT_PIPELINE](CONTENT_PIPELINE.md)
