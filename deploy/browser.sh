#!/usr/bin/env bash
set -euo pipefail

# ===== Konfiguration =====
USER_NAME=${USER_NAME:-admin}                # Benutzer, der den Desktop startet
APP_URL=${APP_URL:-http://localhost:3000}    # Seite für den Kioskmodus
CHROMIUM_BIN=${CHROMIUM_BIN:-chromium}       # ggf. chromium-browser
AUTOSTART_DIR="/home/$USER_NAME/.config/lxsession/LXDE-pi"
AUTOSTART_FILE="$AUTOSTART_DIR/autostart"

echo "==> Starte Einrichtung für Chromium-Kiosk unter Benutzer: $USER_NAME"
echo "==> Ziel: $AUTOSTART_FILE"

# ===== Chromium installieren (falls nicht vorhanden) =====
if ! command -v "$CHROMIUM_BIN" >/dev/null 2>&1; then
  echo "==> Installiere Chromium..."
  apt-get update -y
  apt-get install -y chromium || apt-get install -y chromium-browser
  CHROMIUM_BIN=$(command -v chromium || command -v chromium-browser)
fi

# ===== Autostart-Verzeichnis anlegen =====
echo "==> Erstelle Autostart-Verzeichnis falls nötig..."
mkdir -p "$AUTOSTART_DIR"
chown -R "$USER_NAME":"$USER_NAME" "/home/$USER_NAME/.config"

# ===== Autostart-Datei schreiben =====
cat > "$AUTOSTART_FILE" <<EOF
@xset s off
@xset -dpms
@xset s noblank
@$CHROMIUM_BIN --kiosk --app=$APP_URL --noerrdialogs --disable-infobars --start-fullscreen
EOF

chown "$USER_NAME":"$USER_NAME" "$AUTOSTART_FILE"
chmod 644 "$AUTOSTART_FILE"

echo "==> Datei erstellt:"
echo "---------------------------------------------------"
cat "$AUTOSTART_FILE"
echo "---------------------------------------------------"

# ===== Hinweis zu Autologin =====
echo
echo "💡 Hinweis:"
echo "- Stelle sicher, dass Raspberry Pi im Desktop-Modus mit Autologin startet."
echo "  → sudo raspi-config → System Options → Boot / Auto Login → Desktop Autologin"
echo
echo "✅ Einrichtung abgeschlossen. Chromium startet beim nächsten Desktop-Login automatisch im Kiosk-Modus!"