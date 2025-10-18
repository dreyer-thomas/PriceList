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
  rm -rd /home/admin/backup/*
  cp -r server/public/browser/data /home/admin/backup
  cp -r server/public/browser/images /home/admin/backup
  npm run build
  cp -r /home/admin/backup/data server/public/browser/data
  cp -r /home/admin/backup/images server/public/browser/images
  cp /home/admin/PriceList/deploy/backup.sh /home/admin/backup.sh
  chmod +x /home/admin/backup.sh
  cp /home/admin/PriceList/deploy/startup.sh /home/admin/startup.sh
  chmod +x /home/admin/startup.sh
  git pull >> /home/admin/startup.log 2>&1
else
  echo "Kein Internet – überspringe git pull" >> /home/admin/startup.log
fi

# Server starten
echo "→ Server neu starten..."
npm run prod
