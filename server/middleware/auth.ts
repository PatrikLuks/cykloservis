import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Chybí token.' });
  const token = auth.split(' ')[1];
  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET || 'tajneheslo');
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ error: 'Uživatel nenalezen.' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Neplatný token.' });
  }
};

export const requireRole = (role: string) => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== role) return res.status(403).json({ error: 'Nedostatečná oprávnění.' });
  next();
};
