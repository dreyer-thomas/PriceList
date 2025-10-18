#!/usr/bin/env bash
set -euo pipefail

# ===== Konfiguration =====
USER_NAME=${USER_NAME:-admin}                # Desktop-User
APP_URL=${APP_URL:-http://localhost:3000}    # Kiosk-URL
CHROMIUM_BIN=${CHROMIUM_BIN:-chromium}       # Fallback: chromium-browser
HOME_DIR="/home/$USER_NAME"

LXDE_DIR="$HOME_DIR/.config/lxsession/LXDE-pi"
LXDE_FILE="$LXDE_DIR/autostart"
XDG_DIR="$HOME_DIR/.config/autostart"
XDG_FILE="$XDG_DIR/chromium-kiosk.desktop"

echo "==> Starte Einrichtung für Chromium-Kiosk unter Benutzer: $USER_NAME"

# ===== Chromium installieren, falls nötig =====
CHROMIUM_BIN=$(command -v chromium || command -v chromium-browser || true)
if [[ -z "$CHROMIUM_BIN" ]]; then
  echo "==> Installiere Chromium..."
  apt-get update -y
  apt-get install -y chromium || apt-get install -y chromium-browser
  CHROMIUM_BIN=$(command -v chromium || command -v chromium-browser)
fi

echo "==> Chromium-Binary gefunden: $CHROMIUM_BIN"

# ===== Benutzerverzeichnis prüfen =====
if [[ ! -d "$HOME_DIR" ]]; then
  echo "FEHLER: Benutzerverzeichnis $HOME_DIR existiert nicht."
  exit 1
fi

# ===== Autostart-Verzeichnisse anlegen =====
echo "==> Erstelle Autostart-Verzeichnisse (LXDE & XDG)..."
mkdir -p "$LXDE_DIR" "$XDG_DIR"
chown -R "$USER_NAME:$USER_NAME" "$HOME_DIR/.config"

# ===== LXDE-Autostart-Datei (X11 Desktop) =====
echo "==> Erstelle LXDE-Autostart-Datei..."
cat > "$LXDE_FILE" <<EOF
@xset s off
@xset -dpms
@xset s noblank
@$CHROMIUM_BIN --kiosk --app=$APP_URL --noerrdialogs --disable-infobars --start-fullscreen --no-first-run --disable-session-crashed-bubble
EOF

chown "$USER_NAME:$USER_NAME" "$LXDE_FILE"
chmod 644 "$LXDE_FILE"

# ===== XDG-Autostart-Datei (Wayland oder fallback) =====
echo "==> Erstelle XDG-Autostart-Datei..."
cat > "$XDG_FILE" <<EOF
[Desktop Entry]
Type=Application
Name=Chromium Kiosk
Exec=$CHROMIUM_BIN --kiosk --app=$APP_URL --noerrdialogs --disable-infobars --start-fullscreen --no-first-run --disable-session-crashed-bubble
X-GNOME-Autostart-enabled=true
EOF

chown "$USER_NAME:$USER_NAME" "$XDG_FILE"
chmod 644 "$XDG_FILE"

# ===== Desktop-Erkennung =====
SESSION_TYPE=$(loginctl show-session $(loginctl | awk '/tty|seat/ {print $1; exit}') -p Type -p Desktop 2>/dev/null || true)
echo "==> Erkanntes Session-Setup:"
echo "$SESSION_TYPE"
echo

# ===== Hinweis =====
cat <<INFO

✅ Einrichtung abgeschlossen:
  - LXDE Autostart: $LXDE_FILE
  - XDG Autostart:  $XDG_FILE
  - Chromium:       $CHROMIUM_BIN
  - App URL:        $APP_URL

💡 Hinweise:
  - Stelle sicher, dass der Pi auf **Desktop-Autologin** eingestellt ist:
      sudo raspi-config → System Options → Boot / Auto Login → Desktop Autologin
  - Unter LXDE/X11 wird die Datei "$LXDE_FILE" verwendet.
  - Unter Wayland/Wayfire greift "$XDG_FILE".

Nach einem Neustart sollte Chromium automatisch im Kiosk-Modus starten.
INFO