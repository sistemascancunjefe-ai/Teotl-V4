/**
 * TEOTL V4 — Audio Engine
 * Web Audio API horror sound system with procedural ambient generation.
 */

export class AudioEngine {
  constructor() {
    this._ctx         = null;
    this._masterGain  = null;
    this._enabled     = false;
    this._volume      = 0.6;
    this._oscillators = [];
    this._noiseSource = null;
    this._nightmareMode = false;
    this._noiseBuffer = null;
  }

  /**
   * Initialize Web Audio context (must be called from a user gesture).
   */
  init() {
    if (this._ctx) return this;
    try {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._masterGain = this._ctx.createGain();
      this._masterGain.gain.value = this._volume;
      this._masterGain.connect(this._ctx.destination);
    } catch {
      // Web Audio API not available — degrade gracefully
      this._ctx = null;
    }
    return this;
  }

  /** Whether the AudioContext has been created. */
  isInitialized() {
    return this._ctx !== null;
  }

  /** Enable audio and begin ambient drone. */
  enable() {
    if (!this._ctx) this.init();
    if (!this._ctx) return;
    this._enabled = true;
    if (this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
    this._startAmbient();
    return this;
  }

  /** Disable audio and stop all sources. */
  disable() {
    this._enabled = false;
    this._stopAmbient();
    return this;
  }

  /** Toggle enabled state. Returns new state. */
  toggle() {
    this._enabled ? this.disable() : this.enable();
    return this._enabled;
  }

  /** @param {number} vol  0 – 1 */
  setVolume(vol) {
    this._volume = Math.max(0, Math.min(1, vol));
    if (this._masterGain) {
      this._masterGain.gain.setTargetAtTime(this._volume, this._ctx.currentTime, 0.1);
    }
  }

  /** Ramp up intensity for nightmare mode. */
  setNightmareMode(active) {
    this._nightmareMode = active;
    if (!this._ctx || !this._enabled) return;
    this._stopAmbient();
    this._startAmbient();
  }

  /**
   * Play a short horror stinger (click/pop event).
   * @param {'click'|'whisper'|'heartbeat'} type
   */
  playStinger(type = 'click') {
    if (!this._ctx || !this._enabled) return;
    switch (type) {
      case 'click':
        this._playClick();
        break;
      case 'heartbeat':
        this._playHeartbeat();
        break;
      default:
        this._playClick();
    }
  }

  /** Destroy and release all audio resources. */
  destroy() {
    this.disable();
    if (this._ctx) {
      this._ctx.close();
      this._ctx = null;
    }
  }

  // ---- private ----

  _startAmbient() {
    if (!this._ctx) return;
    const now = this._ctx.currentTime;

    // Low-frequency ominous drone
    const droneFreqs = this._nightmareMode
      ? [27.5, 41.2, 55.0, 82.4]
      : [27.5, 41.2, 55.0];

    for (const freq of droneFreqs) {
      const osc  = this._ctx.createOscillator();
      const gain = this._ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(
        this._nightmareMode ? 0.04 : 0.02,
        now + 3
      );

      osc.connect(gain);
      gain.connect(this._masterGain);
      osc.start(now);
      this._oscillators.push({ osc, gain });
    }

    // Sub-bass rumble
    this._startNoiseLayer();
  }

  _stopAmbient() {
    if (!this._ctx) return;
    const now = this._ctx.currentTime;

    for (const { osc, gain } of this._oscillators) {
      gain.gain.setTargetAtTime(0, now, 0.5);
      osc.stop(now + 2);
    }
    this._oscillators = [];

    if (this._noiseSource) {
      try { this._noiseSource.stop(); } catch (err) {
        if (err.name !== 'InvalidStateError') console.error('[AudioEngine] unexpected error stopping noise source:', err);
      }
      this._noiseSource = null;
    }
  }

  _startNoiseLayer() {
    if (!this._ctx) return;

    // Reuse cached noise buffer if sampleRate matches
    if (!this._noiseBuffer || this._noiseBuffer.sampleRate !== this._ctx.sampleRate) {
      const bufferSize  = this._ctx.sampleRate * 2;
      this._noiseBuffer = this._ctx.createBuffer(1, bufferSize, this._ctx.sampleRate);
      const data        = this._noiseBuffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }
    }

    const source = this._ctx.createBufferSource();
    source.buffer = this._noiseBuffer;
    source.loop   = true;

    const filter = this._ctx.createBiquadFilter();
    filter.type            = 'lowpass';
    filter.frequency.value = 80;

    const gain = this._ctx.createGain();
    gain.gain.value = this._nightmareMode ? 0.03 : 0.01;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this._masterGain);
    source.start();
    this._noiseSource = source;
  }

  _playClick() {
    if (!this._ctx) return;
    const now  = this._ctx.currentTime;
    const osc  = this._ctx.createOscillator();
    const gain = this._ctx.createGain();

    osc.frequency.value = 80;
    osc.type            = 'sine';
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    osc.connect(gain);
    gain.connect(this._masterGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  _playHeartbeat() {
    if (!this._ctx) return;
    const now = this._ctx.currentTime;

    for (const offset of [0, 0.2]) {
      const osc  = this._ctx.createOscillator();
      const gain = this._ctx.createGain();
      osc.frequency.value = 50;
      osc.type            = 'sine';
      gain.gain.setValueAtTime(0, now + offset);
      gain.gain.linearRampToValueAtTime(0.3, now + offset + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.3);
      osc.connect(gain);
      gain.connect(this._masterGain);
      osc.start(now + offset);
      osc.stop(now + offset + 0.4);
    }
  }
}
