#!/bin/bash
sleep 31

# Warten, bis HDMI-1 wirklich verfügbar ist
while ! xrandr | grep -q "HDMI-1 connected"; do
  sleep 1
done

xrandr --output HDMI-1 --mode 1920x1080 --rotate left