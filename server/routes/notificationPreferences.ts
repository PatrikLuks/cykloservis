import express, { Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { User } from '../models/User';

const router = express.Router();

// Získání preferencí
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const userId = (req.user as any)?.id;
  if (!userId) return res.status(401).json({ error: 'Neautorizováno.' });
  const user = await User.findById(userId);
  res.json(user?.notificationPreferences || {});
});

// Uložení preferencí
router.put('/', requireAuth, async (req: Request, res: Response) => {
  const userId = (req.user as any)?.id;
  if (!userId) return res.status(401).json({ error: 'Neautorizováno.' });
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'Uživatel nenalezen.' });
  user.notificationPreferences = req.body;
  await user.save();
  res.json(user.notificationPreferences);
});

export default router;
