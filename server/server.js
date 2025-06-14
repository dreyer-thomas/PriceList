import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { existsSync, mkdirSync } from 'fs';

// __dirname für ES Module korrekt bestimmen
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;


// JSON-Dateipfad
const DATA_FILE = path.join(process.cwd(), '/server/public/browser/data/price-groups.json');
const imageDir = path.join(process.cwd(), '/server/public/browser/images');
const dataDir = path.join(process.cwd(), '/server/public/browser/data');

//ensure the upload dir exists
if (!existsSync(imageDir)) {
  mkdirSync(imageDir, { recursive: true });
}

if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Multer-Konfiguration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imageDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage: storage });



// Middleware
app.use(cors());
app.use(express.json());

const publicPath = path.join(process.cwd(), '/server/public/browser');
console.log(`✅ Public path: ${publicPath}`);
app.use(express.static(publicPath));


// JSON-Datei lesen
app.get('/api/preisgruppen', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error('Fehler beim Lesen:', err);
    res.status(500).json({ error: 'Datei konnte nicht gelesen werden.' });
  }
});

// JSON-Datei schreiben
app.post('/api/preisgruppen', async (req, res) => {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(req.body, null, 2), 'utf-8');
    res.json({ message: 'Daten gespeichert.' });
  } catch (err) {
    console.error('Fehler beim Schreiben:', err);
    res.status(500).json({ error: 'Datei konnte nicht gespeichert werden.' });
  }
});

app.get('/admin', (req, res) => {
  if (req.accepts('html')) {
    res.sendFile(path.join(publicPath, 'index.html'));
  }
});

// Upload-API
app.post('/api/images', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Kein Bild hochgeladen');
  }
  res.json({ filename: req.file.filename });
});

// Liste aller Bilder zurückgeben
app.get('/api/images', async (req, res) => {
  try {
    const files = await fs.readdir(imageDir);
    res.json(files);
  } catch (err) {
    console.error('Fehler beim Lesen des Upload-Ordners:', err);
    res.status(500).send('Fehler beim Lesen der Bilder');
  }
});

// Einzelnes Bild löschen
app.delete('/api/images/:filename', async (req, res) => {
  const filePath = path.join(imageDir, req.params.filename);
  try {
    await fs.unlink(filePath);
    res.status(200).send('Bild gelöscht');
  } catch (err) {
    console.error('Fehler beim Löschen:', err);
    res.status(500).send('Fehler beim Löschen');
  }
});

app.get('/', (req, res) => {
  if (req.accepts('html')) {
    res.sendFile(path.join(publicPath, 'index.html'));
  }
});


// Server starten
app.listen(PORT, () => {
  console.log(`✅ Backend läuft unter http://localhost:${PORT}`);
});