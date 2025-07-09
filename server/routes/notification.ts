import express from 'express';
import Notification from '../models/Notification';
import { requireAuth } from '../middleware/auth';
import { sendPushToUser } from '../utils/pushSender';
import { User } from '../models/User';
import { getUserId } from '../utils/getUserId';

const router = express.Router();

// Získání notifikací pro přihlášeného uživatele
router.get('/', requireAuth, async (req, res) => {
  const userId = getUserId(req.user);
  if (!userId) return res.status(401).json({ error: 'Neautorizováno.' });
  const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(100);
  res.json(notifications);
});

// Označení notifikace jako přečtené
router.post('/:id/read', requireAuth, async (req, res) => {
  const userId = getUserId(req.user);
  if (!userId) return res.status(401).json({ error: 'Neautorizováno.' });
  const { id } = req.params;
  await Notification.updateOne({ _id: id, userId }, { $set: { read: true } });
  res.json({ success: true });
});

// Vytvoření nové notifikace a případné odeslání push/email
export async function createAndSendNotification({ userId, type, message }: { userId: string; type: string; message: string }) {
  // Získat uživatele a jeho preference
  const user = await User.findById(userId);
  if (!user) return null;
  const prefs = user.notificationPreferences || { email: true, push: true, types: ['reservation','team','system'] };
  if (!prefs.types.includes(type)) return null; // uživatel nechce tento typ notifikace
  const notification = await Notification.create({ userId, type, message });
  // Odeslat push notifikaci dle preferencí
  if (prefs.push) await sendPushToUser(userId, { title: 'Nová notifikace', body: message, type });
  // (volitelně) odeslat e-mail dle preferencí
  // if (prefs.email) ...
  return notification;
}

export default router;
