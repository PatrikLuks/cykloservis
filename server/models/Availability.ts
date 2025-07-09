import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
  serviceman: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Availability = mongoose.model('Availability', availabilitySchema);
