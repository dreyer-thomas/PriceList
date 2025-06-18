#!/bin/bash
set -e

# Projektbasis
cd /home/admin/PriceList

# Prüfen ob Internet da ist (z. B. DNS funktioniert)
if ping -c 1 -W 1 github.com >/dev/null 2>&1; then
  echo "Netz verfügbar, aktualisiere Repository" >> /home/admin/startup.log
  git reset --hard
  git pull origin main
  cd server
  npm install
  cd ..
  npm install
  rm -rd /home/admin/PriceList_Backup/*
  cp -r server/public/browser/data /home/admin/PriceList_Backup
  cp -r server/public/browser/images /home/admin/PriceList_Backup
  npm run build
  cp -r /home/admin/PriceList_Backup/data server/public/browser/data
  cp -r /home/admin/PriceList_Backup/images server/public/browser/images
  git pull >> /home/admin/startup.log 2>&1
else
  echo "Kein Internet – überspringe git pull" >> /home/admin/startup.log
fi

# Server starten
echo "→ Server neu starten..."
npm run prod
