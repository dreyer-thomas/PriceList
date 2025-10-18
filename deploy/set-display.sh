#!/bin/bash
set -euo pipefail

# Defaults (können per Environment überschrieben werden)
: "${DISPLAY:=:0}"
: "${OUTPUT:=HDMI-1}"
: "${MODE:=1920x1080}"
: "${ROTATE:=}"   # leer = keine Rotation setzen

export DISPLAY

sleep 31

# Warten, bis der Ausgang wirklich verfügbar ist
until xrandr | grep -q "$OUTPUT connected"; do
  sleep 1
done

# Basiskonfiguration
cmd=(xrandr --output "$OUTPUT" --mode "$MODE")

# Rotation NUR anhängen, wenn ROTATE gesetzt ist (left|right|inverted|normal)
if [[ -n "${ROTATE}" ]]; then
  cmd+=(--rotate "$ROTATE")
fi

# Anwenden
"${cmd[@]}"