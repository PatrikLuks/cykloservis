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
});

// Přidat hook pro aktualizaci updatedAt při změně
serviceRecordSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Hook pro ukládání historie změn včetně autora
serviceRecordSchema.pre('findOneAndUpdate', async function(next) {
  const update: Record<string, any> = this.getUpdate() as any;
  const record = await this.model.findOne(this.getQuery()) as Record<string, any> | null;
  const userId = (this as any).getOptions?.().context?.userId;
  if (record) {
    const changes: Record<string, any> = {};
    for (const key in update) {
      if (key !== 'updatedAt' && update[key] !== undefined && record[key] !== update[key]) {
        changes[key] = { from: record[key], to: update[key] };
      }
    }
    if (Object.keys(changes).length > 0) {
      this.set({
        $push: { history: { date: new Date(), changes, author: userId } },
        updatedAt: new Date()
      });
    } else {
      this.set({ updatedAt: new Date() });
    }
  }
  next();
});

export const ServiceRecord = mongoose.model('ServiceRecord', serviceRecordSchema);
