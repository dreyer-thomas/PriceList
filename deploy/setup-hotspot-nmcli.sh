#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="/etc/default/hotspot"

require_file() {
  [[ -f "$1" ]] || { echo "FEHLER: $1 nicht gefunden."; exit 1; }
}

require_var() {
  local name="$1"
  [[ -n "${!name:-}" ]] || { echo "FEHLER: Variable $name ist nicht gesetzt (in $ENV_FILE)."; exit 1; }
}

echo "==> Lese $ENV_FILE ..."
require_file "$ENV_FILE"
# shellcheck disable=SC1090
source "$ENV_FILE"

# Pflicht-Variablen prüfen (keine Defaults!)
for v in SSID PSK WIFI_COUNTRY WLAN_IF GATEWAY_IP; do
  require_var "$v"
done

# Basiskontrollen
if [[ ${#PSK} -lt 8 || ${#PSK} -gt 63 ]]; then
  echo "FEHLER: PSK muss 8..63 Zeichen haben."; exit 1
fi
if ! command -v nmcli >/dev/null 2>&1; then
  echo "==> Installiere NetworkManager ..."
  apt-get update -y
  apt-get install -y network-manager
fi

echo "==> Setze WLAN-Regdom/Land auf $WIFI_COUNTRY ..."
WCONF="/etc/wpa_supplicant/wpa_supplicant.conf"
if grep -q '^country=' "$WCONF" 2>/dev/null; then
  sed -i "s/^country=.*/country=$WIFI_COUNTRY/" "$WCONF"
else
  echo "country=$WIFI_COUNTRY" >> "$WCONF"
fi
command -v iw >/dev/null 2>&1 && iw reg set "$WIFI_COUNTRY" || true
rfkill unblock all || true

CON_NAME="hotspot-${WLAN_IF}"

echo "==> Entferne ggf. alte Verbindung: $CON_NAME"
nmcli -t -f NAME connection show | grep -qx "$CON_NAME" && nmcli connection delete "$CON_NAME" || true

echo "==> Lege Hotspot-Verbindung neu an ..."
nmcli dev set "$WLAN_IF" managed yes || true
nmcli connection modify "$CON_NAME" connection.interface-name "$WLAN_IF"
nmcli connection add type wifi ifname "$WLAN_IF" con-name "$CON_NAME" autoconnect yes ssid "$SSID"

# Verbindung an das exakte Interface binden:
nmcli connection modify "$CON_NAME" connection.interface-name "$WLAN_IF"

# Beim Hochfahren explizit das Interface nennen:
nmcli connection up "$CON_NAME" ifname "$WLAN_IF"

echo "==> Konfiguriere Eigenschaften ..."
nmcli connection modify "$CON_NAME" \
  802-11-wireless.mode ap \
  802-11-wireless.band "${BAND:-bg}" \
  ipv4.method shared \
  ipv6.method ignore \
  wifi-sec.key-mgmt wpa-psk \
  wifi-sec.psk "$PSK" \
  802-11-wireless.hidden yes

# Kanal nur setzen, wenn befüllt
if [[ -n "${CHANNEL:-}" ]]; then
  nmcli connection modify "$CON_NAME" 802-11-wireless.channel "$CHANNEL"
fi

# feste AP-IP (NetworkManager nutzt bei shared sonst 10.42.0.1 – wir setzen explizit)
nmcli connection modify "$CON_NAME" ipv4.addresses "${GATEWAY_IP}/24"

echo "==> NetworkManager aktivieren & Hotspot starten ..."
systemctl enable NetworkManager.service
nmcli connection up "$CON_NAME"

echo "==> Fertig."
echo "    SSID (hidden): $SSID"
echo "    PSK          : $PSK"
echo "    AP-IP        : $GATEWAY_IP/24"
echo "Hinweis: Versteckte SSIDs erhöhen die Sicherheit nicht wesentlich, verhindern aber, dass Unbeteiligte sie versehentlich auswählen."