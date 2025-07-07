import mongoose, { Schema, Document } from 'mongoose';

export interface IShareToken extends Document {
  userId: string;
  bikeId?: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
}

const ShareTokenSchema = new Schema<IShareToken>({
  userId: { type: String, required: true },
  bikeId: { type: String },
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

export default mongoose.model<IShareToken>('ShareToken', ShareTokenSchema);
