/**
 * HorrorUI
 * Manages the psychological-horror UI layer: glitch effects, corrupted text,
 * flickering elements, and atmosphere text injection.
 */

export interface HorrorUIOptions {
  glitchIntensity?:    number;
  flickerEnabled?:     boolean;
  corruptTextEnabled?: boolean;
}

export class HorrorUI {
  private container: HTMLElement | null = null;
  private running = false;
  private options: Required<HorrorUIOptions>;
  private glitchInterval: any = null;

  constructor(options: HorrorUIOptions = {}) {
    this.options = {
      glitchIntensity:    options.glitchIntensity    ?? 5,
      flickerEnabled:     options.flickerEnabled     ?? true,
      corruptTextEnabled: options.corruptTextEnabled ?? true,
    };
  }

  mount(container: HTMLElement): void {
    this.container = container;

    // Add some initial scary UI
    const title = document.createElement('h1');
    title.className = 'horror-title glitch';
    title.setAttribute('data-text', 'TEOTL V4');
    title.textContent = 'TEOTL V4';

    const subtitle = document.createElement('p');
    subtitle.className = 'horror-subtitle';
    subtitle.textContent = 'NIGHTMARE MODE INITIALIZED...';

    const engineStatus = document.createElement('div');
    engineStatus.id = 'engine-status';
    engineStatus.className = 'engine-status';
    engineStatus.innerHTML = `
      <p>Engine status: <span class="status-ok">ONLINE</span></p>
      <p>Intensity: <span id="intensity-val">0.0</span></p>
      <p>Nightmare Level: <span id="nightmare-val">CALM</span></p>
    `;

    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group';

    const increaseBtn = document.createElement('button');
    increaseBtn.className = 'horror-btn';
    increaseBtn.textContent = 'EMBRACE NIGHTMARE';
    increaseBtn.onclick = () => {
      const engine = (window as any).__teotl_engine__;
      if (engine) {
        const currentLevel = engine.get_nightmare_level();
        if (currentLevel < 4) {
          engine.set_nightmare_level(currentLevel + 1);
          this.flashGlitch(0.8);
          this.updateStatus();
        }
      }
    };

    const decreaseBtn = document.createElement('button');
    decreaseBtn.className = 'horror-btn';
    decreaseBtn.textContent = 'SEEK LIGHT';
    decreaseBtn.onclick = () => {
      const engine = (window as any).__teotl_engine__;
      if (engine) {
        const currentLevel = engine.get_nightmare_level();
        if (currentLevel > 0) {
          engine.set_nightmare_level(currentLevel - 1);
          this.updateStatus();
        }
      }
    };

    buttonGroup.appendChild(decreaseBtn);
    buttonGroup.appendChild(increaseBtn);

    this.container.appendChild(title);
    this.container.appendChild(subtitle);
    this.container.appendChild(engineStatus);
    this.container.appendChild(buttonGroup);

    this.start();

    // Update loop
    setInterval(() => this.updateStatus(), 100);
  }

  updateStatus(): void {
    const engine = (window as any).__teotl_engine__;
    if (engine) {
      engine.tick(0.016);
      const intensityVal = document.getElementById('intensity-val');
      const nightmareVal = document.getElementById('nightmare-val');

      if (intensityVal) intensityVal.textContent = engine.get_intensity().toFixed(2);
      if (nightmareVal) nightmareVal.textContent = engine.get_nightmare_name();
    }
  }

  start(): void {
    this.running = true;

    if (this.options.glitchIntensity > 0) {
      this.glitchInterval = setInterval(() => {
        if (Math.random() < 0.1) {
          this.flashGlitch(Math.random() * 0.5);
        }
      }, 2000);
    }
  }

  stop(): void {
    this.running = false;
    if (this.glitchInterval) {
      clearInterval(this.glitchInterval);
      this.glitchInterval = null;
    }
  }

  setNightmareMode(_active: boolean): void {
    // TODO: escalate or calm visual effects
  }

  setOptions(patch: HorrorUIOptions): void {
    Object.assign(this.options, patch);
  }

  flashGlitch(intensity: number): void {
    const overlay = document.getElementById('glitch-overlay');
    if (overlay) {
      overlay.style.opacity = intensity.toString();
      overlay.style.display = 'block';
      setTimeout(() => {
        overlay.style.opacity = '0';
        overlay.style.display = 'none';
      }, 50 + Math.random() * 150);
    }
  }
}
