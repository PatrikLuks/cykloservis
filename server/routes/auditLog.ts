import express from 'express';
import AuditLog from '../models/AuditLog';

const router = express.Router();

// GET /api/audit-logs?userId=...&action=...&limit=...
router.get('/', async (req, res) => {
  const { userId, action, limit = 50 } = req.query;
  const query: any = {};
  if (userId) query.userId = userId;
  if (action) query.action = { $regex: action, $options: 'i' };
  const logs = await AuditLog.find(query).sort({ createdAt: -1 }).limit(Number(limit));
  res.json(logs);
});

export default router;
