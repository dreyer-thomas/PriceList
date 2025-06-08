import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname für ES Module korrekt bestimmen
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;


// JSON-Dateipfad
const DATA_FILE = path.join(process.cwd(), '/server/public/browser/price-groups.json');

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

app.get('/', (req, res) => {
  if (req.accepts('html')) {
    res.sendFile(path.join(publicPath, 'index.html'));
  }
});


// Server starten
app.listen(PORT, () => {
  console.log(`✅ Backend läuft unter http://localhost:${PORT}`);
});