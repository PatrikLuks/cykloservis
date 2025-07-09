import mongoose from 'mongoose';

const bikeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  brand: { type: String },
  model: { type: String },
  year: { type: Number },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['OK', 'NOT_OK'], default: 'OK' },
  parts: { type: String },
  kilometers: { type: Number, min: 0 },
  serviceType: { type: String, enum: ['UVODNI', 'KOMPLEXNI', 'QUICK_FIX'], default: 'UVODNI' },
  quickFix: { type: Boolean, default: false }
});

export const Bike = mongoose.model('Bike', bikeSchema);
