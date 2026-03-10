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
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  init(): void {
    if (this.initialized) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      console.error('Web Audio API not supported in this browser');
      return;
    }

    try {
      const ctx: AudioContext = new AudioContextClass();
      const masterGain: GainNode = ctx.createGain();
      masterGain.gain.value = this.volume;
      masterGain.connect(ctx.destination);

      this.ctx = ctx;
      this.masterGain = masterGain;
      this.initialized = true;
    } catch (e) {
      console.error('Failed to create AudioContext', e);
      this.ctx = null;
      this.masterGain = null;
      this.initialized = false;
    }
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
    if (this.ctx && this.masterGain) {
      const gainParam = this.masterGain.gain;
      const now = this.ctx.currentTime;
      if (typeof (gainParam as any).cancelAndHoldAtTime === 'function') {
        (gainParam as any).cancelAndHoldAtTime(now);
      } else {
        gainParam.cancelScheduledValues(now);
      }
      gainParam.setTargetAtTime(this.volume, now, 0.1);
    }
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
