#!/bin/bash
# Spustí backend i frontend paralelně a otevře frontend v prohlížeči

cd server && npm run dev &
cd client && npm run dev &

sleep 3 # Počká na start Vite serveru

# Otevře frontend v prohlížeči (macOS open, Linux xdg-open, Windows start)
if command -v open > /dev/null; then
  open http://localhost:5173
elif command -v xdg-open > /dev/null; then
  xdg-open http://localhost:5173
elif command -v start > /dev/null; then
  start http://localhost:5173
fi

wait
