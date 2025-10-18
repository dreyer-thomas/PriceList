#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="/etc/default/hotspot"
[[ -f "$ENV_FILE" ]] && source "$ENV_FILE" || { echo "FEHLER: $ENV_FILE fehlt"; exit 1; }

# Pflichtvariablen (keine Defaults!)
for v in SSID PSK WIFI_COUNTRY WLAN_IF GATEWAY_IP; do
  [[ -n "${!v:-}" ]] || { echo "FEHLER: $v nicht gesetzt in $ENV_FILE"; exit 1; }
done
: "${BAND:=bg}"        # optional
: "${CHANNEL:=}"       # optional

[[ ${#PSK} -ge 8 && ${#PSK} -le 63 ]] || { echo "FEHLER: PSK 8..63 Zeichen"; exit 1; }

# Tools sicherstellen
if ! command -v nmcli >/dev/null 2>&1; then
  apt-get update -y
  apt-get install -y network-manager
fi
apt-get install -y rfkill iw || true

# Country/Regdom setzen
WCONF="/etc/wpa_supplicant/wpa_supplicant.conf"
grep -q '^country=' "$WCONF" 2>/dev/null && sed -i "s/^country=.*/country=$WIFI_COUNTRY/" "$WCONF" || echo "country=$WIFI_COUNTRY" >> "$WCONF"

preflight_wifi() {
  local ifc="$1"
  echo "==> Preflight für $ifc (unavailable fixen)"

  # Blockaden lösen & Radio an
  rfkill unblock all || true
  nmcli radio wifi on || true

  # Von NM managen lassen, Interface hoch
  nmcli dev set "$ifc" managed yes || true
  ip link set "$ifc" up || true

  # evtl. konkurrierende wpa_supplicant-Dienste stoppen (NM startet selbst)
  systemctl stop "wpa_supplicant@$ifc.service" 2>/dev/null || true
  systemctl stop wpa_supplicant.service 2>/dev/null || true

  # Regdom zur Laufzeit setzen
  iw reg set "$WIFI_COUNTRY" 2>/dev/null || true

  # Einmal NetworkManager neu starten
  systemctl restart NetworkManager

  # Prüfen, ob Adapter AP-Mode kann
  if ! iw list | sed -n '/Supported interface modes/,+10p' | grep -q '\bAP\b'; then
    echo "FEHLER: Adapter unterstützt keinen AP-Mode."; exit 1
  fi

  # Warten, bis der State „disconnected/connected“ statt „unavailable/unmanaged“ ist
  for _ in $(seq 1 30); do
    state=$(nmcli -t -f DEVICE,STATE device status | awk -F: '$1=="'"$ifc"'"{print $2}')
    [[ "$state" == "disconnected" || "$state" == "connected" ]] && return 0
    sleep 1
  done

  echo "FEHLER: $ifc bleibt unavailable. Prüfe Treiber/Firmware."
  exit 1
}

CON_NAME="hotspot-${WLAN_IF}"

# Preflight ausführen (macht wlanX verfügbar)
preflight_wifi "$WLAN_IF"

echo "==> Alte Verbindung entfernen (falls vorhanden): $CON_NAME"
nmcli -t -f NAME connection show | grep -qx "$CON_NAME" && nmcli connection delete "$CON_NAME" || true

echo "==> Neue Hotspot-Verbindung anlegen"
nmcli dev set "$WLAN_IF" managed yes || true
nmcli connection add type wifi ifname "$WLAN_IF" con-name "$CON_NAME" autoconnect yes ssid "$SSID"

echo "==> Parameter setzen"
nmcli connection modify "$CON_NAME" \
  802-11-wireless.mode ap \
  802-11-wireless.band "$BAND" \
  ipv4.method shared \
  ipv6.method ignore \
  wifi-sec.key-mgmt wpa-psk \
  wifi-sec.psk "$PSK" \
  802-11-wireless.hidden yes

[[ -n "$CHANNEL" ]] && nmcli connection modify "$CON_NAME" 802-11-wireless.channel "$CHANNEL"
nmcli connection modify "$CON_NAME" connection.interface-name "$WLAN_IF"
nmcli connection modify "$CON_NAME" ipv4.addresses "${GATEWAY_IP}/24"

echo "==> Hotspot starten (explizit auf $WLAN_IF)"
nmcli connection up "$CON_NAME" ifname "$WLAN_IF"

echo "==> Fertig."
echo "SSID (hidden): $SSID"
echo "PSK         : $PSK"
echo "AP-IP       : $GATEWAY_IP/24"
