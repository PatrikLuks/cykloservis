import mongoose from 'mongoose';

const bikeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  brand: { type: String },
  model: { type: String },
  year: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

export const Bike = mongoose.model('Bike', bikeSchema);
