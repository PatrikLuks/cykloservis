import express, { Request, Response } from 'express';
import axios from 'axios';
import { User } from '../models/User';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID || '';
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET || '';
const STRAVA_REDIRECT_URI = process.env.STRAVA_REDIRECT_URI || 'http://localhost:3001/api/strava/callback';

// 1. Přesměrování na Strava autorizaci
router.get('/connect', requireAuth, (req: Request, res: Response) => {
  const url = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(STRAVA_REDIRECT_URI)}&approval_prompt=auto&scope=activity:read_all`;
  res.redirect(url);
});

// 2. Callback z Stravy, získání access tokenu a uložení k uživateli
router.get('/callback', requireAuth, async (req: Request, res: Response) => {
  const user = req.user as any;
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'Chybí kód.' });
  try {
    const resp = await axios.post('https://www.strava.com/oauth/token', {
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    });
    const { access_token, refresh_token, expires_at } = resp.data;
    await User.findByIdAndUpdate(user.id, { strava: { access_token, refresh_token, expires_at } });
    res.send('Strava účet úspěšně propojen. Můžete zavřít toto okno.');
  } catch (e) {
    res.status(500).json({ error: 'Chyba při získávání tokenu.' });
  }
});

// 3. Získání aktivit uživatele ze Stravy
router.get('/activities', requireAuth, async (req: Request, res: Response) => {
  const user = await User.findById((req.user as any).id);
  if (!user?.strava?.access_token) return res.status(400).json({ error: 'Účet není propojen se Stravou.' });
  try {
    const resp = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
      headers: { Authorization: `Bearer ${user.strava.access_token}` },
      params: { per_page: 30 },
    });
    res.json(resp.data);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při načítání aktivit ze Stravy.' });
  }
});

export default router;
