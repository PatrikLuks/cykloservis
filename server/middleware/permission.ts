import { Request, Response, NextFunction } from 'express';

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    if (!user || !user.permissions || !user.permissions.includes(permission)) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění.' });
    }
    next();
  };
}
