# OrbCast Architecture

## Overview

OrbCast is an Expo/React Native Android app that discovers Sonos speakers via mock SSDP and streams phone audio to them via a local HTTP server (hosted in the FastAPI backend for MVP).

## Stack

| Layer | Technology |
|-------|-----------|
| Mobile | Expo SDK 54 + React Native 0.81 |
| Language | TypeScript (strict) |
| Navigation | expo-router (file-based) |
| State | Zustand |
| Async/Cache | TanStack Query v5 |
| UI Motion | react-native-reanimated 4.x |
| UI Graphics | react-native-svg + Reanimated (orb) |
| Glassmorphism | expo-blur (BlurView) |
| Gradients | expo-linear-gradient |
| Fonts | @expo-google-fonts/syne + manrope + space-mono |
| Backend | FastAPI (Python) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email+password + magic link) |

## Directory Structure

```
/app
├── /backend
│   └── server.py          # FastAPI: health, stream, network-info
├── /docs                  # Architecture, design thinking, QA
├── /frontend
│   ├── /app               # Expo Router screens
│   │   ├── _layout.tsx    # Root (fonts, providers)
│   │   ├── index.tsx      # Entry redirect
│   │   ├── onboarding.tsx
│   │   ├── auth.tsx
│   │   ├── discovery.tsx
│   │   ├── casting.tsx    # Hero screen
│   │   ├── receivers.tsx
│   │   ├── settings.tsx
│   │   └── orb-lab.tsx
│   └── /src
│       ├── /design/tokens.ts
│       ├── /components
│       │   ├── /ui        # GlassPanel, PrimaryButton, VolumeSlider
│       │   ├── /visual    # OrbVisualizer
│       │   └── /feature   # SpeakerCard
│       ├── /sonos         # discovery, soapClient, sonosController
│       ├── /receivers     # ReceiverAdapter interface, MockAdapter
│       ├── /audio         # audioManager (demo mode)
│       ├── /store         # Zustand stores
│       ├── /lib           # supabase client
│       └── /types         # TypeScript interfaces
└── /supabase/migrations   # SQL schema files
```

## Data Flow

```
AudioManager (demo signal)
    ↓
CastingStore (audioMetrics: energy/bass/presence/volume)
    ↓
OrbVisualizer (SVG + Reanimated — reacts to metrics)

User taps "Start Casting"
    ↓
sonosController.startCasting(device, streamUrl)
    ↓
SOAP SetAVTransportURI → Sonos device
SOAP Play → Sonos device
    ↓
Sonos pulls from /api/stream (FastAPI)
```

## Sonos Integration

### Discovery (Mock)
- `src/sonos/discovery.ts` — returns `MOCK_DEVICES` after a simulated delay
- Real path: SSDP M-SEARCH over UDP multicast (`react-native-udp`, custom dev build)

### Control (UPnP SOAP)
- `src/sonos/soapClient.ts` — builds SOAP XML envelopes
- `src/sonos/sonosController.ts` — sends commands via `fetch()` to Sonos HTTP endpoint
- Dev mode: all commands are logged (no real network calls)
- Real mode: set `DEV_MODE = false` in sonosController.ts

### Stream URL
- FastAPI `/api/stream` serves a WAV silence stream
- In production: this stream must come from within the app on the LAN (same subnet as Sonos)
- Future path: `react-native-tcp-socket` native module to serve the stream from the device

## Receiver Adapter Pattern

```typescript
interface ReceiverAdapter {
  id: string;
  name: string;
  type: 'sonos' | 'mock' | 'chromecast' | 'dlna';
  connect(streamUrl: string): Promise<void>;
  disconnect(): Promise<void>;
  setVolume(volume: number): Promise<void>;
  isConnected(): boolean;
}
```

Implemented:
- `MockAdapter` — simulated receiver (demonstrates interface)
- `ChromecastPlaceholder` — stub with documented TODO

## Supabase Schema

- `profiles` (id, display_name, email)
- `device_nicknames` (user_id, device_id, nickname)
- `settings` (user_id, audio_quality, reduce_motion, last_selected_output_ids)

All tables have Row Level Security (users see only their own data).

## Production Path for Real Audio Capture

Android does not allow audio capture from other apps in managed Expo workflow. Production path:
1. Eject to bare workflow OR create a custom dev client
2. Add native module: `react-native-record-sound` or `AudioRecord` bridge
3. Pipe PCM → encode AAC/MP3/Opus → stream to local HTTP server
4. Serve stream on a local TCP socket (react-native-tcp-socket or jetty)
5. Pass local IP + port as stream URL to Sonos SetAVTransportURI
