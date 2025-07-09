import { Router } from 'express';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { registerSchema, validateBody } from '../validation';

declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: string; email: string };
  }
}

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tajnytoken';
function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Chybí nebo je neplatný token.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Neplatný nebo expirovaný token.' });
  }
}

// Registrace
router.post('/register', validateBody(registerSchema), async (req, res, next) => {
  const { email, password, name } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Uživatel již existuje.' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash, name });
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Registrace proběhla úspěšně.', token, name: user.name });
  } catch (e) {
    next(e);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Vyplňte všechna pole.' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Neplatné přihlašovací údaje.' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Neplatné přihlašovací údaje.' });
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Přihlášení úspěšné.', token, name: user.name });
  } catch (e) {
    next(e);
  }
});

// Změna hesla
router.post('/change-password', authMiddleware, async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Neautorizováno.' });
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Vyplňte staré i nové heslo.' });
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Uživatel nenalezen.' });
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return res.status(401).json({ error: 'Staré heslo není správné.' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Nové heslo musí mít alespoň 6 znaků.' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Heslo bylo změněno.' });
  } catch (e) {
    next(e);
  }
});

// Změna profilu
router.put('/profile', authMiddleware, async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Neautorizováno.' });
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Vyplňte jméno i e-mail.' });
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { name, email }, { new: true });
    if (!user) return res.status(404).json({ error: 'Uživatel nenalezen.' });
    res.json({ name: user.name, email: user.email, id: user._id?.toString?.(), role: user.role, permissions: user.permissions, notificationPreferences: user.notificationPreferences, twoFactorEnabled: user.twoFactorEnabled });
  } catch (e) {
    next(e);
  }
});

// Načtení profilu
router.get('/profile', authMiddleware, async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Neautorizováno.' });
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Uživatel nenalezen.' });
    res.json({ name: user.name, email: user.email, id: user._id?.toString?.(), role: user.role, permissions: user.permissions, notificationPreferences: user.notificationPreferences, twoFactorEnabled: user.twoFactorEnabled });
  } catch (e) {
    next(e);
  }
});

// Nastavení hesla pro pozvaného uživatele (onboarding)
router.post('/set-password', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Chybí e-mail nebo heslo.' });
  // Validace síly hesla
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return res.status(400).json({ error: 'Heslo musí mít alespoň 8 znaků, obsahovat písmeno a číslo.' });
  }
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'Uživatel nenalezen.' });
  if (user.password && user.password.length > 0) return res.status(400).json({ error: 'Heslo již bylo nastaveno.' });
  const hash = await require('bcryptjs').hash(password, 10);
  user.password = hash;
  await user.save();
  return res.json({ success: true, message: 'Heslo nastaveno. Nyní se můžete přihlásit.' });
});

// Načtení notifikačních preferencí
router.get('/notification-preferences', authMiddleware, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Neautorizováno.' });
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Uživatel nenalezen.' });
  res.json(user.notificationPreferences || {});
});

// Uložení notifikačních preferencí
router.put('/notification-preferences', authMiddleware, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Neautorizováno.' });
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Uživatel nenalezen.' });
  user.notificationPreferences = req.body;
  await user.save();
  res.json(user.notificationPreferences);
});

export default router;
