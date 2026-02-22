import { create } from 'zustand';
import type { SonosDevice, AudioMetrics, AppSettings, CastingState } from '../types';

// ─── App Store ────────────────────────────────────────────────────────────────
interface AppStore {
  hasCompletedOnboarding: boolean;
  reduceMotion: boolean;
  setHasCompletedOnboarding: (val: boolean) => void;
  setReduceMotion: (val: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  hasCompletedOnboarding: false,
  reduceMotion: false,
  setHasCompletedOnboarding: (val) => set({ hasCompletedOnboarding: val }),
  setReduceMotion: (val) => set({ reduceMotion: val }),
}));

// ─── Sonos Store ──────────────────────────────────────────────────────────────
interface SonosStore {
  devices: SonosDevice[];
  selectedDevices: string[]; // device IDs
  isScanning: boolean;
  setDevices: (devices: SonosDevice[]) => void;
  setIsScanning: (val: boolean) => void;
  toggleDeviceSelection: (id: string) => void;
  setSelectedDevices: (ids: string[]) => void;
  updateDeviceVolume: (id: string, volume: number) => void;
  updateDeviceNickname: (id: string, nickname: string) => void;
}

export const useSonosStore = create<SonosStore>((set) => ({
  devices: [],
  selectedDevices: [],
  isScanning: false,
  setDevices: (devices) => set({ devices }),
  setIsScanning: (val) => set({ isScanning: val }),
  toggleDeviceSelection: (id) =>
    set((state) => ({
      selectedDevices: state.selectedDevices.includes(id)
        ? state.selectedDevices.filter((d) => d !== id)
        : [...state.selectedDevices, id],
    })),
  setSelectedDevices: (ids) => set({ selectedDevices: ids }),
  updateDeviceVolume: (id, volume) =>
    set((state) => ({
      devices: state.devices.map((d) => (d.id === id ? { ...d, volume } : d)),
    })),
  updateDeviceNickname: (id, nickname) =>
    set((state) => ({
      devices: state.devices.map((d) => (d.id === id ? { ...d, nickname } : d)),
    })),
}));

// ─── Casting Store ────────────────────────────────────────────────────────────
interface CastingStore extends CastingState {
  audioMetrics: AudioMetrics;
  setIsCasting: (val: boolean) => void;
  setSourceLabel: (label: string) => void;
  setCaptureMode: (mode: CastingState['captureMode']) => void;
  setStreamUrl: (url: string | null) => void;
  setAudioMetrics: (metrics: Partial<AudioMetrics>) => void;
  updateConnectedClients: (n: number) => void;
}

export const useCastingStore = create<CastingStore>((set) => ({
  isCasting: false,
  sourceLabel: 'Device Audio',
  captureMode: 'demo',
  streamUrl: null,
  connectedClients: 0,
  bufferFill: 0,
  audioMetrics: { energy: 0, bass: 0, presence: 0, volume: 0.5 },
  setIsCasting: (val) => set({ isCasting: val }),
  setSourceLabel: (label) => set({ sourceLabel: label }),
  setCaptureMode: (mode) => set({ captureMode: mode }),
  setStreamUrl: (url) => set({ streamUrl: url }),
  setAudioMetrics: (metrics) =>
    set((state) => ({ audioMetrics: { ...state.audioMetrics, ...metrics } })),
  updateConnectedClients: (n) => set({ connectedClients: n }),
}));

// ─── Settings Store ───────────────────────────────────────────────────────────
interface SettingsStore extends AppSettings {
  setAudioQuality: (q: AppSettings['audioQuality']) => void;
  setLatencyHint: (ms: number) => void;
  setSourceLabel: (label: string) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  audioQuality: 'medium',
  latencyHint: 200,
  reduceMotion: false,
  sourceLabel: 'Device Audio',
  setAudioQuality: (q) => set({ audioQuality: q }),
  setLatencyHint: (ms) => set({ latencyHint: ms }),
  setSourceLabel: (label) => set({ sourceLabel: label }),
}));
