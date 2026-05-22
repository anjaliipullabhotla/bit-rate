#!/usr/bin/env bash
PORT=8000
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

cleanup() {
  [ -n "$HTTP_PID" ]    && kill "$HTTP_PID"    2>/dev/null
  [ -n "$WHISPER_PID" ] && kill "$WHISPER_PID" 2>/dev/null
}
trap cleanup EXIT INT TERM

if [ -f server.py ]; then
  echo "Starting Whisper inference server on ws://localhost:8765 ..."
  if command -v uv &>/dev/null; then
    uv run server.py &
  else
    python3 server.py &
  fi
  WHISPER_PID=$!
fi

(sleep 0.8 && \
  if   command -v open     &>/dev/null; then open     "http://localhost:${PORT}"
  elif command -v xdg-open &>/dev/null; then xdg-open "http://localhost:${PORT}"
  elif command -v start    &>/dev/null; then start    "http://localhost:${PORT}"
  fi
) &

echo "Starting ComboStack on http://localhost:${PORT} — Press Ctrl+C to stop."
python3 -m http.server ${PORT} &
HTTP_PID=$!
wait $HTTP_PID
