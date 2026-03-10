# Art Bible — Teotl V4 · Nightmare Mode

> **Status:** Placeholder — expand with art director.

## Visual Identity

| Aspect | Direction |
|---|---|
| **Palette** | Deep blacks, desaturated stone greys, blood reds, poison greens, electric blues for corruption glitch |
| **Typography** | Distressed serif for diegetic text; corrupted monospace for UI glitch states |
| **Lighting** | Single harsh point sources (candles, cracks of light); no ambient fill |
| **Texture** | Rough stone, rust, wet surfaces; digital noise layered over everything at nightmare level ≥ 2 |

## UI Design Language

The UI embraces the horror aesthetic:

- **Glitch effects:** CSS `clip-path` animation splitting elements horizontally;
  RGB channel-shift using `mix-blend-mode`.
- **Flicker:** randomised CSS `opacity` transitions on key text elements.
- **Corrupted text:** character-level substitution with Unicode lookalikes,
  glitch characters, and Nahuatl loanwords.
- **Vignette:** radial gradient overlay intensifying with nightmare level.

## Environment Art

- **Mesoamerican motifs:** step pyramids, serpent columns, obsidian surfaces.
- **Corruption layer:** digital artefacts (JPEG noise, pixelation, scanlines)
  overlaid on organic stone textures.
- **Parallax depth:** 3–5 background layers on environment screens.

## Character Art

- **Style:** High-contrast silhouettes legible at low nightmare visibility.
- **Horror escalation:** character designs gain distortion artefacts at
  higher nightmare levels (stretched limbs, texture breakup).
- **No blood-gore:** body horror expressed through geometry distortion and
  texture corruption rather than explicit gore.

## Splasharts

See [SPLASHARTS](SPLASHARTS.md) for individual splash artwork briefs.

## File Format Requirements

| Type | Source | Runtime |
|---|---|---|
| Illustrations | PSD / 300 dpi | WebP (lossy 85%) |
| UI elements | SVG / PSD | WebP / SVG |
| Sprite sheets | PSD / Aseprite | WebP sprite atlas |
| Audio | 48 kHz WAV / FLAC | OGG Vorbis 192 kbps |
