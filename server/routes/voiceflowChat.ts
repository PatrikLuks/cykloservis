import express from 'express';
import { z } from 'zod';
import fetch from 'node-fetch';
import path from 'path';
import { OpenAI } from 'openai';
import fs from 'fs';

const router = express.Router();

const voiceflowSchema = z.object({
  message: z.string().min(1, 'Zpráva nesmí být prázdná').optional(),
  userId: z.string().optional(),
});

// Získání klíče a ID projektu z env proměnných
const VOICEFLOW_API_KEY = process.env.VOICEFLOW_API_KEY;
const VOICEFLOW_PROJECT_ID = process.env.VOICEFLOW_PROJECT_ID;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

if (!VOICEFLOW_API_KEY || !VOICEFLOW_PROJECT_ID) {
  // eslint-disable-next-line no-console
  console.warn('Chybí VOICEFLOW_API_KEY nebo VOICEFLOW_PROJECT_ID v .env!');
}

router.post('/', async (req, res, next) => {
  try {
    // Podpora více obrázků
    let imageUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      imageUrls = req.files.map((f: any) => `/uploads/${f.filename}`);
    } else if (req.file) {
      imageUrls = [`/uploads/${req.file.filename}`];
    }
    // Přepis hlasu (audio) pomocí OpenAI Whisper
    let transcript = '';
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        if (file.mimetype.startsWith('audio') && openai) {
          const audioStream = fs.createReadStream(file.path);
          const resp = await openai.audio.transcriptions.create({
            file: audioStream,
            model: 'whisper-1',
            response_format: 'text',
            language: 'cs',
          });
          transcript += resp + ' ';
        }
      }
    } else if (req.file && req.file.mimetype.startsWith('audio') && openai) {
      const audioStream = fs.createReadStream(req.file.path);
      const resp = await openai.audio.transcriptions.create({
        file: audioStream,
        model: 'whisper-1',
        response_format: 'text',
        language: 'cs',
      });
      transcript += resp + ' ';
    }
    // message a userId z body (při multipart/form-data je v req.body)
    let { message = '', userId = 'demo-user' } = voiceflowSchema.parse(req.body);
    if (transcript) message = transcript.trim() + (message ? (' ' + message) : '');
    if (!VOICEFLOW_API_KEY || !VOICEFLOW_PROJECT_ID) {
      return res.status(500).json({ error: 'Voiceflow API není nakonfigurováno.' });
    }
    // Sestav payload pro Voiceflow
    let payloadMsg = message;
    if (imageUrls.length) {
      payloadMsg += '\n' + imageUrls.map((url, i) => `[obrázek ${i+1}]: ${url}`).join('\n');
    }
    const vfRes = await fetch(`https://general-runtime.voiceflow.com/state/${VOICEFLOW_PROJECT_ID}/user/${userId}/interact`, {
      method: 'POST',
      headers: {
        Authorization: VOICEFLOW_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ request: { type: 'text', payload: payloadMsg } }),
    });
    const data = await vfRes.json();
    // Najdi první textovou odpověď
    const reply = Array.isArray(data) && data[0]?.payload?.message ? data[0].payload.message : 'Žádná odpověď od Voiceflow.';
    res.json({ reply, imageUrls });
  } catch (e) {
    next(e);
  }
});

export default router;
