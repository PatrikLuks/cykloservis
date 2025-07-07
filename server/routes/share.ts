import express from 'express';
import ShareToken from '../models/ShareToken';
import { ServiceRecord } from '../models/ServiceRecord';
import crypto from 'crypto';

const router = express.Router();

// Vytvoření sdílecího tokenu (POST /api/share)
router.post('/', async (req, res) => {
  const { userId, bikeId, expiresInHours = 48 } = req.body;
  if (!userId) return res.status(400).json({ error: 'Chybí userId.' });
  const token = crypto.randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
  await ShareToken.create({ userId, bikeId, token, expiresAt });
  res.json({ token, url: `/api/share/${token}` });
});

// Získání servisní knihy přes token (GET /api/share/:token)
router.get('/:token', async (req, res) => {
  const { token } = req.params;
  const share = await ShareToken.findOne({ token, expiresAt: { $gt: new Date() } });
  if (!share) return res.status(404).json({ error: 'Token nenalezen nebo expirován.' });
  const filter: any = { userId: share.userId };
  if (share.bikeId) filter.bikeId = share.bikeId;
  const records = await ServiceRecord.find(filter).sort({ date: -1 });
  res.json({ records });
});

// Získání všech aktivních sdílených tokenů uživatele (GET /api/share/list?userId=...)
router.get('/list', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Chybí userId.' });
  const tokens = await ShareToken.find({ userId, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
  res.json({ tokens });
});

// Zneplatnění (smazání) sdílecího tokenu (DELETE /api/share/:token)
router.delete('/:token', async (req, res) => {
  const { token } = req.params;
  const deleted = await ShareToken.findOneAndDelete({ token });
  if (!deleted) return res.status(404).json({ error: 'Token nenalezen.' });
  res.json({ success: true });
});

export default router;
