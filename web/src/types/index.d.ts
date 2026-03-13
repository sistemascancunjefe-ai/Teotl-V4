/**
 * Global type definitions for the web host.
 */

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }

  interface AudioParam {
    cancelAndHoldAtTime(cancelTime: number): AudioParam;
  }
}

// TODO: Define comprehensive global types as the Rust bindings grow.
export {};
