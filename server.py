#!/usr/bin/env python3
# /// script
# requires-python = "==3.11.*"
# dependencies = [
#   "av==14.2.0",
#   "faster-whisper>=1.0",
#   "websockets>=10.0",
# ]
# ///
"""
Hold-to-Talk Whisper WebSocket inference server.
Expects raw WAV binary payloads; returns transcribed text.
Run with:  uv run server.py
"""
import asyncio
import io
import os
import sys
import tempfile

import websockets
from faster_whisper import WhisperModel

try:
    model = WhisperModel("base.en", device="cuda", compute_type="float16")
    print("[whisper] loaded base.en on CUDA float16")
except Exception as e:
    print(f"[whisper] CUDA unavailable ({e}), falling back to CPU float32")
    model = WhisperModel("base.en", device="cpu", compute_type="float32")


async def handler(websocket):
    async for message in websocket:
        if not isinstance(message, bytes):
            continue

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            f.write(message)
            tmp = f.name

        try:
            segments, _ = model.transcribe(
                tmp,
                language="en",
                beam_size=1,
                vad_filter=False,
            )
            text = "".join(s.text for s in segments).strip()
        finally:
            os.unlink(tmp)

        await websocket.send(text)


async def main():
    async with websockets.serve(handler, "localhost", 8765):
        print("[ws] listening on ws://localhost:8765")
        await asyncio.Future()


asyncio.run(main())
