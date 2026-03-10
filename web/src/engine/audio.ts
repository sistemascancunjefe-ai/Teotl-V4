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

const STINGER_COOLDOWNS: Record<string, number> = {
  click: 500,
  heartbeat: 3000,
  whisper: 8000,
  scream: 15000,
};

const AMBIENT_CONFIGS = [
  // 0 DORMANT
  { droneFreqs: [27.5, 41.2],                       droneGain: 0.015, noiseGain: 0.008, filterFreq: 80  },
  // 1 AWAKENING
  { droneFreqs: [27.5, 41.2, 55.0],                 droneGain: 0.020, noiseGain: 0.012, filterFreq: 100 },
  // 2 DREAD
  { droneFreqs: [27.5, 41.2, 55.0, 73.4],           droneGain: 0.028, noiseGain: 0.017, filterFreq: 130 },
  // 3 TERROR
  { droneFreqs: [27.5, 41.2, 55.0, 73.4, 82.4],     droneGain: 0.036, noiseGain: 0.023, filterFreq: 160 },
  // 4 ABYSS
  { droneFreqs: [27.5, 41.2, 55.0, 73.4, 82.4, 110.0], droneGain: 0.045, noiseGain: 0.030, filterFreq: 200 },
];

const CROSSFADE_TIME = 2.0;

export class AudioEngine {
  private initialized = false;
  private enabled = true;
  private volume = 0.6;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private stingerLastPlayed: Map<string, number> = new Map();
  private oscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseGainNode: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private nightmareLevel = 0;

  init(): void {
    if (this.ctx) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
    } catch (e) {
      console.error('Web Audio API not supported', e);
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  playStinger(name: StingerName = 'click'): void {
    if (!this.initialized || !this.enabled || !this.ctx) return;
    if (!this._stingerReady(name)) return;

    this.stingerLastPlayed.set(name, Date.now());

    switch (name) {
      case 'click':
        this._playClick();
        break;
      case 'heartbeat':
        this._playHeartbeat();
        break;
      case 'whisper':
        this._playWhisper();
        break;
      case 'scream':
        this._playScreech();
        break;
    }
  }

  private _stingerReady(type: string): boolean {
    const cooldown = STINGER_COOLDOWNS[type] ?? 500;
    const last = this.stingerLastPlayed.get(type) ?? 0;
    return Date.now() - last >= cooldown;
  }

  private _playClick(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.value = 80;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  private _playHeartbeat(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    for (const offset of [0, 0.2]) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.value = 50;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0, now + offset);
      gain.gain.linearRampToValueAtTime(0.3, now + offset + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.3);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + offset);
      osc.stop(now + offset + 0.4);
    }
  }

  private _playWhisper(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.6;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 0.8;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.15);
    gain.gain.setTargetAtTime(0, now + 0.3, 0.1);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start(now);
  }

  private _playScreech(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.4);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1);
    }
  }

  setNightmareLevel(level: number): void {
    const clamped = Math.max(0, Math.min(AMBIENT_CONFIGS.length - 1, Math.round(level)));
    if (clamped === this.nightmareLevel) return;
    this.nightmareLevel = clamped;
    if (!this.ctx || !this.enabled) return;
    this._crossfadeAmbient();
  }

  setNightmareMode(active: boolean): void {
    this.setNightmareLevel(active ? 1 : 0);
  }

  enable(): void {
    if (!this.ctx) this.init();
    if (!this.ctx) return;
    this.enabled = true;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this._startAmbient();
  }

  disable(): void {
    this.enabled = false;
    this._stopAmbient();
  }

  toggle(): boolean {
    this.enabled ? this.disable() : this.enable();
    return this.enabled;
  }

  private _crossfadeAmbient(): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Fade out and schedule stop on existing oscillators
    for (const { osc, gain } of this.oscillators) {
      gain.gain.setTargetAtTime(0, now, CROSSFADE_TIME / 4);
      osc.stop(now + CROSSFADE_TIME);
    }
    this.oscillators = [];

    // Fade out and schedule stop on existing noise source
    if (this.noiseSource && this.noiseGainNode) {
      const oldSource = this.noiseSource;
      const oldGain = this.noiseGainNode;
      oldGain.gain.setTargetAtTime(0, now, CROSSFADE_TIME / 4);
      try {
        oldSource.stop(now + CROSSFADE_TIME);
      } catch {
        // Source might already be stopped
      }
    }

    this._buildAmbientLayer(CROSSFADE_TIME);
  }

  private _startAmbient(): void {
    if (!this.ctx) return;
    this._buildAmbientLayer(3.0);
  }

  private _buildAmbientLayer(rampTime: number): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const config = AMBIENT_CONFIGS[this.nightmareLevel];

    for (const freq of config.droneFreqs) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(config.droneGain, now + rampTime);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      this.oscillators.push({ osc, gain });
    }

    this._replaceNoiseLayer(config, now, rampTime);
  }

  private _stopAmbient(): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    for (const { osc, gain } of this.oscillators) {
      gain.gain.setTargetAtTime(0, now, 0.5);
      osc.stop(now + 2);
    }
    this.oscillators = [];

    this._stopNoiseSource();
  }

  private _stopNoiseSource(): void {
    if (!this.noiseSource) return;
    try {
      this.noiseSource.stop();
    } catch (err) {
      // Ignore errors if source is already stopped
    }
    this.noiseSource = null;
    this.noiseGainNode = null;
  }

  private _replaceNoiseLayer(config: any, now: number, rampTime: number): void {
    if (!this.ctx || !this.masterGain) return;

    if (!this.noiseBuffer || this.noiseBuffer.sampleRate !== this.ctx.sampleRate) {
      const bufferSize = this.ctx.sampleRate * 2;
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);

      const chunkSize = 16384;
      const randomValues = new Uint32Array(chunkSize);
      for (let i = 0; i < bufferSize; i += chunkSize) {
        const remaining = bufferSize - i;
        const currentBatchSize = Math.min(chunkSize, remaining);
        const batch = currentBatchSize === chunkSize ? randomValues : new Uint32Array(currentBatchSize);
        crypto.getRandomValues(batch);
        for (let j = 0; j < currentBatchSize; j++) {
          data[i + j] = batch[j] / 4294967296 - 0.5;
        }
      }
    }

    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = config.filterFreq;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(config.noiseGain, now + rampTime);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start();

    this.noiseSource = source;
    this.noiseGainNode = gain;
  }
}
