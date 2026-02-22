/**
 * Audio Manager — OrbCast
 *
 * In Expo managed workflow, full system audio capture is NOT possible without
 * a custom dev build. This module provides:
 *  1. Demo mode: simulated audio signal (drives the orb in UI preview)
 *  2. Architecture stubs for real capture (custom build path)
 *
 * See /docs/limitations.md for full explanation.
 */

export type AudioMetrics = {
  energy: number;
  bass: number;
  presence: number;
  volume: number;
};

export type CaptureMode = 'demo' | 'mic' | 'system' | 'blocked';

type MetricsCallback = (metrics: AudioMetrics) => void;

class AudioManager {
  private _mode: CaptureMode = 'demo';
  private _interval: ReturnType<typeof setInterval> | null = null;
  private _callbacks: Set<MetricsCallback> = new Set();
  private _t = 0; // animation clock
  private _volume = 0.5;

  get mode(): CaptureMode {
    return this._mode;
  }

  subscribe(cb: MetricsCallback): () => void {
    this._callbacks.add(cb);
    return () => this._callbacks.delete(cb);
  }

  setVolume(v: number) {
    this._volume = Math.max(0, Math.min(1, v));
  }

  start(mode: CaptureMode = 'demo') {
    this.stop();
    this._mode = mode;

    if (mode === 'demo') {
      this._startDemoMode();
    } else if (mode === 'mic') {
      // TODO: use expo-av Audio.Recording in a custom build
      console.warn('[AudioManager] Mic mode requires expo-av with custom permissions.');
      this._startDemoMode();
    } else {
      // 'system' / 'blocked'
      console.warn('[AudioManager] System audio capture blocked on Android managed workflow.');
      this._mode = 'blocked';
      this._emit({ energy: 0, bass: 0, presence: 0, volume: this._volume });
    }
  }

  stop() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
    this._t = 0;
  }

  private _startDemoMode() {
    this._interval = setInterval(() => {
      this._t += 0.05;
      const t = this._t;

      // Simulate realistic audio energy pattern
      const energy =
        0.3 +
        0.25 * Math.sin(t * 1.7) +
        0.15 * Math.sin(t * 3.3) +
        0.08 * Math.sin(t * 7.1) * (0.5 + 0.5 * Math.sin(t * 0.3));

      const bass =
        0.2 +
        0.3 * Math.pow(Math.abs(Math.sin(t * 0.8)), 0.5) +
        0.1 * Math.sin(t * 2.1);

      const presence =
        0.3 +
        0.2 * Math.sin(t * 2.5 + 1) +
        0.1 * Math.cos(t * 5.0);

      this._emit({
        energy: Math.max(0, Math.min(1, energy)),
        bass: Math.max(0, Math.min(1, bass)),
        presence: Math.max(0, Math.min(1, presence)),
        volume: this._volume,
      });
    }, 50); // 20fps signal updates
  }

  private _emit(metrics: AudioMetrics) {
    this._callbacks.forEach((cb) => cb(metrics));
  }
}

export const audioManager = new AudioManager();
