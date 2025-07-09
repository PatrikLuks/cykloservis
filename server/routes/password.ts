import express from 'express';
import { User } from '../models/User';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const router = express.Router();

// In-memory store pro demo (v produkci použít DB nebo Redis)
const resetTokens: Record<string, { userId: string; expires: number }> = {};

// POST /api/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(200).json({ message: 'Pokud e-mail existuje, instrukce byly odeslány.' });
  const token = crypto.randomBytes(32).toString('hex');
  resetTokens[token] = { userId: String(user._id), expires: Date.now() + 1000 * 60 * 30 };
  // V produkci poslat e-mail, zde jen vracíme token pro testování
  res.json({ message: 'Instrukce byly odeslány.', token });
});

// POST /api/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  const entry = resetTokens[token];
  if (!entry || entry.expires < Date.now()) return res.status(400).json({ error: 'Token je neplatný nebo expiroval.' });
  const user = await User.findById(entry.userId);
  if (!user) return res.status(400).json({ error: 'Uživatel nenalezen.' });
  user.password = await bcrypt.hash(password, 10);
  await user.save();
  delete resetTokens[token];
  res.json({ message: 'Heslo bylo úspěšně změněno.' });
});

export default router;
