export interface SonosDevice {
  id: string;
  name: string;
  room: string;
  ip: string;
  port: number;
  status: 'online' | 'offline' | 'unknown';
  volume: number;
  isMuted: boolean;
  modelName?: string;
  nickname?: string;
}

export interface AudioMetrics {
  energy: number;    // 0..1 overall
  bass: number;      // 0..1 low freq
  presence: number;  // 0..1 mid freq
  volume: number;    // 0..1 playback
}

export interface CastingState {
  isCasting: boolean;
  sourceLabel: string;
  captureMode: 'system' | 'mic' | 'demo' | 'blocked';
  streamUrl: string | null;
  connectedClients: number;
  bufferFill: number; // 0..1
}

export interface ReceiverAdapter {
  id: string;
  name: string;
  type: 'sonos' | 'mock' | 'chromecast' | 'dlna';
  connect: (streamUrl: string) => Promise<void>;
  disconnect: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  isConnected: () => boolean;
}

export type AudioQuality = 'low' | 'medium' | 'high';

export interface AppSettings {
  audioQuality: AudioQuality;
  latencyHint: number; // ms
  reduceMotion: boolean;
  sourceLabel: string;
}

export interface UserProfile {
  id: string;
  display_name: string | null;
  email: string | null;
}

export interface DiagnosticsInfo {
  discoveredDevices: SonosDevice[];
  selectedDeviceIp: string | null;
  selectedDevicePort: number | null;
  streamStatus: 'idle' | 'connecting' | 'streaming' | 'error';
  connectedClients: number;
  bufferFill: number;
  lastHandshakeResult: string | null;
}
