# OrbCast — QA Checklist

## Smoke Tests (Manual)

### Launch
- [ ] App opens without red screen on Android
- [ ] Splash screen appears briefly then hides
- [ ] Fonts (Syne + Manrope) load correctly
- [ ] Navigates to onboarding on first launch
- [ ] Navigates to casting screen on subsequent launches

### Onboarding
- [ ] Orb visualization renders and animates
- [ ] "Next" button advances to slide 2
- [ ] "Find Speakers" on slide 2 → Discovery screen
- [ ] "Skip for now" bypasses discovery

### Discovery
- [ ] Scanning animation shows with progress indicator
- [ ] Mock devices appear (Living Room, Kitchen, Bedroom, Office)
- [ ] Tapping a speaker toggles selection (checkmark appears)
- [ ] "Start Casting" disabled until speaker selected
- [ ] "Start Casting" enabled → navigates to Casting screen

### Casting Screen
- [ ] Orb renders in center with animation
- [ ] Selected speaker name shows in top bar
- [ ] Volume slider is visible and draggable
- [ ] "Start Casting" button is visible (not cut off)
- [ ] Start Casting changes to Stop Casting
- [ ] Mute button toggles (icon changes)
- [ ] Settings icon → Settings screen
- [ ] Receivers icon → Receivers screen

### Audio Orb
- [ ] Orb pulses continuously when active
- [ ] Orb energy responds to demo audio metrics
- [ ] Orb dims/stops when muted

### Receivers
- [ ] Sonos tab shows selected devices
- [ ] Other tab shows Demo Receiver, Chromecast, DLNA
- [ ] "Coming Soon" badges on Chromecast + DLNA

### Settings
- [ ] Audio quality selector (Low/Med/High) works
- [ ] Reduce Motion toggle works
- [ ] "Orb Lab" navigates to Orb Lab screen
- [ ] Diagnostics shows device IP / stream status
- [ ] Sonos Handshake Test runs and returns mock result
- [ ] Sign In link → Auth screen (when not signed in)

### Orb Lab
- [ ] Energy slider drives orb energy
- [ ] Bass slider drives bass response
- [ ] Presence slider drives presence
- [ ] Volume slider drives volume
- [ ] Presets (Idle/Bass/Peak/Soft) jump orb state instantly
- [ ] Live/Paused toggle pauses animation

### Auth
- [ ] Password tab shows email + password fields
- [ ] Magic Link tab shows email field
- [ ] "Continue without signing in" skips auth
- [ ] Error messages show on bad input

### Backend
- [ ] GET /api/health → 200 `{"status": "ok"}`
- [ ] GET /api/stream → 200 with audio/wav content-type
- [ ] GET /api/network-info → 200 with streamUrl

## Known Limitations (Not Bugs)
- SSDP discovery returns mock devices (real requires native build)
- Sonos SOAP commands logged but not sent (DEV_MODE=true)
- Stream URL must be on LAN for real Sonos to connect
- System audio capture not available in Expo managed workflow
- Supabase auth works but requires valid anon key
