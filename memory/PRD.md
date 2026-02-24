# OrbCast PRD — Phone-to-Sonos Audio Casting

## Overview
OrbCast is a React Native (Expo) app that discovers Sonos speakers on the local network and casts audio from the phone to them. Features a fluid orb visualizer that reacts to the audio signal.

## Architecture

### Frontend (Expo SDK 54 / React Native)
- **Router**: expo-router (file-based, typed routes)
- **State**: Zustand stores (`useAppStore`, `useSonosStore`, `useCastingStore`, `useSettingsStore`)
- **UI**: Custom design system (`src/design/tokens.ts`), Skia (`@shopify/react-native-skia`), Reanimated 4
- **Supabase**: Auth + `settings`, `profiles`, `device_nicknames` tables

### Backend (FastAPI, Python)
- **Port**: 8001 (supervisor-managed)
- **Stream endpoint**: `GET /api/stream` → `audio/mpeg` 128kbps MP3 (lameenc)
- **Info endpoint**: `GET /api/network-info` → returns `streamUrl`

### Casting Pipeline (Production)
```
Phone MediaProjection → PCM → TcpStreamServer (react-native-tcp-socket:9000)
         ↓
  Sonos connects to http://<phone-ip>:9000/stream.mp3
         ↓
  OR falls back to cloud backend: /api/stream
```

## Key Technical Decisions
- **MP3 not WAV, not HTML** — `audio/mpeg` content-type, MPEG-1 Layer 3 frames
- **DIDL-Lite metadata** — `object.item.audioItem.audioBroadcast` + `SA_RINCON65031_` descriptor
- **SOAP XML-escaping** — `CurrentURIMetaData` is XML-escaped before embedding in SOAP envelope
- **DEV_MODE = false** — Real Sonos commands sent (not mocked)
- **Graceful fallback** — react-native-udp/tcp-socket/MediaProjection fail silently in Expo Go

## Screens
- `/` (index) → redirect to `/casting`
- `/casting` — main casting + orb visualizer
- `/discovery` — SSDP scan + speaker list
- `/receivers` — receiver management
- `/settings` — audio quality, Supabase sync, diagnostics, handshake test
- `/auth` — Supabase email auth
- `/onboarding` — first-launch flow
- `/orb-lab` — visualizer sandbox

## Database Schema (Supabase)
```sql
-- profiles: id (uuid), display_name, email, updated_at
-- device_nicknames: id, user_id, device_id, nickname
-- settings: id, user_id, audio_quality, reduce_motion, last_selected_output_ids, updated_at
-- All tables: RLS enabled, per-user policies
-- Auto-create trigger on auth.users insert
```

## Custom Dev Build Requirements
For real system audio capture (Android):
```
- react-native-udp         → SSDP discovery
- react-native-tcp-socket  → Phone-side HTTP stream server
- MediaProjection          → System audio capture native module
- @react-native-community/netinfo → local IP detection
```

Android permissions required:
```
INTERNET, ACCESS_NETWORK_STATE, ACCESS_WIFI_STATE,
CHANGE_WIFI_MULTICAST_STATE, RECORD_AUDIO,
FOREGROUND_SERVICE, FOREGROUND_SERVICE_MEDIA_PROJECTION,
FOREGROUND_SERVICE_MEDIA_PLAYBACK
```

## What's Been Implemented (Feb 24, 2026)

### Session: Production-ready Sonos casting
1. **DEV_MODE = false** (`src/sonos/sonosController.ts`) — real SOAP commands
2. **MP3 backend stream** (`backend/server.py`) — lameenc, `audio/mpeg`, `0xFFFA/FB` sync word
3. **DIDL-Lite metadata** (`src/sonos/soapClient.ts`) — `buildDIDLMetadata()` with `audio/mpeg` protocolInfo, `SA_RINCON65031_` descriptor
4. **XML escaping** (`soapClient.ts`) — `xmlEscape()` applied to SOAP string params
5. **Real SSDP discovery** (`src/sonos/discovery.ts`) — conditional react-native-udp with mock fallback
6. **TCP stream server** (`src/audio/tcpStreamServer.ts`) — phone-side HTTP server stub ready for MediaProjection
7. **Supabase settings sync** (`src/store/index.ts`) — `loadFromSupabase` on mount, auto-save on changes
8. **Casting screen** (`app/casting.tsx`) — tries system capture first, falls back to cloud MP3, shows capture mode
9. **Settings screen** (`app/settings.tsx`) — reduce motion wired to store, loads from Supabase, shows stream format + capture mode in diagnostics
10. **app.json** — Android permissions, EAS config, `expo-build-properties`
11. **package.json** — `react-native-tcp-socket`, `react-native-udp`, `@react-native-community/netinfo`

## Prioritized Backlog

### P0 (Blocking for production)
- [ ] MediaProjection native module (`src/native/MediaProjectionCapture`) — actual PCM from Android system audio
- [ ] MP3 encoding in TcpStreamServer (replace raw PCM passthrough with lame JSI encoder)

### P1 (Important)
- [ ] iOS support (Screen Capture Kit / ReplayKit)
- [ ] Speaker grouping (Sonos zone groups)
- [ ] Latency compensation tuning

### P2 (Nice to have)
- [ ] Push notifications for cast status
- [ ] Supabase realtime for multi-device sync
- [ ] History / recent sessions

## Environment
- Backend: `http://localhost:8001` (cloud), ENV vars: `MONGO_URL`, `DB_NAME`
- Frontend: `EXPO_PUBLIC_BACKEND_URL`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Supabase: `https://blhrcjfybdicasjbyuai.supabase.co`
