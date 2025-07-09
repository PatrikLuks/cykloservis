import { Router } from 'express';
import { ServiceRecord } from '../models/ServiceRecord';
import { getUserId } from '../utils/getUserId';

const router = Router();

// Endpoint: GET /api/reminders/upcoming
router.get('/upcoming', async (req, res) => {
  const userId = getUserId(req.user);
  if (!userId) return res.status(401).json({ error: 'Neautorizováno.' });
  const now = new Date();
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const records = await ServiceRecord.find({ userId, reminder: true, date: { $gte: now, $lte: in7days } });
  res.json(records);
});

export default router;
