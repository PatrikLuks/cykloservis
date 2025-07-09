import { Router } from 'express';
import { Bike } from '../models/Bike';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { bikeSchema, bikeUpdateSchema, validateBody } from '../validation';

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

// Pomocná funkce pro převod Mongoose dokumentu na FE-friendly objekt
function toBikeResponse(bike: any) {
  if (!bike) return bike;
  const obj = bike.toObject ? bike.toObject() : bike;
  return {
    id: obj._id?.toString?.() || obj.id,
    userId: obj.userId?.toString?.() || '',
    name: obj.name,
    brand: obj.brand,
    model: obj.model,
    year: obj.year,
    createdAt: obj.createdAt,
  };
}

// Endpoint pro získání všech kol uživatele
router.get('/', authMiddleware, async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Neautorizováno.' });
  try {
    const bikes = await Bike.find({ userId: req.user.id });
    res.json(bikes.map(toBikeResponse));
  } catch (e) {
    next(e);
  }
});

// CRUD endpointy pro kola
router.post('/', authMiddleware, validateBody(bikeSchema), async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Neautorizováno.' });
  const { name, brand, model, year } = req.body;
  try {
    const bike = await Bike.create({ userId: req.user.id, name, brand, model, year });
    res.status(201).json(toBikeResponse(bike));
  } catch (e) {
    next(e);
  }
});

router.put('/:id', authMiddleware, validateBody(bikeUpdateSchema), async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Neautorizováno.' });
  try {
    const bike = await Bike.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!bike) return res.status(404).json({ error: 'Kolo nenalezeno.' });
    res.json(toBikeResponse(bike));
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Neautorizováno.' });
  try {
    const bike = await Bike.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!bike) return res.status(404).json({ error: 'Kolo nenalezeno.' });
    res.json({ message: 'Kolo bylo smazáno.', id: bike._id.toString() });
  } catch (e) {
    next(e);
  }
});

export default router;
