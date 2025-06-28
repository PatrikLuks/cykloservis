import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { User } from './models/User';
import { ServiceRecord } from './models/ServiceRecord';
import { Bike } from './models/Bike';
import { Request as ExpressRequest } from 'express';

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'tajnytoken';

app.use(cors());
app.use(express.json());

// Nastavení úložiště pro fotky
const storage = multer.diskStorage({
  destination: (req: ExpressRequest, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req: ExpressRequest, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});
const upload = multer({ storage });

mongoose.connect('mongodb://localhost:27017/cykloservis', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as any).then(() => console.log('MongoDB připojeno')).catch(console.error);

app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Vyplňte všechna pole.' });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: 'Neplatný e-mail.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Heslo musí mít alespoň 6 znaků.' });
  }
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Uživatel již existuje.' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash, name });
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Registrace proběhla úspěšně.', token, name: user.name });
  } catch (e) {
    res.status(500).json({ error: 'Chyba serveru.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Vyplňte všechna pole.' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Neplatné přihlašovací údaje.' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Neplatné přihlašovací údaje.' });
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Přihlášení úspěšné.', token, name: user.name });
  } catch (e) {
    res.status(500).json({ error: 'Chyba serveru.' });
  }
});

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Vítejte v API cykloservisu!' });
});

// JWT middleware pro ochranu endpointů
function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Chybí nebo je neplatný token.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    (req as any).user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Neplatný nebo expirovaný token.' });
  }
}

// Chráněný endpoint (ukázka)
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: `Toto je chráněný obsah pro uživatele: ${(req as any).user.email}` });
});

// CRUD endpointy pro servisní knihu
app.get('/api/service-records', authMiddleware, async (req, res) => {
  try {
    const { from, to, q, bikeModel, bikeBrand } = req.query;
    const filter: any = { userId: (req as any).user.id };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from as string);
      if (to) filter.date.$lte = new Date(to as string);
    }
    if (bikeModel) filter.bikeModel = bikeModel;
    if (bikeBrand) filter.bikeBrand = bikeBrand;
    if (q) {
      filter.$or = [
        { description: { $regex: q, $options: 'i' } },
        { notes: { $regex: q, $options: 'i' } }
      ];
    }
    const records = await ServiceRecord.find(filter).sort({ date: -1 });
    res.json(records);
  } catch (e) {
    res.status(500).json({ error: 'Chyba serveru.' });
  }
});

app.post('/api/service-records', authMiddleware, async (req, res) => {
  const { date, description, photos, notes, bikeModel, bikeBrand, reminder, bikeId, price, serviceType } = req.body;
  if (!date || !description) {
    return res.status(400).json({ error: 'Vyplňte datum a popis.' });
  }
  try {
    const record = await ServiceRecord.create({
      userId: (req as any).user.id,
      date,
      description,
      photos: photos || [],
      notes,
      bikeModel,
      bikeBrand,
      reminder: !!reminder,
      bikeId,
      price,
      serviceType
    });
    res.status(201).json(record);
  } catch (e) {
    res.status(500).json({ error: 'Chyba serveru.' });
  }
});

app.put('/api/service-records/:id', authMiddleware, async (req, res) => {
  try {
    const record = await ServiceRecord.findOneAndUpdate(
      { _id: req.params.id, userId: (req as any).user.id },
      req.body,
      { new: true, context: { userId: (req as any).user.id } as any }
    );
    if (!record) return res.status(404).json({ error: 'Záznam nenalezen.' });
    res.json(record);
  } catch (e) {
    res.status(500).json({ error: 'Chyba serveru.' });
  }
});

app.delete('/api/service-records/:id', authMiddleware, async (req, res) => {
  try {
    const record = await ServiceRecord.findOneAndDelete({ _id: req.params.id, userId: (req as any).user.id });
    if (!record) return res.status(404).json({ error: 'Záznam nenalezen.' });
    res.json({ message: 'Záznam byl smazán.' });
  } catch (e) {
    res.status(500).json({ error: 'Chyba serveru.' });
  }
});

// Endpoint pro upload fotky
app.post('/api/upload', authMiddleware, upload.single('photo'), (req, res) => {
  const file = req.file as Express.Multer.File | undefined;
  if (!file) return res.status(400).json({ error: 'Soubor nebyl nahrán.' });
  res.json({ url: `/uploads/${file.filename}` });
});

// Endpoint pro upload více fotek
app.post('/api/upload-multiple', authMiddleware, upload.array('photos', 10), (req, res) => {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'Soubor(y) nebyl(y) nahrán(y).' });
  }
  const urls = files.map((file) => `/uploads/${file.filename}`);
  res.json({ urls });
});

// Statické servírování nahraných fotek
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Endpoint pro blížící se kontroly (remindery)
app.get('/api/service-reminders', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const in30days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const filter: any = {
      userId: (req as any).user.id,
      reminder: true,
      date: { $lte: in30days, $gte: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()) }
    };
    // Vrátí záznamy, kde je reminder aktivní a datum servisu je do 30 dnů od teď (výročí)
    const records = await ServiceRecord.find(filter).sort({ date: -1 });
    res.json(records);
  } catch (e) {
    res.status(500).json({ error: 'Chyba serveru.' });
  }
});

// Mazání jedné fotky ze servisního záznamu
app.delete('/api/service-records/:id/photo', authMiddleware, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Chybí URL fotky.' });
  try {
    const record = await ServiceRecord.findOne({ _id: req.params.id, userId: (req as any).user.id });
    if (!record) return res.status(404).json({ error: 'Záznam nenalezen.' });
    record.photos = record.photos.filter((p: string) => p !== url);
    await record.save();
    res.json(record);
  } catch (e) {
    res.status(500).json({ error: 'Chyba serveru.' });
  }
});

// Endpoint pro získání všech kol uživatele
app.get('/api/bikes', authMiddleware, async (req, res) => {
  try {
    const bikes = await Bike.find({ userId: (req as any).user.id });
    res.json(bikes);
  } catch (e) {
    res.status(500).json({ error: 'Chyba serveru.' });
  }
});

// CRUD endpointy pro kola
app.post('/api/bikes', authMiddleware, async (req, res) => {
  const { name, brand, model, year } = req.body;
  if (!name) return res.status(400).json({ error: 'Název kola je povinný.' });
  try {
    const bike = await Bike.create({ userId: (req as any).user.id, name, brand, model, year });
    res.status(201).json(bike);
  } catch (e) {
    res.status(500).json({ error: 'Chyba serveru.' });
  }
});

app.put('/api/bikes/:id', authMiddleware, async (req, res) => {
  try {
    const bike = await Bike.findOneAndUpdate(
      { _id: req.params.id, userId: (req as any).user.id },
      req.body,
      { new: true }
    );
    if (!bike) return res.status(404).json({ error: 'Kolo nenalezeno.' });
    res.json(bike);
  } catch (e) {
    res.status(500).json({ error: 'Chyba serveru.' });
  }
});

app.delete('/api/bikes/:id', authMiddleware, async (req, res) => {
  try {
    const bike = await Bike.findOneAndDelete({ _id: req.params.id, userId: (req as any).user.id });
    if (!bike) return res.status(404).json({ error: 'Kolo nenalezeno.' });
    res.json({ message: 'Kolo bylo smazáno.' });
  } catch (e) {
    res.status(500).json({ error: 'Chyba serveru.' });
  }
});

// Endpoint pro změnu hesla
app.post('/api/change-password', authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Vyplňte staré i nové heslo.' });
  try {
    const user = await User.findById((req as any).user.id);
    if (!user) return res.status(404).json({ error: 'Uživatel nenalezen.' });
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return res.status(401).json({ error: 'Staré heslo není správné.' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Nové heslo musí mít alespoň 6 znaků.' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Heslo bylo změněno.' });
  } catch (e) {
    res.status(500).json({ error: 'Chyba serveru.' });
  }
});
// Endpoint pro změnu profilu (jméno, e-mail)
app.put('/api/profile', authMiddleware, async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Vyplňte jméno i e-mail.' });
  try {
    const user = await User.findByIdAndUpdate((req as any).user.id, { name, email }, { new: true });
    if (!user) return res.status(404).json({ error: 'Uživatel nenalezen.' });
    res.json({ name: user.name, email: user.email });
  } catch (e) {
    res.status(500).json({ error: 'Chyba serveru.' });
  }
});
// Endpoint pro načtení profilu
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById((req as any).user.id);
    if (!user) return res.status(404).json({ error: 'Uživatel nenalezen.' });
    res.json({ name: user.name, email: user.email });
  } catch (e) {
    res.status(500).json({ error: 'Chyba serveru.' });
  }
});
// Endpoint pro vrácení změny zpět (undo)
app.post('/api/service-records/:id/undo', authMiddleware, async (req, res) => {
  const { historyIndex } = req.body;
  if (typeof historyIndex !== 'number') return res.status(400).json({ error: 'Chybí index historie.' });
  try {
    const record = await ServiceRecord.findOne({ _id: req.params.id, userId: (req as any).user.id });
    if (!record) return res.status(404).json({ error: 'Záznam nenalezen.' });
    const hist = record.history?.[historyIndex];
    if (!hist) return res.status(400).json({ error: 'Historie nenalezena.' });
    // Vrátit hodnoty zpět
    for (const key in hist.changes) {
      (record as any)[key] = hist.changes[key].from;
    }
    await record.save();
    res.json(record);
  } catch (e) {
    res.status(500).json({ error: 'Chyba serveru.' });
  }
});
// Oprava: populate autora v historii při načítání detailu záznamu
app.get('/api/service-records/:id', authMiddleware, async (req, res) => {
  try {
    const record = await ServiceRecord.findOne({ _id: req.params.id, userId: (req as any).user.id }).populate('history.author', 'name email');
    if (!record) return res.status(404).json({ error: 'Záznam nenalezen.' });
    res.json(record);
  } catch (e) {
    res.status(500).json({ error: 'Chyba serveru.' });
  }
});

app.listen(port, () => {
  console.log(`Server běží na http://localhost:${port}`);
});
