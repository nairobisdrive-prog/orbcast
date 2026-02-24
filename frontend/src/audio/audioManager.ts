/**
 * Audio Manager — OrbCast
 *
 * Modes:
 *   demo   — simulated signal (always available, drives orb visually)
 *   mic    — microphone input via expo-av (available in managed/Go)
 *   system — MediaProjection system audio capture (requires custom dev build)
 *   blocked — capture unavailable
 *
 * For real casting (system mode), this module also starts the TcpStreamServer
 * so Sonos can connect directly to the phone on the local network.
 */

import { tcpStreamServer } from './tcpStreamServer';

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
  private _t = 0;
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

  /**
   * Start audio capture.
   * @param mode  'demo' | 'mic' | 'system'
   * @returns The stream URL if a TcpStreamServer was started, null otherwise.
   */
  async start(mode: CaptureMode = 'demo'): Promise<string | null> {
    this.stop();
    this._mode = mode;

    if (mode === 'demo') {
      this._startDemoMode();
      return null;
    }

    if (mode === 'mic') {
      // expo-av microphone capture — works in managed workflow
      // TODO: implement real mic capture via expo-av Audio.Recording
      console.warn('[AudioManager] Mic capture not yet wired to stream. Using demo.');
      this._startDemoMode();
      return null;
    }

    if (mode === 'system') {
      return await this._startSystemCapture();
    }

    this._mode = 'blocked';
    this._emit({ energy: 0, bass: 0, presence: 0, volume: this._volume });
    return null;
  }

  stop() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
    this._t = 0;
    tcpStreamServer.stop();
  }

  // ─── System audio capture (MediaProjection) ──────────────────────────────
  private async _startSystemCapture(): Promise<string | null> {
    try {
      // MediaProjection native module — only available in custom dev builds
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const MediaProjection = require('../native/MediaProjectionCapture').default;

      // Start the native capture session; it provides PCM chunks via a callback
      await MediaProjection.start({
        sampleRate: 44100,
        channels: 2,
        encoding: 'pcm_16bit',
        onAudio: (pcm: Buffer) => {
          tcpStreamServer.pushAudio(pcm);
          // Derive metrics from PCM amplitude for orb visualisation
          this._emitMetricsFromPCM(pcm);
        },
      });

      // Start the local TCP HTTP server so Sonos can connect
      const serverState = await tcpStreamServer.start();
      tcpStreamServer.setPcmSource(null); // MediaProjection pushes directly

      if (serverState.streamUrl) {
        this._mode = 'system';
        return serverState.streamUrl;
      }

      console.warn('[AudioManager] TCP server started but no URL available');
      this._startDemoMode();
      return null;
    } catch (err: any) {
      // MediaProjection module not available (Expo Go / managed workflow)
      console.warn('[AudioManager] System capture unavailable:', err.message);
      this._mode = 'blocked';
      this._emit({ energy: 0, bass: 0, presence: 0, volume: this._volume });
      return null;
    }
  }

  // ─── Demo mode (simulated audio signal for orb visualisation) ────────────
  private _startDemoMode() {
    this._mode = 'demo';
    this._interval = setInterval(() => {
      this._t += 0.05;
      const t = this._t;

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
    }, 50);
  }

  // ─── Derive orb metrics from raw PCM amplitude ────────────────────────────
  private _emitMetricsFromPCM(pcm: Buffer) {
    if (pcm.length < 4) return;
    let sum = 0;
    let bassSum = 0;
    const samples = Math.min(pcm.length / 2, 1024);
    for (let i = 0; i < samples; i++) {
      const sample = pcm.readInt16LE(i * 2) / 32768;
      sum += sample * sample;
      if (i < samples / 4) bassSum += sample * sample;
    }
    const energy = Math.sqrt(sum / samples);
    const bass = Math.sqrt(bassSum / (samples / 4));
    this._emit({
      energy: Math.min(1, energy * 3),
      bass: Math.min(1, bass * 3),
      presence: Math.min(1, energy * 2),
      volume: this._volume,
    });
  }

  private _emit(metrics: AudioMetrics) {
    this._callbacks.forEach((cb) => cb(metrics));
  }
}

export const audioManager = new AudioManager();
