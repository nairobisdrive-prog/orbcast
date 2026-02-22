# OrbCast — Limitations

## Android Audio Capture Constraints

### The Problem

Android restricts which apps can capture audio from the system. Specifically:

- **DRM-protected content** (Netflix, Spotify with DRM, some streaming apps): Completely blocked — the OS enforces this at the media framework level.
- **Apps using `AudioAttributes.USAGE_GAME` or `USAGE_VOICE_COMMUNICATION`**: Often blocked.
- **Standard media apps** (YouTube, Suno, local files): _May_ work in Android 10+ via `MediaProjection` API, but requires explicit user permission and a foreground service notification.

### What This Means for OrbCast

| Scenario | Works? | Notes |
|----------|--------|-------|
| Playing audio from YouTube | Maybe | Requires MediaProjection permission |
| Playing from Spotify Premium | No | DRM blocks capture |
| Playing local files (Files app) | Yes | No DRM |
| Microphone capture | Yes | With RECORD_AUDIO permission |
| Demo mode (simulated) | Yes | Always works |

### Our Approach

1. **Demo mode** is always available — simulates audio energy to drive the orb
2. **Mic capture** — user can explicitly allow microphone input
3. **System audio** — available in a custom dev build with `MediaProjection`
4. **We are honest with users** — no false promises, clear explanations

## Sonos Stream Constraints

### Stream URL Must Be on LAN

Sonos speakers can only connect to HTTP stream URLs that are on the same local network (LAN). This means:

- ✅ `http://192.168.1.100:8080/stream` (phone LAN IP) — works
- ❌ `https://cast-sonos.preview.emergentagent.com/api/stream` — does NOT work on Sonos hardware (different network)

### Implication for MVP

The MVP uses the backend server stream URL for UI demonstration. For production use with real Sonos hardware:
1. The stream must originate from the user's phone (same LAN subnet)
2. This requires a native TCP socket server inside the app
3. Path: custom dev build with `react-native-tcp-socket` or native module

### Audio Encoding

Sonos supports: MP3, AAC, OGG/Vorbis, WAV/PCM, FLAC, WMA.

For lowest latency:
- **PCM/WAV** — zero encode overhead, highest bandwidth (~1.4Mbps for CD quality)
- **AAC** — good quality/latency balance, supported natively on Android
- **MP3** — wide compatibility, ~100ms encode latency

MVP uses PCM silence (WAV). Production encoder TBD.

## Expo Managed Workflow Constraints

| Feature | Constraint | Workaround |
|---------|-----------|-----------|
| UDP multicast (SSDP) | Not available | Custom dev build with `react-native-udp` |
| TCP server (stream) | Not available | Custom dev build with `react-native-tcp-socket` |
| System audio capture | Not available | Custom dev build with `MediaProjection` module |
| Background audio service | Limited | Use expo-av with background mode |

## Navigation

These are not bugs — they are documented constraints:
- Sonos handshake test always succeeds in dev mode (mock)
- SSDP discovery returns mock devices (real requires native module)
- Stream URL points to backend server (real requires in-app TCP server)
