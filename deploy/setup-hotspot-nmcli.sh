#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="/etc/default/hotspot"
[[ -f "$ENV_FILE" ]] || { echo "FEHLER: $ENV_FILE fehlt"; exit 1; }
# shellcheck disable=SC1090
source "$ENV_FILE"

# Pflichtvariablen prüfen (keine Defaults!)
for v in SSID PSK WIFI_COUNTRY WLAN_IF GATEWAY_IP; do
  [[ -n "${!v:-}" ]] || { echo "FEHLER: Variable $v ist nicht gesetzt in $ENV_FILE"; exit 1; }
done
[[ ${#PSK} -ge 8 && ${#PSK} -le 63 ]] || { echo "FEHLER: PSK muss 8..63 Zeichen haben"; exit 1; }

# Tools sicherstellen
if ! command -v nmcli >/dev/null 2>&1; then
  apt-get update -y
  apt-get install -y network-manager
fi
apt-get install -y rfkill iw || true

# Regdom/Land setzen (persistent + runtime)
WCONF="/etc/wpa_supplicant/wpa_supplicant.conf"
grep -q '^country=' "$WCONF" 2>/dev/null && sed -i "s/^country=.*/country=$WIFI_COUNTRY/" "$WCONF" || echo "country=$WIFI_COUNTRY" >> "$WCONF"
iw reg set "$WIFI_COUNTRY" 2>/dev/null || true
rfkill unblock all || true

preflight_wifi() {
  local ifc="$1"
  echo "==> Preflight für $ifc"
  nmcli radio wifi on || true
  nmcli dev set "$ifc" managed yes || true
  ip link set "$ifc" up || true
  systemctl stop "wpa_supplicant@$ifc.service" 2>/dev/null || true
  systemctl stop wpa_supplicant.service 2>/dev/null || true
  systemctl restart NetworkManager

  # AP-Unterstützung prüfen
  if ! iw list | sed -n '/Supported interface modes/,+10p' | grep -q '\bAP\b'; then
    echo "FEHLER: WLAN-Adapter unterstützt keinen AP-Modus."; exit 1
  fi

  # Warten, bis NM-Status ok ist
  for _ in $(seq 1 30); do
    state=$(nmcli -t -f DEVICE,STATE device status | awk -F: '$1=="'"$ifc"'"{print $2}')
    [[ "$state" == "disconnected" || "$state" == "connected" ]] && return 0
    sleep 1
  done
  echo "FEHLER: $ifc bleibt 'unavailable'. Treiber/Firmware prüfen."; exit 1
}

CON_NAME="hotspot-${WLAN_IF}"
preflight_wifi "$WLAN_IF"

echo "==> Entferne ggf. alte Verbindung: $CON_NAME"
nmcli -t -f NAME connection show | grep -qx "$CON_NAME" && nmcli connection delete "$CON_NAME" || true

echo "==> Lege WPA2-Only Hotspot an (hidden)"
nmcli dev set "$WLAN_IF" managed yes || true
nmcli connection add type wifi ifname "$WLAN_IF" con-name "$CON_NAME" autoconnect yes ssid "$SSID"

# WPA2-PSK EXPLIZIT erzwingen (keine SAE/WPA3)
nmcli connection modify "$CON_NAME" \
  802-11-wireless.mode ap \
  802-11-wireless.hidden yes \
  802-11-wireless.band "${BAND:-bg}" \
  ipv4.method shared \
  ipv6.method ignore \
  wifi-sec.key-mgmt wpa-psk \
  wifi-sec.psk "$PSK"

# Optional Kanal setzen
[[ -n "${CHANNEL:-}" ]] && nmcli connection modify "$CON_NAME" 802-11-wireless.channel "$CHANNEL"

# Feste AP-IP
nmcli connection modify "$CON_NAME" connection.interface-name "$WLAN_IF"
nmcli connection modify "$CON_NAME" ipv4.addresses "${GATEWAY_IP}/24"

systemctl enable NetworkManager.service

echo "==> Starte Hotspot..."
nmcli connection up "$CON_NAME" ifname "$WLAN_IF"

echo "==> Beacon/Security-Check (Scan nach eigener SSID)"
sleep 2
scan_out=$(iw dev "$WLAN_IF" scan 2>/dev/null | awk '/SSID: /{ssid=$0} /RSN:/,0 {if($0~"SSID:"){print ""; print ssid} print}')
echo "$scan_out" | sed -n "/SSID: ${SSID}$/,/^$/p" | sed 's/^\s\+//'

if echo "$scan_out" | sed -n "/SSID: ${SSID}$/,/^$/p" | grep -qi '\bSAE\b'; then
  echo "WARNUNG: SAE/WPA3 im Beacon entdeckt – das sollte NICHT der Fall sein."
else
  echo "OK: Beacon enthält KEIN SAE – Hotspot ist WPA2-Only."
fi

echo "==> Fertig."
echo "    SSID (hidden): $SSID"
echo "    PSK          : $PSK"
echo "    AP-IP        : $GATEWAY_IP/24"