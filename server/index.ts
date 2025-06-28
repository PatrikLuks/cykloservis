import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'tajnytoken';

app.use(express.json());

// MongoDB model uživatele
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

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

app.listen(port, () => {
  console.log(`Server běží na http://localhost:${port}`);
});
