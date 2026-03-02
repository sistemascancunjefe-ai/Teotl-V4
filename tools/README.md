# Tools

This directory contains asset pipeline and validation scripts for Teotl V4.

## Scripts (planned)

| Script | Description | Status |
|---|---|---|
| `pack-assets.sh` | Converts source assets (`assets/source/`) to runtime-optimised formats in `assets/runtime/` | 🚧 TODO |
| `validate-assets.sh` | Checks that all entries in `assets/manifest.json` exist on disk | 🚧 TODO |
| `validate-content.sh` | Validates YAML files under `content/` against JSON Schema | 🚧 TODO |
| `gen-wasm-types.sh` | Generates TypeScript type stubs from wasm-bindgen output | 🚧 TODO |

## Usage

```bash
# Pack all source assets to runtime formats (requires ImageMagick, ffmpeg)
bash tools/pack-assets.sh

# Validate manifest integrity
bash tools/validate-assets.sh

# Validate content YAML
bash tools/validate-content.sh
```

## Dependencies

- **ImageMagick** — image conversion (PNG/PSD → WebP/AVIF)
- **ffmpeg** — audio conversion (WAV/FLAC → OGG/MP3)
- **wasm-pack** — Rust → WASM compilation
- **ajv-cli** — JSON Schema validation for content YAML

Install with your system package manager. Exact setup steps will be documented
once the pipeline is implemented.
