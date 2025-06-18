#!/bin/bash
set -e

# Projektbasis
cd /home/admin/PriceList

echo "→ Pull vom Repo..."
git reset --hard
git pull origin main

# Backend
echo "→ Backend vorbereiten..."
cd server
npm install

# Frontend
echo "→ Frontend bauen..."
cd ..
npm install
echo "→ Backup Configuraiton..."
rm -rf /home/admin/PriceList_Backup/*
cp -r server/public/browser/data /home/admin/PriceList_Backup
cp -r server/public/browser/images /home/admin/PriceList_Backup
npm run build
cp -r /home/admin/PriceList_Backup/data server/public/browser/data
cp -r /home/admin/PriceList_Backup/images server/public/browser/images

# Server starten
echo "→ Server neu starten..."
npm run prod
