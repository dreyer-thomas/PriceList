# ShopBoard

Dieses Projekt realisiert eine Anzeige in einem Verkaufswagen oder Imbis zur Anzeige der Preise. Es besteht aus einer Web-Visualisierung für einen Monitor, auf dem die Preise und Artikel angezeigt werden. Über die eingebaute WLAN-Hotspot-Funktion kann sich der Administrator auf das Gerät verbinden und über die Admin-Seite die Artikel, Preise usw. einstellen. 

## Aufruf des Servers

Der Server ist in NodeJS geschrieben und liegt im Pfad /server. Zum starten wird dieses Kommando benutzt:

```bash
npm run prod
```

Der Server hat eine eingebaute REST-API womit die Konfiguration von der WebUI entgegengenommen und auf dem Server persistiert wird. Die Dateien werden dabei in diese Pfade abgelegt:

./server/public/browser/data : Ablage der Konfigurationsdatei price-groups.json
./server/public/browser/images: Ablage der hochgeladenen Bilder zur Anzeige in den Preisgruppen

Gleichzeitig liefert der server die Webseiten und damit die Anwendungen aus. Diese befinden sich in kompilierter Form in:

./server/public/brwoser/index.html

Der Server startet mit der Adresse: http://localhost:3000
Die Admin-Seite wird über diese Adresse erreicht: http://localhost:3000/admin

## WLAN Zugang

Der RaspberryPi startet ein WLAN Hotspot mit dem Namen "ShopBoard". Dieser ist mit WPA gesichert. Das Passwort ist zur Zeit noch fest mit "SB_270177" eingestellt. Die IP-Adresse des Raspi ist dann die 10.42.0.1. Um die Admin-Seite aufzurufen, muss also in einem verbundenen Gerät eingegeben werden:

http://10.42.0.1:3000/admin

Dann erscheint die Admin-Seite zum Editieren des Angebotes.

## Netzwerkzugang des Raspi

Der Raspi kann auch über Netzwerk verbunden werden. Dann nutzt der dieses zum Zugriff auf das Internet. Es muss im Netzwerk ein DHCP-Server vorhanden sein, z.B. über eine Fritzbox.

## Update der Anwendung

Die Anwendung ist updatefähig. Dafür wird das Projekt bei Github genutzt und bei Vorhandensein des Internets beim Booten des Raspi, also mit angeschlossenem Netzwerkkabel, wird die neueste Version vom /main branch im Github geladen.

## Anschluss des Monitors

Am HDMI-1 (der Anschluss direkt neben dem USB-C-Stromanschluss) wird der Monitor betrieben. Beim Booten wird zunächst einige Sekunden (35 Sek) gewartet, dann der Bildschirm auf die Auflösung 1920x1080 in Hochkant eingestellt. So sollte das ShopBoard betrieben werden.

## Starten des Raspi

Beim Booten des Raspi wird der Monitori aktiviert, wenn dieser verbunden ist. Sollte keiner angeschlossen sein, dann bleibt der HDMI unbenutzt. In dem Falle Monitor anschließen und neu starten.

Mit dem Start des Raspis werden zwei Dienste gestartet:
- preisliste.service
- display-setup.service

### preisliste.service

Dieser Service startet das Skript /home/admin/preisliste/startup.sh. Dieses dient zum Updaten und Starten des Servers. Das Skript ist wie folgt:

```bash
[Unit]
Description=Preisliste Autostart
After=network-online.target
Wants=network-online.target

[Service]
ExecStart=/home/admin/startup.sh
User=admin
Restart=always

[Install]
WantedBy=multi-user.target
```

Das aufgerufene Skipt startup.sh ist so definiert:

```bash
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
```

Im Verzeichnis /home/admin/PriceList befindet sich das Projekt. Es wird zunächst geprüft, dass Netzwerk verfügbar ist. Wenn nicht wird der Server direkt gestartet. Wen es jedoch vorhanden ist, dann wird vom GitHub das Projekt geladen (branch main). Anschließend im Verzeichnis /server die NPM-Abhängigkeiten installiert und danach im darüberliegenden Verzeichnis mit dem Angular-Projekt. Beim Ausführen des build-Kommandos werden auch die Speiucherplätze für die Konfiguration und die hochgeladenen Bilder gelöscht. Um diese nicht zu verlieren, werden die vor dem build gesichert und danach wieder dort abgelegt. Danach startet auch der Server.


### display-setup.service

Dieser Dienst setzt dann die Bildschirmauflösung und Hochkant-Format. Das Skript ist wie folgt:

```bash
[Unit]
Description=Set HDMI display resolution and rotation
After=graphical.target

[Service]
User=admin
Environment=DISPLAY=:0
ExecStart=/usr/local/bin/set-display.sh
Restart=on-failure

[Install]
WantedBy=graphical.target
```

Damit wird das Skript /usr/local/bin/set-display.sh gerufen. Dieses ist folgendermaßen definiert:

```bash
#!/bin/bash
sleep 31

# Warten, bis HDMI-1 wirklich verfügbar ist
while ! xrandr | grep -q "HDMI-1 connected"; do
  sleep 1
done

xrandr --output HDMI-1 --mode 1920x1080 --rotate left
```

Damit erfolgt zunächst eine Wartezeit von 31 Sekunden. Das dient dazu, dass der WebServer geladen und gestartet und der Desktop vollständig vorhanden ist. Nach deser Zeit wird mit dem xrandr-Kommando die Auflösung und Rotation des Screens gesteuert. Hier ist auch eine Warteroutine, falls der Monitor noch nicht angeschlossen ist. Das dient der automatischen Umstellung falls der Monitor später angeschlossen wird.

## Brwoser im Kiosk-Mode starten

Sobald der Server läuft wird der Brwoser gebraucht. Dieser wird über die Autostart des Desktop gestartet. Die Definition ist in dieser Datei vorgenommen:

/config/lxsession/LXDE-pi/autostart

und so definiert:

```bash
@xset s off
@xset -dpms
@xset s noblank
@xrandr
@chromium-browser --kiosk --app=http://localhost:3000
```

das startet den Chromium-Browser mit der loaklen Adresse für das ShopBoard. 

# Source Code

Der SourceCode befindet sich in einem privaten Github-Projekt: https://github.com/dreyer-thomas/PriceList.git.

