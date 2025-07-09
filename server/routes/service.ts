import express, { Request, Response, NextFunction } from 'express';
import { Service } from '../models/Service';
import { User } from '../models/User';
import { requireAuth } from '../middleware/auth';
import { sendMail } from '../utils/mailer';
import Notification from '../models/Notification';

const router = express.Router();

// Pomocná funkce pro kontrolu vlastnictví servisu
async function checkOwner(req: Request, res: Response, next: NextFunction) {
  const { serviceId } = req.params;
  const user = req.user as any;
  const service = await Service.findById(serviceId || req.body.serviceId || req.body.ownerId);
  if (!service) return res.status(404).json({ error: 'Servis nenalezen.' });
  if (String(service.owner) !== String(user.id)) return res.status(403).json({ error: 'Pouze majitel servisu může tuto akci provést.' });
  next();
}

// Vytvoření nového servisu (pouze owner)
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const { name, address } = req.body;
  const ownerId = (req.user as any).id;
  if (!name) return res.status(400).json({ error: 'Chybí název.' });
  const service = await Service.create({ name, address, owner: ownerId, servicemen: [ownerId] });
  await User.findByIdAndUpdate(ownerId, { $addToSet: { services: service._id }, role: 'owner' });
  res.json(service);
});

// Získání všech servisů (pro admina, demo: všichni)
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const services = await Service.find().populate('owner', 'name email').populate('servicemen', 'name email');
  res.json(services);
});

// Přidání servisáka do servisu (pouze owner)
router.post('/:serviceId/add-serviceman', requireAuth, checkOwner, async (req: Request, res: Response) => {
  const { userId } = req.body;
  const { serviceId } = req.params;
  if (!userId) return res.status(400).json({ error: 'Chybí userId.' });
  await Service.findByIdAndUpdate(serviceId, { $addToSet: { servicemen: userId } });
  await User.findByIdAndUpdate(userId, { $addToSet: { services: serviceId }, role: 'serviceman' });
  res.json({ success: true });
});

// Odebrání servisáka ze servisu (pouze owner)
router.post('/:serviceId/remove-serviceman', requireAuth, checkOwner, async (req: Request, res: Response) => {
  const { userId } = req.body;
  const { serviceId } = req.params;
  if (!userId) return res.status(400).json({ error: 'Chybí userId.' });
  await Service.findByIdAndUpdate(serviceId, { $pull: { servicemen: userId } });
  await User.findByIdAndUpdate(userId, { $pull: { services: serviceId } });
  res.json({ success: true });
});

// Získání servisů pro uživatele
router.get('/user/:userId', requireAuth, async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (String((req.user as any).id) !== String(userId)) return res.status(403).json({ error: 'Můžete zobrazit pouze své servisy.' });
  const user = await User.findById(userId).populate({ path: 'services', populate: { path: 'owner servicemen', select: 'name email' } });
  if (!user) return res.status(404).json({ error: 'Uživatel nenalezen.' });
  res.json(user.services);
});

// Pozvání nového servisáka (pouze owner) – vytvoří uživatele s rolí serviceman, pošle e-mail (TODO)
router.post('/:serviceId/invite-serviceman', requireAuth, checkOwner, async (req: Request, res: Response) => {
  const { email, name } = req.body;
  const { serviceId } = req.params;
  if (!email || !name) return res.status(400).json({ error: 'Chybí e-mail nebo jméno.' });
  let user = await User.findOne({ email });
  if (user) {
    // Pokud už existuje, jen přiřadit do servisu
    await Service.findByIdAndUpdate(serviceId, { $addToSet: { servicemen: user._id } });
    await User.findByIdAndUpdate(user._id, { $addToSet: { services: serviceId }, role: 'serviceman' });
    // Notifikace
    await Notification.create({
      userId: user._id,
      type: 'invite',
      message: `Byl(a) jste přidán(a) do týmu servisu.`,
    });
    return res.json({ success: true, user, info: 'Uživatel již existoval, byl přiřazen do servisu.' });
  }
  // Vytvořit nového uživatele bez hesla (musí si nastavit při prvním přihlášení)
  user = await User.create({ email, name, role: 'serviceman', services: [serviceId], password: '' });
  await Service.findByIdAndUpdate(serviceId, { $addToSet: { servicemen: user._id } });
  // Notifikace
  await Notification.create({
    userId: user._id,
    type: 'invite',
    message: `Byl(a) jste pozván(a) do týmu servisu. Pro aktivaci účtu si nastavte heslo.`,
  });
  // Odeslat e-mail s pozvánkou a odkazem na nastavení hesla
  try {
    await sendMail({
      to: email,
      subject: 'Pozvánka do týmu Cykloservis',
      text: `Dobrý den, byl(a) jste pozván(a) do týmu servisu. Pro aktivaci účtu si nastavte heslo na stránce aplikace Cykloservis pomocí svého e-mailu.`
    });
  } catch {}
  res.json({ success: true, user, info: 'Uživatel byl pozván.' });
});

export default router;
