# ShopBoard

Dieses Projekt realisiert eine Anzeige in einem Verkaufswagen oder Imbiss zur Anzeige der Preise. Es besteht aus einer Web-Visualisierung für einen Monitor, auf dem die Preise und Artikel angezeigt werden. Über die eingebaute WLAN-Hotspot-Funktion kann sich der Administrator auf das Gerät verbinden und über die Admin-Seite die Artikel, Preise usw. einstellen. 

Das Projekt besteht aus drei zentralen Komponenten:
- einer Angular-Frontend-Anwendung zur Anzeige der Preise auf einem Bildschirm,
- einer Node.js-Backend-Anwendung zur Konfiguration und Bereitstellung der Webinhalte,
- einer automatisierten Konfiguration und Steuerung über ein Raspberry Pi System (inkl. WLAN-Hotspot, Autoupdate, Kiosk-Modus und Bildschirmmanagement).

## Aufruf des Servers

Der Server ist in NodeJS geschrieben und liegt im Pfad /server. Zum starten wird dieses Kommando benutzt:

```bash
npm run prod
```

Der Server hat eine eingebaute REST-API womit die Konfiguration von der WebUI entgegengenommen und auf dem Server persistiert wird. Die Dateien werden dabei in diese Pfade abgelegt:

```bash
/home/admin/PriceList/server/public/browser/data/ : Ablage der Konfigurationsdatei price-groups.json
/home/admin/PriceList/server/public/browser/images/: Ablage der hochgeladenen Bilder zur Anzeige in den Preisgruppen
```

Gleichzeitig liefert der server die Webseiten und damit die Anwendungen aus. Diese befinden sich in kompilierter Form in:

```bash
./server/public/browser/index.html
```

Der Server startet mit der Adresse: http://localhost:3000
Die Admin-Seite wird über diese Adresse erreicht: http://localhost:3000/admin

## Front-End
as Frontend ist mit Angular umgesetzt und wird mit npm run build kompiliert. Das erzeugte Bundle wird im Ordner /server/public/browser/ abgelegt und von der Node.js-App ausgeliefert.

## REST-API
Die REST-API dient der WebUI zum Lesen und Speichern der Bilder und der Konfigurationsdatei. Die API ist so definiert:

- `GET    /api/groups` – Liefert die aktuelle Preiskonfiguration
- `POST   /api/groups` – Speichert eine neue Preiskonfiguration
- `POST   /api/upload` – Lädt ein neues Bild hoch

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

Beim Booten des Raspi wird der Monitor aktiviert, wenn dieser verbunden ist. Sollte keiner angeschlossen sein, wartet das System auf das Einstecken des Monitor, bevor die Auflösung und Gochformat eingestellt werden.

Mit dem Start des Raspis werden zwei Dienste gestartet:
- preisliste.service
- display-setup.service

### systemd Unit: preisliste.service

Dieser Service startet das Skript 

```bash
/home/admin/preisliste/startup.sh
```

Dieses dient zum Updaten und Starten des Servers. Das Skript ist wie folgt:

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

Im Verzeichnis /home/admin/PriceList befindet sich das Projekt. Es wird zunächst geprüft, dass Netzwerk verfügbar ist. Wenn nicht wird der Server direkt gestartet. Wen es jedoch vorhanden ist, dann wird vom GitHub das Projekt geladen (branch main). Anschließend im Verzeichnis /server die NPM-Abhängigkeiten installiert und danach im darüberliegenden Verzeichnis mit dem Angular-Projekt. Beim Ausführen des build-Kommandos werden auch die Speicherplätze für die Konfiguration und die hochgeladenen Bilder gelöscht. Um diese nicht zu verlieren, werden die vor dem build gesichert und danach wieder dort abgelegt. Danach startet auch der Server.


### systemd Unit: display-setup.service

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

## Browser im Kiosk-Mode starten

Sobald der Server läuft wird der Brwoser gebraucht. Dieser wird über die Autostart des Desktop gestartet. Die Definition ist in dieser Datei vorgenommen:

```bash
/config/lxsession/LXDE-pi/autostart
```

und so definiert:

```bash
@xset s off
@xset -dpms
@xset s noblank
@xrandr
@chromium-browser --kiosk --app=http://localhost:3000
```

das startet den Chromium-Browser mit der lokalen Adresse für das ShopBoard. 

# Source Code

Der SourceCode befindet sich in einem privaten Github-Projekt: https://github.com/dreyer-thomas/PriceList.git.

## Lizenz

MIT License

Copyright (c) 2025 Thomas Dreyer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

