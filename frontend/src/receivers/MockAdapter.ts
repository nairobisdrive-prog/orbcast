import type { ReceiverAdapter } from './ReceiverAdapter';

/**
 * Mock Receiver — demonstrates adapter extensibility.
 * Use this as a template for Chromecast / DLNA adapters.
 */
export class MockAdapter implements ReceiverAdapter {
  readonly id = 'mock-receiver-1';
  readonly name = 'Demo Receiver';
  readonly type = 'mock' as const;
  readonly icon = 'monitor-speaker';
  readonly description = 'Simulated receiver for testing the adapter interface';

  private _connected = false;
  private _volume = 0.5;
  private _status: 'idle' | 'connecting' | 'connected' | 'error' = 'idle';

  async connect(streamUrl: string): Promise<void> {
    this._status = 'connecting';
    console.log(`[MockAdapter] Connecting to stream: ${streamUrl}`);
    await new Promise((r) => setTimeout(r, 1200));
    this._connected = true;
    this._status = 'connected';
    console.log('[MockAdapter] Connected');
  }

  async disconnect(): Promise<void> {
    await new Promise((r) => setTimeout(r, 400));
    this._connected = false;
    this._status = 'idle';
    console.log('[MockAdapter] Disconnected');
  }

  async setVolume(volume: number): Promise<void> {
    this._volume = Math.max(0, Math.min(1, volume));
    console.log(`[MockAdapter] Volume: ${Math.round(this._volume * 100)}`);
  }

  async getVolume(): Promise<number> {
    return this._volume;
  }

  isConnected(): boolean {
    return this._connected;
  }

  getStatus() {
    return this._status;
  }
}

export class ChromecastPlaceholder implements ReceiverAdapter {
  readonly id = 'chromecast-placeholder';
  readonly name = 'Chromecast';
  readonly type = 'chromecast' as const;
  readonly icon = 'cast';
  readonly description = 'Chromecast support — coming soon';

  private _status: 'idle' | 'connecting' | 'connected' | 'error' = 'idle';

  async connect(_streamUrl: string): Promise<void> {
    throw new Error('Chromecast adapter not yet implemented. See /docs/architecture.md for the integration path.');
  }
  async disconnect(): Promise<void> {}
  async setVolume(_v: number): Promise<void> {}
  async getVolume(): Promise<number> { return 0; }
  isConnected(): boolean { return false; }
  getStatus() { return this._status; }
}
