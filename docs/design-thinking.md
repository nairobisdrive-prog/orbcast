# Design Thinking — OrbCast

> Written before first line of code. Guides all design decisions.

## Problem

People with Sonos speakers struggle to cast audio from their phone to speakers in a frictionless way. Existing solutions (AirMusic, BubbleUPnP, etc.) are functional but feel like developer tools, not consumer products. They use jargon, require configuration, and have dated UIs.

**Core tension:** Sonos streaming is technically complex (UPnP/SOAP, local HTTP stream, SSDP discovery), but the user just wants to press one button.

## Users

- Sonos owner, typically 30–50, tech-comfortable but not technical
- They know what Spotify/Suno/YouTube sounds like on speakers; they just want it there now
- They're frustrated by apps that feel like they need a PhD to operate
- They expect the same polish from an audio app as they get from Spotify or Apple Music

## Persona: "The Quality Listener"

> "I'm playing something on my phone and I want it on my speakers. Why is this hard?"

Pain points:
1. Can't quickly know which speakers are available
2. Every app feels like a network config panel
3. Latency and quality aren't predictable
4. No feedback that it's "working"

## Tone Decision: Luxury / Refined + Futuristic

**Why not cyberpunk?** Cyberpunk is noise — neon clutter, grunge, chaos. That fights the calm you want when listening to music.

**Why luxury/futuristic?** Think Dyson, Bang & Olufsen, high-end audio equipment. These products are:
- Precise
- Calm under pressure
- Tactile (weight, feedback, materiality)
- Trust-inspiring — you feel like the product knows what it's doing

**Execution:**
- Deep navy palette (#000033 → #13294B) — the darkness of a listening room at night
- Orange accents (#FF5F05, #DD3403) — the warm glow of a tube amplifier's power LED
- Glassmorphism panels — high-end equipment has surfaces you can almost feel through glass
- The Orb — an abstract but visceral representation of "sound is happening"
- No text clutter on the casting screen — only what you need to see

## The Signature Moment

**The Casting Screen:**

A user opens the app. They're greeted with a deep blue space and a glowing orb — like looking at a planet in a starfield. The orb breathes. Not anxious breathing — slow, confident, like a speaker woofer at rest. When they tap "Start Casting," the orb *surges* — brighter, faster, more alive. That's the "wow."

**This moment replaces the concept of "it works" with "this is alive."**

## Key Principles (Guiding All Decisions)

1. **One primary action per screen.** Every screen has ONE obvious thing to do.
2. **Feedback is instant.** Every tap, swipe, toggle has haptic + visual response.
3. **Honest about limitations.** When Android blocks audio capture, we say so clearly — then offer a path forward.
4. **Never use jargon.** No "UPnP," no "SOAP," no "SSDP" in user-facing text. We say "speaker" not "renderer."
5. **Motion = meaning.** Animations aren't decoration. They communicate state (connecting, casting, idle).

## Constraints

- **Platform:** Android-first (Expo managed workflow)
- **Accessibility:** 4.5:1 minimum contrast, reduce-motion option, 44pt+ hit targets
- **Performance:** Orb animation at 60fps using SVG + Reanimated worklets
- **Reality:** Android does not reliably allow capturing audio from all apps. We're honest about this.

## What "Done" Looks Like

A new user opens OrbCast:
1. Sees a beautiful orb on an onboarding screen → taps "Find Speakers"
2. App scans the network, shows speakers with names they recognize
3. Taps their living room speaker → taps "Start Casting"
4. Orb lights up. Music they're playing appears on the speakers.
5. Volume slider is right there. It feels like holding the actual volume knob.

That's it. That's the whole product.

## What We Chose NOT to Do

- No home screen widget (scope creep)
- No playlist management (that's Spotify's job)
- No complex equalizer (wrong product category)
- No "group by zone" in MVP (add later)
- No social features (this is personal audio)
