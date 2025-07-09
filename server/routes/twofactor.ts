import { Router } from 'express';
import { User } from '../models/User';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Vygeneruje tajný klíč a QR pro aktivaci 2FA
router.post('/setup', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Uživatel nenalezen.' });
  const secret = speakeasy.generateSecret({ name: `Cykloservis (${user.email})` });
  user.twoFactorSecret = secret.base32;
  await user.save();
  const otpauth = secret.otpauth_url;
  const qr = await qrcode.toDataURL(otpauth);
  res.json({ qr, secret: secret.base32 });
});

// Ověření kódu a aktivace 2FA
router.post('/verify', requireAuth, async (req, res) => {
  const { token } = req.body;
  const user = await User.findById(req.user.id);
  if (!user || !user.twoFactorSecret) return res.status(400).json({ error: '2FA není inicializováno.' });
  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token
  });
  if (!verified) return res.status(400).json({ error: 'Neplatný kód.' });
  user.twoFactorEnabled = true;
  await user.save();
  res.json({ success: true });
});

// Deaktivace 2FA
router.post('/disable', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Uživatel nenalezen.' });
  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  await user.save();
  res.json({ success: true });
});

export default router;
