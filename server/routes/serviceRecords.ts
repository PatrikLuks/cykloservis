import { Router } from 'express';
import { ServiceRecord } from '../models/ServiceRecord';
import { User } from '../models/User';
import { Request, Response, NextFunction } from 'express';
import { serviceRecordSchema, serviceRecordUpdateSchema, validateBody } from '../validation';

declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: string; email: string };
  }
}

const router = Router();

// JWT middleware bude importován z hlavního souboru nebo znovu definován zde
import jwt from 'jsonwebtoken';
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

// CRUD endpointy pro servisní knihu
router.get('/', authMiddleware, async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Neautorizováno.' });
  try {
    const { from, to, q, bikeModel, bikeBrand, recordType, status } = req.query;
    const filter: any = { userId: req.user!.id };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from as string);
      if (to) filter.date.$lte = new Date(to as string);
    }
    if (bikeModel) filter.bikeModel = bikeModel;
    if (bikeBrand) filter.bikeBrand = bikeBrand;
    if (q) {
      filter.$or = [
        { description: { $regex: q, $options: 'i' } },
        { notes: { $regex: q, $options: 'i' } }
      ];
    }
    if (recordType) filter.recordType = recordType;
    if (status) filter.status = status;
    const records = await ServiceRecord.find(filter).sort({ date: -1 });
    res.json(records);
  } catch (e) {
    next(e);
  }
});

router.post('/', authMiddleware, validateBody(serviceRecordSchema), async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Neautorizováno.' });
  const { date, description, photos, notes, bikeModel, bikeBrand, reminder, bikeId, price, serviceType } = req.body;
  if (!date || !description) {
    return res.status(400).json({ error: 'Vyplňte datum a popis.' });
  }
  try {
    const record = await ServiceRecord.create({
      userId: req.user!.id,
      date,
      description,
      photos: photos || [],
      notes,
      bikeModel,
      bikeBrand,
      reminder: !!reminder,
      bikeId,
      price,
      serviceType
    });
    res.status(201).json(record);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', authMiddleware, validateBody(serviceRecordUpdateSchema), async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Neautorizováno.' });
  try {
    // Najdi původní záznam
    const original = await ServiceRecord.findOne({ _id: req.params.id, userId: req.user!.id });
    if (!original) return res.status(404).json({ error: 'Záznam nenalezen.' });
    // Proveď update
    const record = await ServiceRecord.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      req.body,
      { new: true }
    );
    if (!record) return res.status(404).json({ error: 'Záznam nenalezen.' });
    // Zjisti změny
    const changes: Record<string, any> = {};
    for (const key in req.body) {
      if (key !== 'updatedAt' && req.body[key] !== undefined && (original as any)[key] !== req.body[key]) {
        changes[key] = { from: (original as any)[key], to: req.body[key] };
      }
    }
    if (Object.keys(changes).length > 0) {
      record.history.push({ date: new Date(), changes, author: req.user!.id });
      await record.save();
    }
    res.json(record);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Neautorizováno.' });
  try {
    const record = await ServiceRecord.findOneAndDelete({ _id: req.params.id, userId: req.user!.id });
    if (!record) return res.status(404).json({ error: 'Záznam nenalezen.' });
    res.json({ message: 'Záznam byl smazán.' });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id/photo', authMiddleware, async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Neautorizováno.' });
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Chybí URL fotky.' });
  try {
    const record = await ServiceRecord.findOne({ _id: req.params.id, userId: req.user!.id });
    if (!record) return res.status(404).json({ error: 'Záznam nenalezen.' });
    record.photos = record.photos.filter((p: string) => p !== url);
    await record.save();
    res.json(record);
  } catch (e) {
    next(e);
  }
});

router.post('/:id/undo', authMiddleware, async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Neautorizováno.' });
  const { historyIndex } = req.body;
  if (typeof historyIndex !== 'number') return res.status(400).json({ error: 'Chybí index historie.' });
  try {
    const record = await ServiceRecord.findOne({ _id: req.params.id, userId: req.user!.id });
    if (!record) return res.status(404).json({ error: 'Záznam nenalezen.' });
    const hist = record.history?.[historyIndex];
    if (!hist) return res.status(400).json({ error: 'Historie nenalezena.' });
    // Obnovení záznamu do stavu před změnami
    for (const key in hist.changes) {
      (record as any)[key] = hist.changes[key].from;
    }
    // Odstranění historie pomocí splice (Mongoose DocumentArray)
    if (Array.isArray(record.history) && typeof record.history.splice === 'function') {
      record.history.splice(historyIndex, 1);
    }
    await record.save();
    res.json(record);
  } catch (e) {
    next(e);
  }
});

// Endpoint pro získání historie změn servisního záznamu
router.get('/:id/history', authMiddleware, async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Neautorizováno.' });
  try {
    const record = await ServiceRecord.findOne({ _id: req.params.id, userId: req.user!.id }).populate('history.author', 'name email');
    if (!record) return res.status(404).json({ error: 'Záznam nenalezen.' });
    res.json(record.history || []);
  } catch (e) {
    next(e);
  }
});

export default router;
