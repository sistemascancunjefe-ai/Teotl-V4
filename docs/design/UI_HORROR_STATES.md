# UI Horror States Specification

## Overview

The Psychological Horror UI in Teotl V4 reacts dynamically to the engine's current Nightmare Level. The engine emits a tension value (0.0 to 1.0) and a discrete nightmare level (0 to 4), which map to five primary states: Dormant, Awakening, Dread, Terror, and Abyss.

This document outlines the visual and interactive behaviors associated with each state.

## Core States

### 0 - DORMANT (Tension: 0.00 - 0.24)
- **Description**: The default state. Calm, safe, and relatively normal.
- **Visuals**: Clean UI, normal color palette, stable typography.
- **Post-processing**: None.
- **Interactions**: Standard snappy responses.
- **HUD**: Minimal interface elements, hidden sanity meter.

### 1 - AWAKENING (Tension: 0.25 - 0.49)
- **Description**: Unease begins. Something feels slightly off.
- **Visuals**: Subtle color desaturation, occasional minor UI flickers (every 30-60s).
- **Post-processing**: Barely noticeable vignette effect around the screen edges.
- **Interactions**: Normal.
- **HUD**: Sanity meter becomes visible but stable. Objective indicator occasionally wavers.

### 2 - DREAD (Tension: 0.50 - 0.74)
- **Description**: Active paranoia. The environment is clearly hostile.
- **Visuals**: Increased contrast, darker shadows in UI elements. Typography occasionally swaps to a slightly corrupted font variant.
- **Post-processing**: Heavier vignette, minor chromatic aberration on extreme edges.
- **Interactions**: Menu buttons might briefly hesitate or play a subtle dissonance sound on hover.
- **HUD**: Sanity meter shows visible strain. Objective indicator is unstable.

### 3 - TERROR (Tension: 0.75 - 0.89)
- **Description**: Direct threat or high stress. Fight or flight.
- **Visuals**: Harsh lighting on UI elements, corrupted text becomes frequent, UI elements may drift slightly from their anchor points.
- **Post-processing**: Significant chromatic aberration, intermittent glitch shaders (CRT tearing), pulsing vignette tied to heartbeat audio.
- **Interactions**: Frantic menu interactions, corrupted tooltips.
- **HUD**: Sanity meter flashes or cracks. Screen edges bleed darkness.

### 4 - ABYSS (Tension: 0.90 - 1.00)
- **Description**: Maximum trauma. Impending doom or death state.
- **Visuals**: Total UI breakdown. Heavy text corruption, aggressive flickering, inverted colors on flashes.
- **Post-processing**: Overwhelming glitch effects, severe chromatic aberration, intense CRT distortion, color bleeding.
- **Interactions**: Distorted input feedback, fake "error" messages or broken UI elements.
- **HUD**: Sanity meter shattered or violently vibrating. Screen heavily obscured by darkness and static.

## Transition Effects

When the state escalates:
- Trigger a sudden visual "stinger" (e.g., a rapid glitch flash covering the screen).
- Audio stinger plays synchronously.
- UI elements shake or distort momentarily before settling into the new state's baseline.

When the state de-escalates:
- Slow, fading transition back to stability.
- Lingering visual artifacts (like trailing afterimages) that slowly dissolve.
