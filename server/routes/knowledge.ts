import fs from 'fs';
import path from 'path';
import express from 'express';

const router = express.Router();

// Načte všechny markdown soubory ve složce knowledge a vrátí je jako pole objektů { question, answer }
router.get('/', (req, res) => {
  const dir = path.join(__dirname, 'knowledge');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  const faqs: { question: string; answer: string }[] = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    // Parsování: otázka je nadpis (## ...), odpověď je text pod ním
    const matches = [...content.matchAll(/^## (.+?)\n([\s\S]+?)(?=^## |\Z)/gm)];
    for (const m of matches) {
      faqs.push({ question: m[1].trim(), answer: m[2].trim() });
    }
  }
  res.json(faqs);
});

// Vyhledání odpovědi na dotaz (fulltext v otázce i odpovědi, case-insensitive)
router.post('/search', (req, res) => {
  const { query } = req.body;
  if (!query || typeof query !== 'string') return res.status(400).json({ error: 'Chybí dotaz.' });
  const dir = path.join(__dirname, 'knowledge');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  let best: { question: string; answer: string } | null = null;
  let bestScore = 0;
  for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    const matches = [...content.matchAll(/^## (.+?)\n([\s\S]+?)(?=^## |\Z)/gm)];
    for (const m of matches) {
      const q = m[1].toLowerCase();
      const a = m[2].toLowerCase();
      const score = (q.includes(query.toLowerCase()) ? 2 : 0) + (a.includes(query.toLowerCase()) ? 1 : 0);
      if (score > bestScore) {
        bestScore = score;
        best = { question: m[1].trim(), answer: m[2].trim() };
      }
    }
  }
  if (bestScore > 0) res.json(best);
  else res.status(404).json({ error: 'Nebylo nalezeno.' });
});

export default router;
