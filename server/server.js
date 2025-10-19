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
const DATA_FILE = path.resolve(__dirname, 'public', 'browser', 'data', 'price-groups.json');
const imageDir = path.resolve(__dirname, 'public', 'browser', 'images');
const dataDir = path.resolve(__dirname, 'public', 'browser', 'data');

// Ensure upload/data directories exist (robustly, no absolute root paths)
try {
  if (!existsSync(imageDir)) {
    mkdirSync(imageDir, { recursive: true });
  }
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
} catch (err) {
  console.error('❌ Konnte Verzeichnisse nicht anlegen:', err);
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

const publicPath = path.resolve(__dirname, 'public', 'browser');
console.log(`✅ Public path: ${publicPath}`);
app.use(express.static(publicPath));

// Global error handlers for better diagnostics
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});


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

// Simple health endpoint
app.get('/health', (_req, res) => res.json({ ok: true }));


// Server starten
app.listen(PORT, () => {
  console.log(`✅ Backend läuft unter http://localhost:${PORT}`);
});