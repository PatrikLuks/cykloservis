import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId?: string;
  action: string;
  details?: any;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  userId: { type: String },
  action: { type: String, required: true },
  details: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
