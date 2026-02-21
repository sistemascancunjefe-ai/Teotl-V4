/**
 * TEOTL V4 — Atmospheric Engine
 * Canvas-based fog, particle, and ambient effect system.
 */

export class AtmosphericEngine {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {object} [options]
   * @param {number} [options.particleCount=150]
   * @param {number} [options.fogSpeed=3]
   * @param {number} [options.opacity=0.7]
   */
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = {
      particleCount: options.particleCount ?? 150,
      fogSpeed:      options.fogSpeed      ?? 3,
      opacity:       options.opacity       ?? 0.7,
    };

    this._particles = [];
    this._fogLayers = [];
    this._running   = false;
    this._frameId   = null;
    this._time      = 0;

    this._handleResize = this._handleResize.bind(this);
    this._loop         = this._loop.bind(this);
  }

  /** Initialize and mount the engine. */
  init() {
    this._resize();
    this._spawnParticles();
    this._spawnFogLayers();
    window.addEventListener('resize', this._handleResize);
    return this;
  }

  /** Start the render loop. */
  start() {
    if (this._running) return;
    this._running = true;
    this._loop();
    return this;
  }

  /** Stop the render loop. */
  stop() {
    this._running = false;
    if (this._frameId !== null) {
      cancelAnimationFrame(this._frameId);
      this._frameId = null;
    }
    return this;
  }

  /** Destroy the engine and remove listeners. */
  destroy() {
    this.stop();
    window.removeEventListener('resize', this._handleResize);
    this._particles = [];
    this._fogLayers = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Update engine options at runtime.
   * @param {object} newOptions
   */
  setOptions(newOptions) {
    Object.assign(this.options, newOptions);
    if (newOptions.particleCount !== undefined) {
      this._spawnParticles();
    }
  }

  /** Enable nightmare-intensity overrides. */
  setNightmareMode(active) {
    this._nightmareMode = active;
    if (active) {
      this.options.fogSpeed      = Math.min(this.options.fogSpeed * 2, 10);
      this.options.opacity       = Math.min(this.options.opacity * 1.4, 1);
      this.options.particleCount = Math.min(this.options.particleCount * 2, 600);
      this._spawnParticles();
    }
  }

  // ---- private ----

  _resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  _handleResize() {
    this._resize();
    this._spawnParticles();
    this._spawnFogLayers();
  }

  _spawnParticles() {
    const { particleCount } = this.options;
    const { width, height } = this.canvas;

    this._particles = Array.from({ length: particleCount }, () =>
      this._makeParticle(width, height, true)
    );
  }

  _spawnFogLayers() {
    const { width, height } = this.canvas;
    this._fogLayers = Array.from({ length: 5 }, (_, i) => ({
      x:      Math.random() * width,
      y:      Math.random() * height,
      radius: width * 0.3 + i * width * 0.08,
      speed:  (0.1 + Math.random() * 0.2) * (i % 2 === 0 ? 1 : -1),
      phase:  Math.random() * Math.PI * 2,
    }));
  }

  /**
   * @param {number} width
   * @param {number} height
   * @param {boolean} [randomY=false]
   * @returns {object}
   */
  _makeParticle(width, height, randomY = false) {
    return {
      x:       Math.random() * width,
      y:       randomY ? Math.random() * height : height + 5,
      vx:      (Math.random() - 0.5) * 0.4,
      vy:      -(0.1 + Math.random() * 0.5),
      radius:  0.5 + Math.random() * 2,
      alpha:   0.05 + Math.random() * 0.3,
      life:    0,
      maxLife: 200 + Math.random() * 400,
      hue:     Math.random() < 0.15 ? 0 : 0, // blood-red or dark
      sat:     Math.random() < 0.15 ? 80 : 0,
    };
  }

  _loop() {
    if (!this._running) return;
    this._time++;
    this._render();
    this._frameId = requestAnimationFrame(this._loop);
  }

  _render() {
    const { ctx, canvas, options, _time } = this;
    const { width, height } = canvas;
    const alpha = options.opacity * 0.015;

    // Semi-transparent black fill for trail effect
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.fillRect(0, 0, width, height);

    // Fog layers
    this._renderFog(_time);

    // Particles
    this._renderParticles(width, height);
  }

  _renderFog(time) {
    const { ctx, canvas, options } = this;
    const { width, height } = canvas;
    const fogAlpha = options.opacity * 0.04;

    ctx.save();
    for (const layer of this._fogLayers) {
      const x = layer.x + Math.sin(time * 0.002 * options.fogSpeed + layer.phase) * 80;
      const y = layer.y + Math.cos(time * 0.001 * options.fogSpeed + layer.phase) * 40;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, layer.radius);
      gradient.addColorStop(0,   `rgba(20, 0, 0, ${fogAlpha})`);
      gradient.addColorStop(0.5, `rgba(10, 0, 0, ${fogAlpha * 0.5})`);
      gradient.addColorStop(1,   `rgba(0, 0, 0, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();
  }

  _renderParticles(width, height) {
    const { ctx } = this;
    ctx.save();

    for (let i = 0; i < this._particles.length; i++) {
      const p = this._particles[i];
      p.x   += p.vx;
      p.y   += p.vy;
      p.life++;

      const lifeRatio = p.life / p.maxLife;
      const fade = lifeRatio < 0.1
        ? lifeRatio / 0.1
        : lifeRatio > 0.8
          ? (1 - lifeRatio) / 0.2
          : 1;

      ctx.globalAlpha = p.alpha * fade;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

      const color = p.sat > 0
        ? `hsl(${p.hue}, ${p.sat}%, 50%)`
        : `hsl(0, 0%, 40%)`;
      ctx.fillStyle = color;
      ctx.fill();

      // Respawn
      if (p.life >= p.maxLife || p.y < -10 || p.x < -10 || p.x > width + 10) {
        this._particles[i] = this._makeParticle(width, height);
      }
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }
}
