import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ServiceRecord } from '../models/ServiceRecord';
import { User } from '../models/User';
import { sendMail } from './mailer';
import { sendPushToUser } from './pushSender';

dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cykloservis');
  const now = new Date();
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  // Najdi servisní záznamy s reminder a datem v příštích 7 dnech
  const records = await ServiceRecord.find({ reminder: true, date: { $gte: now, $lte: in7days } });
  for (const rec of records) {
    const user = await User.findById(rec.userId);
    if (!user) continue;
    // E-mail
    if (user.email) {
      await sendMail({
        to: user.email,
        subject: 'Připomínka servisu kola',
        text: `Blíží se termín servisu vašeho kola: ${rec.description} dne ${new Date(rec.date).toLocaleDateString()}`
      });
    }
    // Push notifikace
    await sendPushToUser(user.id, {
      title: 'Připomínka servisu',
      body: `Blíží se termín servisu vašeho kola: ${rec.description} dne ${new Date(rec.date).toLocaleDateString()}`
    });
  }
  await mongoose.disconnect();
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
