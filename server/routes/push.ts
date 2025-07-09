import { Request, Response, Router } from 'express';
import PushSubscription from '../models/PushSubscription';
import { requireAuth } from '../middleware/auth';
import { PushSubscriptionData } from '../../shared/pushTypes';

const router = Router();

// Uloží nebo aktualizuje push subscription pro uživatele
router.post('/subscribe', requireAuth, async (req: Request, res: Response) => {
  try {
    const { endpoint, keys }: PushSubscriptionData = req.body;
    const user = (req as any).user;
    if (!user || !user.id) {
      return res.status(401).json({ error: 'Neautorizováno' });
    }
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ error: 'Invalid subscription data' });
    }
    await PushSubscription.findOneAndUpdate(
      { userId: user.id, endpoint },
      { endpoint, keys, userId: user.id },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});

// Endpoint pro získání VAPID public key
router.get('/vapid-public-key', (req, res) => {
  const { getVapidKeys } = require('../utils/vapidKeys');
  const keys = getVapidKeys();
  res.json({ publicKey: keys.publicKey });
});

export default router;
