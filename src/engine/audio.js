/**
 * TEOTL V4 — Audio Engine
 * Web Audio API horror sound system with procedural ambient generation.
 *
 * Reactive to NightmareEngine levels 0–4:
 *   0 DORMANT   — near-silence, barely audible sub-bass
 *   1 AWAKENING — low drone, subtle noise
 *   2 DREAD     — wider drone stack, thicker noise floor
 *   3 TERROR    — dissonant overtones, heavy noise
 *   4 ABYSS     — maximum density, full-range noise
 *
 * Crossfade duration between levels: CROSSFADE_TIME seconds.
 * Each stinger type has an individual cooldown to prevent spamming.
 */

/** Per-level ambient configuration (drone frequencies, gains, low-pass cutoff). */
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

/** Crossfade duration in seconds when transitioning between nightmare levels. */
const CROSSFADE_TIME = 2.0;

/** Minimum ms between successive plays of the same stinger type (cooldown). */
const STINGER_COOLDOWNS = {
  click:     500,
  heartbeat: 3000,
  whisper:   8000,
  screech:   15000,
};

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
      this._ctx = new window.AudioContext();
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

  /**
   * Set nightmare intensity level and crossfade to the matching ambient layer.
   * @param {number} level  0 (DORMANT) – 4 (ABYSS)
   */
  setNightmareLevel(level) {
    const clamped = Math.max(0, Math.min(AMBIENT_CONFIGS.length - 1, Math.round(level)));
    if (clamped === this._nightmareLevel) return;
    this._nightmareLevel = clamped;
    if (!this._ctx || !this._enabled) return;
    this._crossfadeAmbient();
  }

  /**
   * Convenience wrapper kept for backward compatibility.
   * Maps a boolean to level 1 (active) or 0 (inactive).
   * @param {boolean} active
   */
  setNightmareMode(active) {
    this.setNightmareLevel(active ? 1 : 0);
  }

  /**
   * Play a short horror stinger, subject to per-type cooldown.
   * @param {'click'|'heartbeat'|'whisper'|'screech'} type
   */
  playStinger(type = 'click') {
    if (!this._ctx || !this._enabled) return;
    if (!this._stingerReady(type)) return;
    this._stingerLastPlayed.set(type, Date.now());
    switch (type) {
      case 'click':
        this._playClick();
        break;
      case 'heartbeat':
        this._playHeartbeat();
        break;
      case 'whisper':
        this._playWhisper();
        break;
      case 'screech':
        this._playScreech();
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

  /** Returns true when the stinger cooldown has elapsed. */
  _stingerReady(type) {
    const cooldown = STINGER_COOLDOWNS[type] ?? 500;
    const last     = this._stingerLastPlayed.get(type) ?? 0;
    return (Date.now() - last) >= cooldown;
  }

  /**
   * Crossfade from the current ambient layer to the one matching
   * `_nightmareLevel`.  Running oscillators are faded out and replaced
   * by fresh ones targeting the new config.
   */
  _crossfadeAmbient() {
    if (!this._ctx) return;
    const now = this._ctx.currentTime;

    // Fade out and schedule stop on existing oscillators
    for (const { osc, gain } of this._oscillators) {
      gain.gain.setTargetAtTime(0, now, CROSSFADE_TIME / 4);
      osc.stop(now + CROSSFADE_TIME);
    }
    this._oscillators = [];

    // Fade out current noise gain before replacing
    if (this._noiseGainNode) {
      this._noiseGainNode.gain.setTargetAtTime(0, now, CROSSFADE_TIME / 4);
    }

    this._buildAmbientLayer(CROSSFADE_TIME);
  }

  _startAmbient() {
    if (!this._ctx) return;
    this._buildAmbientLayer(3.0);
  }

  /**
   * Create oscillators and a noise layer for the current `_nightmareLevel`,
   * ramping each gain up over `rampTime` seconds.
   * @param {number} rampTime  Fade-in duration in seconds
   */
  _buildAmbientLayer(rampTime) {
    if (!this._ctx) return;
    const now    = this._ctx.currentTime;
    const config = AMBIENT_CONFIGS[this._nightmareLevel];

    for (const freq of config.droneFreqs) {
      const osc  = this._ctx.createOscillator();
      const gain = this._ctx.createGain();

      osc.type            = 'sawtooth';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(config.droneGain, now + rampTime);

      osc.connect(gain);
      gain.connect(this._masterGain);
      osc.start(now);
      this._oscillators.push({ osc, gain });
    }

    this._replaceNoiseLayer(config, now, rampTime);
  }

  _stopAmbient() {
    if (!this._ctx) return;
    const now = this._ctx.currentTime;

    for (const { osc, gain } of this._oscillators) {
      gain.gain.setTargetAtTime(0, now, 0.5);
      osc.stop(now + 2);
    }
    this._oscillators = [];

    this._stopNoiseSource();
  }

  /** Stop and discard the looping noise source, if one is running. */
  _stopNoiseSource() {
    if (!this._noiseSource) return;
    try { this._noiseSource.stop(); } catch (err) {
      if (err.name !== 'InvalidStateError') console.error('[AudioEngine] unexpected error stopping noise source:', err);
    }
    this._noiseSource   = null;
    this._noiseGainNode = null;
  }

  /**
   * Replace the looping noise layer with one tuned to `config`.
   * @param {object} config
   * @param {number} now       AudioContext.currentTime
   * @param {number} rampTime  Fade-in duration in seconds
   */
  _replaceNoiseLayer(config, now, rampTime) {
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
    filter.frequency.value = config.filterFreq;

    const gain = this._ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(config.noiseGain, now + rampTime);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this._masterGain);
    source.start();

    this._noiseSource   = source;
    this._noiseGainNode = gain;
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

  /** Soft band-limited whisper noise burst — used at DREAD and above. */
  _playWhisper() {
    if (!this._ctx) return;
    const now        = this._ctx.currentTime;
    const bufferSize = this._ctx.sampleRate * 0.6;
    const buffer     = this._ctx.createBuffer(1, bufferSize, this._ctx.sampleRate);
    const data       = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }

    const source = this._ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this._ctx.createBiquadFilter();
    filter.type            = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value         = 0.8;

    const gain = this._ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.15);
    gain.gain.setTargetAtTime(0, now + 0.3, 0.1);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this._masterGain);
    source.start(now);
  }

  /** Short high-pitched screech — reserved for TERROR / ABYSS. */
  _playScreech() {
    if (!this._ctx) return;
    const now  = this._ctx.currentTime;
    const osc  = this._ctx.createOscillator();
    const gain = this._ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.4);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc.connect(gain);
    gain.connect(this._masterGain);
    osc.start(now);
    osc.stop(now + 0.5);
  }
}
