from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import asyncio
import time

app = FastAPI(title="OrbCast API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "orbcast-api", "version": "1.0.0"}


@app.get("/api/network-info")
async def network_info(request: Request):
    """Returns the host/base URL — used to build the Sonos stream URL."""
    host = request.headers.get("host", "localhost:8001")
    scheme = "https" if "emergentagent" in host else "http"
    return {"streamUrl": f"{scheme}://{host}/api/stream", "host": host}


@app.get("/api/stream")
async def audio_stream():
    """
    Mock audio stream endpoint compatible with Sonos AVTransport.
    Sonos will pull from this URL when casting is active.
    In production: replace with real PCM→AAC/MP3 encoder pipeline.
    
    This endpoint returns an infinite stream of audio silence
    with proper HTTP headers for streaming playback.
    """
    def generate_silence():
        """Generate WAV-format silence chunks."""
        # WAV header (44 bytes) for 44100Hz, 16-bit stereo PCM
        sample_rate = 44100
        num_channels = 2
        bits_per_sample = 16
        byte_rate = sample_rate * num_channels * bits_per_sample // 8
        block_align = num_channels * bits_per_sample // 8

        # Chunk size = very large for streaming
        wav_header = b"RIFF"
        wav_header += (0xFFFFFFFF).to_bytes(4, "little")  # File size (streaming = unknown)
        wav_header += b"WAVE"
        wav_header += b"fmt "
        wav_header += (16).to_bytes(4, "little")  # Subchunk1Size
        wav_header += (1).to_bytes(2, "little")   # AudioFormat = PCM
        wav_header += num_channels.to_bytes(2, "little")
        wav_header += sample_rate.to_bytes(4, "little")
        wav_header += byte_rate.to_bytes(4, "little")
        wav_header += block_align.to_bytes(2, "little")
        wav_header += bits_per_sample.to_bytes(2, "little")
        wav_header += b"data"
        wav_header += (0xFFFFFFFF).to_bytes(4, "little")  # Data size (streaming)

        yield wav_header

        # Silence chunks: 100ms at a time
        chunk_duration = 0.1  # seconds
        chunk_size = int(sample_rate * num_channels * (bits_per_sample // 8) * chunk_duration)
        silence_chunk = bytes(chunk_size)

        while True:
            yield silence_chunk
            time.sleep(chunk_duration * 0.9)  # slight underrun tolerance

    return StreamingResponse(
        generate_silence(),
        media_type="audio/wav",
        headers={
            "icy-name": "OrbCast Stream",
            "icy-br": "128",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Transfer-Encoding": "chunked",
            "Access-Control-Allow-Origin": "*",
        },
    )
