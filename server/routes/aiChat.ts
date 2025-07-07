import express from 'express';
import { z } from 'zod';

const router = express.Router();

const aiChatSchema = z.object({
  message: z.string().min(1, 'Zpráva nesmí být prázdná'),
});

// Placeholder AI odpověď (lze nahradit voláním OpenAI API)
router.post('/', async (req, res, next) => {
  try {
    const { message } = aiChatSchema.parse(req.body);
    // Zde by bylo volání OpenAI API, nyní pouze echo s prefixem
    const reply = `AI odpověď: ${message}`;
    res.json({ reply });
  } catch (e) {
    next(e);
  }
});

export default router;
