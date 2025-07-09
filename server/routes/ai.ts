import express from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { ServiceRecord } from '../models/ServiceRecord';
import { User } from '../models/User';
import axios from 'axios';

const router = express.Router();

// Základní AI doporučení pro uživatele
router.get('/recommendation', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Uživatel nenalezen' });
    // Servisní historie
    const records = await ServiceRecord.find({ userId }).sort({ date: -1 });
    // Aktivity ze Stravy (pokud je propojeno)
    let activities: any[] = [];
    if (user.strava && user.strava.access_token) {
      try {
        const stravaRes = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
          headers: { Authorization: `Bearer ${user.strava.access_token}` },
          params: { per_page: 100 }
        });
        activities = stravaRes.data;
      } catch {}
    }
    // Základní logika doporučení
    let recommendation = 'Jezděte bezpečně!';
    if (records.length > 0) {
      const last = records[0];
      const lastDate = new Date(last.date);
      const monthsAgo = (Date.now() - lastDate.getTime()) / (1000*60*60*24*30);
      if (monthsAgo > 6) recommendation = 'Doporučujeme servis – poslední byl před více než 6 měsíci.';
      else recommendation = `Poslední servis: ${lastDate.toLocaleDateString()}`;
    }
    if (activities.length > 0) {
      const totalKm = activities.reduce((sum, a) => sum + (a.distance || 0), 0) / 1000;
      if (totalKm > 1000) recommendation += ' Najeli jste přes 1000 km, zvažte servis.';
    }
    return res.json({ recommendation });
  } catch (err) {
    return res.status(500).json({ error: 'Chyba AI doporučení' });
  }
});

export default router;
