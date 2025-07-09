import mongoose from 'mongoose';

const serviceRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  bikeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bike', index: true }, // připraveno pro více kol
  date: { type: Date, required: true },
  description: { type: String, required: true },
  photos: [{ type: String }],
  notes: { type: String },
  bikeModel: { type: String },
  bikeBrand: { type: String },
  reminder: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  price: { type: Number },
  serviceType: { type: String },
  updatedAt: { type: Date },
  history: [{
    date: { type: Date, required: true },
    changes: { type: Object, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
  recordType: { type: String, enum: ['údržba', 'oprava', 'upgrade', 'garanční servis', 'jiné'], default: 'údržba' },
  status: { type: String, enum: ['nový', 'čeká na díly', 'probíhá', 'hotovo', 'předáno', 'reklamace'], default: 'nový' },
  quickFix: { type: Boolean, default: false },
  durationMinutes: { type: Number, min: 0 },
  repairStart: { type: Date }, // Začátek opravy (volitelné)
  timingType: { type: String, enum: ['manual', 'auto'], default: 'manual' }, // Typ měření času
});

// Přidat hook pro aktualizaci updatedAt při změně
serviceRecordSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

export const ServiceRecord = mongoose.model('ServiceRecord', serviceRecordSchema);
