import { Request, Response, NextFunction } from 'express';

// Globální error-handling middleware
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Logování chyby
  if (process.env.NODE_ENV !== 'test') {
    console.error('Chyba:', err);
  }
  // ZOD validace
  if (err?.name === 'ZodError' || err?.errors) {
    return res.status(400).json({ error: 'Neplatná data', details: err.errors || err.issues });
  }
  // Mongoose validation error
  if (err?.name === 'ValidationError') {
    return res.status(400).json({ error: 'Chyba validace', details: err.errors });
  }
  // JWT error
  if (err?.name === 'JsonWebTokenError' || err?.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Neplatný nebo expirovaný token.' });
  }
  // Obecná chyba
  res.status(err.status || 500).json({
    error: err.message || 'Chyba serveru',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}
