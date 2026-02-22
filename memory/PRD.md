# OrbCast PRD

**Last Updated:** February 2026
**Status:** MVP Complete

## Problem Statement
Build OrbCast — a premium Android audio casting app that routes phone audio to Sonos speakers. Better UX than AirMusic. Luxury/futuristic design. One-tap casting flow.

## Architecture
- **Frontend:** Expo SDK 54, React Native 0.81.5, TypeScript
- **Navigation:** expo-router (file-based)
- **State:** Zustand + TanStack Query
- **UI:** expo-blur, expo-linear-gradient, react-native-svg + Reanimated (orb)
- **Fonts:** Syne (headings) + Manrope (body) + SpaceMono (mono)
- **Backend:** FastAPI (Python) — health check + WAV silence stream
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase (email+password + magic link)

## What's Been Implemented (MVP — COMPLETE Feb 2026)

### Screens
- **Onboarding** (2-slide flow, orb preview, permissions explanation)
- **Auth** (email+password + magic link OTP)
- **Discovery** (mock SSDP, 4 Sonos devices, selection)
- **Casting** (hero screen: reactive orb, volume slider, cast controls, now playing)
- **Receivers** (Sonos tab + Other tab with extensible adapter system)
- **Settings** (audio quality, reduce motion, diagnostics, handshake test)
- **Orb Lab** (dev tool: sliders + presets for orb simulation)

### Architecture Modules
- `src/sonos/discovery.ts` — mock SSDP (4 devices), real SSDP scaffold
- `src/sonos/soapClient.ts` — SOAP envelope builder for UPnP
- `src/sonos/sonosController.ts` — high-level Sonos commands (dev mode)
- `src/receivers/ReceiverAdapter.ts` — extensible adapter interface
- `src/receivers/MockAdapter.ts` — demo + Chromecast placeholder
- `src/audio/audioManager.ts` — simulated audio signal (20fps demo mode)
- `src/store/index.ts` — Zustand stores (app, sonos, casting, settings)
- `src/lib/supabase.ts` — Supabase client (SSR-safe)
- `src/design/tokens.ts` — full design system tokens

### Backend
- `GET /api/health` — health check
- `GET /api/stream` — WAV silence stream (Sonos-compatible)
- `GET /api/network-info` — returns stream URL

### Database Schema (Supabase)
- `profiles` table with RLS
- `device_nicknames` table with RLS
- `settings` table with RLS
- Auto-create profile/settings trigger on user signup

### Documentation
- `/docs/design-thinking.md` — design philosophy
- `/docs/architecture.md` — system architecture
- `/docs/qa-checklist.md` — smoke test checklist
- `/docs/limitations.md` — Android audio capture constraints
- `/supabase/migrations/001_initial_schema.sql` — DB schema

## User Personas
- **Primary:** Sonos owner, 30-50, tech-comfortable, wants frictionless casting
- **Secondary:** Audio enthusiast who wants premium app UI

## Core Requirements (Static)
1. Discover Sonos speakers (SSDP/mock)
2. Cast audio to selected speakers via HTTP stream
3. Reactive orb visualization driven by audio metrics
4. Premium luxury UI (deep navy + orange, glassmorphism)
5. Supabase auth + settings sync

## Prioritized Backlog

### P0 (Blocker for production)
- [ ] Real SSDP discovery (requires custom dev build with `react-native-udp`)
- [ ] In-app TCP stream server (requires `react-native-tcp-socket`)
- [ ] System audio capture (requires `MediaProjection` native module)

### P1 (High value)
- [ ] Speaker nickname editing in Discovery screen
- [ ] Supabase settings sync (save/load from database)
- [ ] Device nickname persistence to Supabase
- [ ] Real Supabase auth flow testing end-to-end
- [ ] Latency measurement display
- [ ] Multi-speaker grouping UI

### P2 (Nice to have)
- [ ] Chromecast adapter (using `react-native-google-cast`)
- [ ] DLNA adapter
- [ ] Source label customization
- [ ] Reduce motion respected from OS setting
- [ ] Accessibility improvements (screen reader support)
- [ ] Dark/Light theme option

## Next Tasks
1. Run Supabase migration SQL in Supabase dashboard
2. Test real auth flow with Supabase
3. Build custom dev client for real SSDP + TCP stream
4. Implement speaker nickname persistence
5. Add settings sync to Supabase
