import { Router } from 'express';
import { User } from '../models/User';
import { requireAuth } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';

const router = Router();

// Změna role a práv uživatele (pouze owner)
router.put('/user/:id/role', requireAuth, requirePermission('manage_team'), async (req, res) => {
  const { id } = req.params;
  const { role, permissions } = req.body;
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ error: 'Uživatel nenalezen.' });
  if (role) user.role = role;
  if (permissions) user.permissions = permissions;
  await user.save();
  res.json({ success: true, user });
});

export default router;
