#!/bin/bash
# Boots the Flutter web dev server for the mobile app and hot-restarts on edits.
set -e
cd /app
flutter config --no-analytics >/dev/null 2>&1 || true
if [ ! -d web ]; then
  flutter create --platforms web --project-name todo_mobile . >/dev/null
fi
flutter pub get

KEYS=/tmp/keys
rm -f "$KEYS"; mkfifo "$KEYS"
exec 3<>"$KEYS"

STAMP=/tmp/.watch-stamp
touch "$STAMP"
(
  while true; do
    sleep 2
    if [ -n "$(find lib pubspec.yaml -type f -newer "$STAMP" 2>/dev/null | head -1)" ]; then
      touch "$STAMP"; sleep 1
      printf 'R' >&3
      echo "[watcher] source change detected — sent hot restart"
    fi
  done
) &

exec flutter run -d web-server --web-port 8082 --web-hostname 0.0.0.0 <"$KEYS"
