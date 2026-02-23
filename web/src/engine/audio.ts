/**
 * AudioEngine — TypeScript placeholder
 *
 * Manages Web Audio API context, horror stingers, and ambient soundscapes.
 * Future versions will stream procedurally generated audio cues from
 * the `teotl_engine` WASM crate.
 *
 * TODO: implement Web Audio graph and WASM integration.
 */

export type StingerName = 'click' | 'heartbeat' | 'whisper' | 'scream';

export class AudioEngine {
  private initialized = false;
  private enabled = true;
  private volume = 0.6;

  init(): void {
    // TODO: create AudioContext and load audio buffers
    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  playStinger(_name: StingerName): void {
    if (!this.initialized || !this.enabled) return;
    // TODO: play the named stinger via Web Audio API
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    // TODO: apply to master gain node
  }

  setNightmareMode(_active: boolean): void {
    // TODO: cross-fade to nightmare ambient track
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}
