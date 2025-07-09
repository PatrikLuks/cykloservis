import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import serviceRecordsRouter from './routes/serviceRecords';
import bikesRouter from './routes/bikes';
import userRouter from './routes/user';
import aiChatRouter from './routes/aiChat';
// import voiceflowChatRouter from './routes/voiceflowChat';
import knowledgeRouter from './routes/knowledge';
import mongoose from 'mongoose';
import { errorHandler } from './middleware/errorHandler';
import { auditMiddleware } from './middleware/auditMiddleware';
import auditLogRouter from './routes/auditLog';
import passwordRouter from './routes/password';
import shareRouter from './routes/share';
import serviceRouter from './routes/service';
import availabilityRouter from './routes/availability';
import reservationRouter from './routes/reservation';
import stravaRouter from './routes/strava';
import aiRouter from './routes/ai';
import { loginLimiter, registerLimiter, setPasswordLimiter } from './middleware/rateLimit';
import notificationRouter from './routes/notification';
import pushRouter from './routes/push'; // TS soubor existuje, ale chybí deklarace pro JS/TS
// Pokud používáte TypeScript, ujistěte se, že importujete .ts soubor a ne .js
// Pokud je projekt v čistém TypeScriptu, můžete bezpečně odstranit push.js nebo přidat deklaraci do push.d.ts
// Pokud potřebujete, můžete přidat deklaraci:
// declare module './routes/push';
import notificationPreferencesRouter from './routes/notificationPreferences';
import roleRouter from './routes/role';
import remindersRouter from './routes/reminders';

const app = express();

app.use(cors());
app.use(express.json());
app.use(auditMiddleware);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Healthcheck endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Vítejte v API cykloservisu!' });
});

// Chráněný endpoint (ukázka)
app.get('/api/protected', (req, res) => {
  res.json({ message: 'Chráněný obsah (JWT ověření řeší routery).' });
});

// Připojení routerů
app.use('/api/service-records', serviceRecordsRouter);
app.use('/api/bikes', bikesRouter);
app.use('/api', userRouter);
app.use('/api/ai-chat', aiChatRouter);
// app.use('/api/voiceflow-chat', upload.array('image', 5), voiceflowChatRouter);
app.use('/api/knowledge', knowledgeRouter);
app.use('/api/audit-logs', auditLogRouter);
app.use('/api', passwordRouter);
app.use('/api/share', shareRouter);
app.use('/api/services', serviceRouter);
app.use('/api/availability', availabilityRouter);
app.use('/api/reservation', reservationRouter);
app.use('/api/strava', stravaRouter);
app.use('/api/ai', aiRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/push', pushRouter);
app.use('/api/notification-preferences', notificationPreferencesRouter);
app.use('/api/roles', roleRouter);
app.use('/api/reminders', remindersRouter);

// Rate limiting middleware
app.use('/api/login', loginLimiter);
app.use('/api/register', registerLimiter);
app.use('/api/user/set-password', setPasswordLimiter);

// Endpoint pro upload fotky
app.post('/api/upload', upload.single('photo'), (req, res) => {
  const file = req.file as Express.Multer.File | undefined;
  if (!file) return res.status(400).json({ error: 'Soubor nebyl nahrán.' });
  res.json({ url: `/uploads/${file.filename}` });
});

// Endpoint pro upload více fotek
app.post('/api/upload-multiple', upload.array('photos', 10), (req, res) => {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'Soubor(y) nebyl(y) nahrán(y).' });
  }
  const urls = files.map((file) => `/uploads/${file.filename}`);
  res.json({ urls });
});

// Statické servírování nahraných fotek
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Globální error-handling middleware (musí být poslední)
app.use(errorHandler);

export const connectDb = async () => {
  const dbUri = process.env.NODE_ENV === 'test'
    ? (process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/cykloservis_test')
    : (process.env.MONGODB_URI || 'mongodb://localhost:27017/cykloservis');
  await mongoose.connect(dbUri);
};

export const disconnectDb = async () => {
  await mongoose.disconnect();
};

export default app;
