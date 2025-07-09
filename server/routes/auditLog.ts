import express from 'express';
import AuditLog from '../models/AuditLog';

const router = express.Router();

// GET /api/audit-logs?userId=...&action=...&limit=...
router.get('/', async (req, res) => {
  const { userId, action, limit = 50, skip = 0, dateFrom, dateTo } = req.query;
  const query: any = {};
  if (userId) query.userId = userId;
  if (action) query.action = { $regex: action, $options: 'i' };
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom as string);
    if (dateTo) query.createdAt.$lte = new Date(dateTo as string + 'T23:59:59');
  }
  const total = await AuditLog.countDocuments(query);
  const logs = await AuditLog.find(query).sort({ createdAt: -1 }).skip(Number(skip)).limit(Number(limit));
  res.json({ logs, total });
});

export default router;
