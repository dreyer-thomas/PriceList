#!/bin/bash

MODE=$1

PROJECT_DIR="/home/admin/PriceList"
BACKUP_DIR="/home/admin/backup"

DATA_DIR="$PROJECT_DIR/server/public/browser/data"
IMAGES_DIR="$PROJECT_DIR/server/public/browser/images"

BACKUP_DATA="$BACKUP_DIR/data"
BACKUP_IMAGES="$BACKUP_DIR/images"

if [ "$MODE" = "backup" ]; then
  echo "Backup wird erstellt..."

  mkdir -p "$BACKUP_DATA" "$BACKUP_IMAGES"

  cp -r "$DATA_DIR/"* "$BACKUP_DATA/" 2>/dev/null
  cp -r "$IMAGES_DIR/"* "$BACKUP_IMAGES/" 2>/dev/null

  echo "Backup abgeschlossen: $BACKUP_DIR"

elif [ "$MODE" = "restore" ]; then
  echo "Wiederherstellung läuft..."

  mkdir -p "$DATA_DIR" "$IMAGES_DIR"

  cp -r "$BACKUP_DATA/"* "$DATA_DIR/" 2>/dev/null
  cp -r "$BACKUP_IMAGES/"* "$IMAGES_DIR/" 2>/dev/null

  echo "Wiederherstellung abgeschlossen."

else
  echo "Ungültiger Modus. Bitte verwende:"
  echo "   ./save.sh backup <benutzername>"
  echo "   ./save.sh restore <benutzername>"
fi