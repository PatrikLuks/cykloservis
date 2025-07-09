import express, { Request, Response } from 'express';
import { Reservation } from '../models/Reservation';
import { requireAuth } from '../middleware/auth';
import { sendMail } from '../utils/mailer';
import Notification from '../models/Notification';
import { createAndSendNotification } from './notification';

const router = express.Router();

// Vytvoření rezervace (pouze zákazník)
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user || user.role !== 'customer') return res.status(403).json({ error: 'Pouze zákazník může rezervovat.' });
  const { serviceman, service, start, end, note } = req.body;
  if (!serviceman || !service || !start || !end) return res.status(400).json({ error: 'Chybí povinné údaje.' });
  const reservation = await Reservation.create({ customer: user.id, serviceman, service, start, end, note });
  // Uložit notifikace do DB
  try {
    await Notification.create({
      userId: serviceman,
      type: 'reservation',
      message: `Nová rezervace od zákazníka na termín ${new Date(start).toLocaleString()} - ${new Date(end).toLocaleString()}.`,
    });
    await Notification.create({
      userId: user.id,
      type: 'reservation',
      message: `Vaše rezervace u servisáka na termín ${new Date(start).toLocaleString()} - ${new Date(end).toLocaleString()} byla vytvořena.`,
    });
    // Příklad použití při nové rezervaci:
    // await createAndSendNotification({ userId, type: 'reservation', message: 'Máte novou rezervaci!' });
  } catch {}
  // Odeslat e-mail servisákovi a zákazníkovi (pokud mají e-mail)
  try {
    const [servicemanUser, customerUser] = await Promise.all([
      require('../models/User').User.findById(serviceman),
      require('../models/User').User.findById(user.id)
    ]);
    if (servicemanUser?.email) {
      await sendMail({
        to: servicemanUser.email,
        subject: 'Nová rezervace',
        text: `Byla vytvořena nová rezervace od zákazníka ${customerUser?.name || ''} na termín ${new Date(start).toLocaleString()} - ${new Date(end).toLocaleString()}.`
      });
    }
    if (customerUser?.email) {
      await sendMail({
        to: customerUser.email,
        subject: 'Potvrzení rezervace',
        text: `Vaše rezervace u servisáka ${servicemanUser?.name || ''} na termín ${new Date(start).toLocaleString()} - ${new Date(end).toLocaleString()} byla vytvořena.`
      });
    }
  } catch {}
  res.json(reservation);
});

// Získání rezervací pro servisáka nebo zákazníka
router.get('/user/:userId', requireAuth, async (req: Request, res: Response) => {
  const user = req.user as any;
  const { userId } = req.params;
  if (!user || String(user.id) !== String(userId)) return res.status(403).json({ error: 'Můžete zobrazit pouze své rezervace.' });
  const filter = user.role === 'serviceman' ? { serviceman: userId } : { customer: userId };
  const reservations = await Reservation.find(filter).populate('customer serviceman service');
  res.json(reservations);
});

// Změna stavu rezervace (pouze servisman)
router.post('/:id/status', requireAuth, async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user || user.role !== 'serviceman') return res.status(403).json({ error: 'Pouze servisák může měnit stav.' });
  const { id } = req.params;
  const { status } = req.body;
  const reservation = await Reservation.findById(id);
  if (!reservation) return res.status(404).json({ error: 'Rezervace nenalezena.' });
  if (String(reservation.serviceman) !== String(user.id)) return res.status(403).json({ error: 'Pouze vlastník může měnit stav.' });
  reservation.status = status;
  await reservation.save();
  res.json(reservation);
});

export default router;
