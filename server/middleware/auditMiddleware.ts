import { Request, Response, NextFunction } from 'express';
import AuditLog from '../models/AuditLog';

export const auditMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Logujeme jen důležité akce (POST, PUT, DELETE, uploady, AI chat, servisní kniha)
  const auditActions = ['POST', 'PUT', 'DELETE'];
  if (auditActions.includes(req.method) || req.path.includes('ai-chat') || req.path.includes('voiceflow-chat') || req.path.includes('service-records')) {
    const userId = req.body.userId || req.headers['x-user-id'] || undefined;
    await AuditLog.create({
      userId,
      action: `${req.method} ${req.path}`,
      details: {
        body: req.body,
        query: req.query,
        params: req.params,
        ip: req.ip,
      },
    });
  }
  next();
};
