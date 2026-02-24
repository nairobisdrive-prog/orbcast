from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import time
import lameenc

app = FastAPI(title="OrbCast API", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── MP3 stream config ────────────────────────────────────────────────────────
_SAMPLE_RATE = 44100
_CHANNELS = 2
_BITRATE = 128
_CHUNK_MS = 100
_SAMPLES_PER_CHUNK = _SAMPLE_RATE * _CHUNK_MS // 1000  # 4410 samples
_SILENCE_PCM = bytes(_SAMPLES_PER_CHUNK * _CHANNELS * 2)  # 16-bit stereo zeros


def _new_encoder() -> lameenc.Encoder:
    enc = lameenc.Encoder()
    enc.set_bit_rate(_BITRATE)
    enc.set_in_sample_rate(_SAMPLE_RATE)
    enc.set_channels(_CHANNELS)
    enc.set_quality(7)  # 7 = fastest
    return enc


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "orbcast-api", "version": "1.1.0"}


@app.get("/api/network-info")
async def network_info(request: Request):
    """Returns the host/base URL so the app can build the Sonos stream URL."""
    host = request.headers.get("host", "localhost:8001")
    scheme = "https" if "emergentagent" in host else "http"
    return {"streamUrl": f"{scheme}://{host}/api/stream", "host": host}


@app.get("/api/stream")
async def audio_stream():
    """
    MP3 audio stream for Sonos AVTransport.

    Serves audio/mpeg (128kbps 44100Hz stereo) silence frames.
    Sonos can begin playback from this URL immediately.

    Replace the silence PCM with real captured audio to go live.
    Content-Type is audio/mpeg — NOT audio/wav, NOT text/html.
    """
    def generate_mp3():
        enc = _new_encoder()
        # Warm-up: yield 4 frames up-front so Sonos buffers quickly
        for _ in range(4):
            chunk = bytes(enc.encode(_SILENCE_PCM))
            if chunk:
                yield chunk

        # Continuous silence stream
        while True:
            chunk = bytes(enc.encode(_SILENCE_PCM))
            if chunk:
                yield chunk
            time.sleep(_CHUNK_MS / 1000 * 0.9)

    return StreamingResponse(
        generate_mp3(),
        media_type="audio/mpeg",
        headers={
            "icy-name": "OrbCast",
            "icy-br": str(_BITRATE),
            "icy-metaint": "0",
            "Cache-Control": "no-cache, no-store",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "X-Content-Type-Options": "nosniff",
        },
    )
