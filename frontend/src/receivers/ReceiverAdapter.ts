/**
 * Receiver Adapter Interface
 * Extend this to support Chromecast, DLNA, AirPlay, etc.
 */
export interface ReceiverAdapter {
  readonly id: string;
  readonly name: string;
  readonly type: 'sonos' | 'mock' | 'chromecast' | 'dlna' | 'airplay';
  readonly icon: string;
  readonly description: string;

  connect(streamUrl: string): Promise<void>;
  disconnect(): Promise<void>;
  setVolume(volume: number): Promise<void>;
  getVolume(): Promise<number>;
  isConnected(): boolean;
  getStatus(): 'idle' | 'connecting' | 'connected' | 'error';
}

export type ReceiverType = ReceiverAdapter['type'];
