import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app';

dotenv.config();

const port = process.env.PORT || 3001;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cykloservis', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as any).then(() => console.log('MongoDB připojeno')).catch(console.error);

app.listen(port, () => {
  console.log(`Server běží na http://localhost:${port}`);
});
