import express, { Request, Response } from 'express';
import { Availability } from '../models/Availability';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// Vytvoření dostupnosti (pouze servisman)
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user || user.role !== 'serviceman') return res.status(403).json({ error: 'Pouze servisák může nastavovat dostupnost.' });
  const { start, end } = req.body;
  if (!start || !end) return res.status(400).json({ error: 'Chybí začátek nebo konec.' });
  const availability = await Availability.create({ serviceman: user.id, start, end });
  res.json(availability);
});

// Získání dostupnosti pro servisáka
router.get('/:servicemanId', requireAuth, async (req: Request, res: Response) => {
  const { servicemanId } = req.params;
  const slots = await Availability.find({ serviceman: servicemanId }).sort({ start: 1 });
  res.json(slots);
});

// Smazání dostupnosti (pouze vlastník)
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as any;
  const slot = await Availability.findById(id);
  if (!slot) return res.status(404).json({ error: 'Slot nenalezen.' });
  if (!user || String(slot.serviceman) !== String(user.id)) return res.status(403).json({ error: 'Pouze vlastník může mazat.' });
  await slot.deleteOne();
  res.json({ success: true });
});

export default router;
