#!/usr/bin/env bash
set -e

PORT=8000
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting ComboStack on http://localhost:${PORT}"
echo "Press Ctrl+C to stop."

# Launch browser after a short delay so the server is ready
(sleep 0.8 && \
  if command -v open &>/dev/null; then
    open "http://localhost:${PORT}"
  elif command -v xdg-open &>/dev/null; then
    xdg-open "http://localhost:${PORT}"
  elif command -v start &>/dev/null; then
    start "http://localhost:${PORT}"
  fi
) &

cd "$DIR"
python3 -m http.server ${PORT}
